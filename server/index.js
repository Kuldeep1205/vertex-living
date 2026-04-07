import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import twilio from 'twilio';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import multer from 'multer';
import adminRouter from './admin.js';
import rentalRouter from './rental.js';

dotenv.config({ path: '../.env' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);

// WebSocket server specifically for Twilio media streams
const wss = new WebSocketServer({ server, path: '/media-stream' });

app.use(cors({
  origin: [
    'https://vertexliving.netlify.app',
    'http://localhost:3000',
    'http://localhost:5173',
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/admin', adminRouter);
app.use('/api/rental', rentalRouter);

// ─── File Upload Setup (multer) ──────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB per file
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only JPG and PDF files are allowed'));
  },
});

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PORT = process.env.PORT || 5000;

const openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN  = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'; // Twilio sandbox default
let twilioClient = null;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

// ─── File helpers ───────────────────────────────────────────────────────────

const CALLS_FILE = path.join(__dirname, 'calls.json');
const CONFIG_FILE = path.join(__dirname, 'config.json');
const USERS_FILE  = path.join(__dirname, 'data', 'users.json');

function loadJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

const WA_FILE = path.join(__dirname, 'whatsapp.json');

let calls = loadJSON(CALLS_FILE, []);
let aiConfig = loadJSON(CONFIG_FILE, {});
let waConversations = loadJSON(WA_FILE, {}); // { phoneNumber: [{role, content, time}] }

// Active calls in memory
const activeCalls = new Map();

// ─── Email OTP System ────────────────────────────────────────────────────────

// In-memory OTP store: { email -> { otp, expiresAt, attempts } }
const otpStore = new Map();

const OTP_EXPIRY_MS  = 10 * 60 * 1000;  // 10 minutes
const MAX_ATTEMPTS   = 5;
const OTP_RESEND_GAP = 60 * 1000;       // 1 minute between resends

// Create Gmail transporter (lazy — only if credentials set)
function getMailTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass || user.includes('aapki.gmail')) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ─── Register / Login ────────────────────────────────────────────────────────

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }
  const users = loadJSON(USERS_FILE, []);
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase().trim())) {
    return res.status(400).json({ error: 'This email is already registered.' });
  }
  const allowedRoles = ['buyer', 'builder'];
  const userRole = allowedRoles.includes(role) ? role : 'buyer';
  const newUser = {
    id: Date.now(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    phone: phone?.trim() || '',
    role: userRole,
    avatar: name.trim()[0].toUpperCase(),
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveJSON(USERS_FILE, users);
  const { password: _pw, ...session } = newUser;
  res.json({ success: true, user: session });
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  const users = loadJSON(USERS_FILE, []);
  const found = users.find(
    u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
  );
  if (!found) return res.status(401).json({ error: 'Invalid email or password.' });
  const { password: _pw, ...session } = found;
  res.json({ success: true, user: session });
});

// POST /api/builder/list-property  → saves to pending_properties.json (NOT live yet)
app.post('/api/builder/list-property', (req, res) => {
  const { userId, name, developer, location, sector, type, bedrooms, price,
          priceDisplay, area, status, description, photos, city, builderId } = req.body;
  if (!name || !location || !price) {
    return res.status(400).json({ error: 'Project name, location and price are required.' });
  }
  const PENDING_FILE = path.join(__dirname, 'data', 'pending_properties.json');
  const pending = loadJSON(PENDING_FILE, []);
  const newProp = {
    id: Date.now(),
    name: name.trim(),
    developer: developer?.trim() || '',
    location: location.trim(),
    sector: sector?.trim() || '',
    city: city || 'Gurgaon',
    type: type || 'Apartment',
    bedrooms: Number(bedrooms) || 3,
    price: parseFloat(price) || 0,
    priceDisplay: priceDisplay?.trim() || `₹${price} Cr`,
    area: area?.trim() || '',
    status: status || 'Under Construction',
    description: description?.trim() || '',
    photos: Array.isArray(photos) ? photos : [],
    builderId: builderId || userId || null,
    listedAt: new Date().toISOString(),
    approvalStatus: 'pending',
  };
  pending.push(newProp);
  saveJSON(PENDING_FILE, pending);
  res.json({ success: true, property: newProp });
});

// POST /api/builder/register — saves builder registration (from BuilderCTA form)
const BUILDER_REGS_FILE = path.join(__dirname, 'data', 'builder_registrations.json');
app.post('/api/builder/register', (req, res) => {
  const { companyName, contactName, phone, email, reraNumber, projectName, city, message, userId, attachments } = req.body;
  if (!companyName || !contactName || !phone || !email || !reraNumber || !projectName) {
    return res.status(400).json({ error: 'All required fields must be filled.' });
  }
  const regs = loadJSON(BUILDER_REGS_FILE, []);
  const existing = regs.find(r => r.reraNumber === reraNumber.trim());
  if (existing) return res.status(400).json({ error: 'This RERA number is already registered.' });
  const reg = {
    id: Date.now(),
    companyName: companyName.trim(),
    contactName: contactName.trim(),
    phone: phone.trim(),
    email: email.toLowerCase().trim(),
    reraNumber: reraNumber.trim(),
    projectName: projectName.trim(),
    city: city?.trim() || '',
    message: message?.trim() || '',
    userId: userId || null,
    attachments: Array.isArray(attachments) ? attachments : [],
    status: 'pending',
    submittedAt: new Date().toISOString(),
  };
  regs.push(reg);
  saveJSON(BUILDER_REGS_FILE, regs);
  res.json({ success: true, registration: reg });
});

// GET /api/admin/builder-registrations — for admin panel
app.get('/api/admin/builder-registrations', (req, res) => {
  const regs = loadJSON(BUILDER_REGS_FILE, []);
  res.json([...regs].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)));
});

// PATCH /api/admin/builder-registrations/:id — update status
app.patch('/api/admin/builder-registrations/:id', (req, res) => {
  const regs = loadJSON(BUILDER_REGS_FILE, []);
  const idx = regs.findIndex(r => String(r.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  regs[idx] = { ...regs[idx], ...req.body };
  saveJSON(BUILDER_REGS_FILE, regs);
  res.json(regs[idx]);
});

// POST /api/builder/contact-lead — saves "Contact Builder" enquiries
const BUILDER_LEADS_FILE = path.join(__dirname, 'data', 'builder_leads.json');
app.post('/api/builder/contact-lead', (req, res) => {
  const { clientName, clientPhone, clientEmail, clientMessage,
          propertyId, propertyName, propertyPrice, propertyConfig,
          propertyLocation, propertyStatus, propertyRera,
          builderName } = req.body;
  if (!clientName || !clientPhone) {
    return res.status(400).json({ error: 'Name and phone are required.' });
  }
  const leads = loadJSON(BUILDER_LEADS_FILE, []);
  const lead = {
    id: Date.now(),
    // Client info
    clientName:    clientName.trim(),
    clientPhone:   clientPhone.trim(),
    clientEmail:   clientEmail?.trim() || '',
    clientMessage: clientMessage?.trim() || '',
    // Property info
    propertyId:       propertyId || null,
    propertyName:     propertyName?.trim() || '',
    propertyPrice:    propertyPrice?.trim() || '',
    propertyConfig:   propertyConfig?.trim() || '',
    propertyLocation: propertyLocation?.trim() || '',
    propertyStatus:   propertyStatus?.trim() || '',
    propertyRera:     propertyRera?.trim() || '',
    // Builder info
    builderName:  builderName?.trim() || '',
    // Meta
    status:    'new',   // new | contacted | closed
    createdAt: new Date().toISOString(),
  };
  leads.push(lead);
  saveJSON(BUILDER_LEADS_FILE, leads);
  console.log(`[Lead] ${clientName} interested in "${propertyName}" by ${builderName}`);
  res.json({ success: true, lead });
});

// GET /api/admin/builder-leads — admin view
app.get('/api/admin/builder-leads', (req, res) => {
  const leads = loadJSON(BUILDER_LEADS_FILE, []);
  res.json([...leads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// PATCH /api/admin/builder-leads/:id — update status
app.patch('/api/admin/builder-leads/:id', (req, res) => {
  const leads = loadJSON(BUILDER_LEADS_FILE, []);
  const idx = leads.findIndex(l => String(l.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  leads[idx] = { ...leads[idx], ...req.body };
  saveJSON(BUILDER_LEADS_FILE, leads);
  res.json(leads[idx]);
});

// POST /api/builder/upload-files — handles JPG/PDF upload for property listings
app.post('/api/builder/upload-files', upload.array('files', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded.' });
  }
  const urls = req.files.map(f => `/uploads/${f.filename}`);
  res.json({ success: true, urls });
});

// POST /api/auth/send-otp   body: { email }
app.post('/api/auth/send-otp', async (req, res) => {
  const email = (req.body.email || '').toLowerCase().trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required.' });
  }

  // Rate-limit: prevent spam resend
  const existing = otpStore.get(email);
  if (existing && Date.now() - (existing.sentAt || 0) < OTP_RESEND_GAP) {
    const wait = Math.ceil((OTP_RESEND_GAP - (Date.now() - existing.sentAt)) / 1000);
    return res.status(429).json({ error: `Please wait ${wait}s before requesting another OTP.` });
  }

  const otp = generateOTP();
  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    sentAt: Date.now(),
    attempts: 0,
    verified: false,
  });

  // Auto-cleanup after expiry
  setTimeout(() => {
    const entry = otpStore.get(email);
    if (entry && !entry.verified) otpStore.delete(email);
  }, OTP_EXPIRY_MS + 5000);

  const transporter = getMailTransporter();

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Vertex Living" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Your Vertex Living Verification Code',
        html: `
          <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;background:#0c0d15;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#6366f1,#7c3aed);padding:32px 40px;text-align:center">
              <div style="display:inline-flex;align-items:center;gap:10px">
                <div style="width:40px;height:40px;background:rgba(255,255,255,0.2);border-radius:10px;display:flex;align-items:center;justify-content:center">
                  🏠
                </div>
                <span style="font-size:1.3rem;font-weight:800;color:#fff;letter-spacing:-0.02em">Vertex Living</span>
              </div>
            </div>
            <!-- Body -->
            <div style="padding:36px 40px">
              <h2 style="color:#f1f5f9;font-size:1.25rem;font-weight:700;margin:0 0 8px">Email Verification</h2>
              <p style="color:#64748b;font-size:0.9rem;line-height:1.6;margin:0 0 28px">
                Please use the code below to verify your email address and complete your registration.
              </p>
              <!-- OTP Box -->
              <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:12px;padding:28px;text-align:center;margin-bottom:28px">
                <div style="color:#94a3b8;font-size:0.75rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px">Your Verification Code</div>
                <div style="font-size:2.8rem;font-weight:800;letter-spacing:0.3em;color:#f1f5f9;font-family:'Courier New',monospace">${otp}</div>
                <div style="color:#475569;font-size:0.78rem;margin-top:12px">⏱ Valid for 10 minutes only</div>
              </div>
              <p style="color:#334155;font-size:0.8rem;line-height:1.6;margin:0">
                If you did not request this, please ignore this email. Do not share this code with anyone.
              </p>
            </div>
            <!-- Footer -->
            <div style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.05);text-align:center">
              <p style="color:#1e293b;font-size:0.72rem;margin:0">© 2025 Vertex Living · Premium Real Estate in Gurugram</p>
            </div>
          </div>
        `,
      });
      console.log(`[OTP] Sent to ${email}: ${otp}`);
      return res.json({ success: true, message: 'OTP sent to your email.' });
    } catch (err) {
      console.error('[OTP] Email send failed:', err.message);
      // Fall through to dev mode
    }
  }

  // Dev/Demo mode — log OTP to console (when email not configured)
  console.log(`\n[OTP DEV MODE] Email: ${email}  OTP: ${otp}\n`);
  return res.json({
    success: true,
    message: 'OTP sent! (Dev mode: check server console)',
    _devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
  });
});

// POST /api/auth/verify-otp   body: { email, otp }
app.post('/api/auth/verify-otp', (req, res) => {
  const email = (req.body.email || '').toLowerCase().trim();
  const otp   = (req.body.otp || '').trim();

  const entry = otpStore.get(email);

  if (!entry) {
    return res.status(400).json({ error: 'No OTP found. Please request a new code.' });
  }
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ error: 'OTP has expired. Please request a new code.' });
  }
  if (entry.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(email);
    return res.status(429).json({ error: 'Too many incorrect attempts. Please request a new code.' });
  }

  entry.attempts++;

  if (entry.otp !== otp) {
    const left = MAX_ATTEMPTS - entry.attempts;
    return res.status(400).json({ error: `Incorrect code. ${left} attempt${left === 1 ? '' : 's'} remaining.` });
  }

  // Success — mark verified and clean up
  entry.verified = true;
  otpStore.delete(email);

  return res.json({ success: true, message: 'Email verified successfully!' });
});

// ─── REST API ────────────────────────────────────────────────────────────────

app.get('/api/stats', (req, res) => {
  const today = new Date().toDateString();
  const todayCalls = calls.filter(c => new Date(c.startTime).toDateString() === today);
  const completed = calls.filter(c => c.status === 'completed');
  const avgDuration =
    completed.length > 0
      ? Math.round(completed.reduce((a, c) => a + (c.duration || 0), 0) / completed.length)
      : 0;

  res.json({
    totalCalls: calls.length,
    todayCalls: todayCalls.length,
    activeCalls: activeCalls.size,
    avgDuration,
    successRate:
      calls.length > 0 ? Math.round((completed.length / calls.length) * 100) : 0,
  });
});

app.get('/api/calls', (req, res) => {
  const sorted = [...calls].sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  res.json(sorted.slice(0, 100));
});

app.get('/api/calls/:id', (req, res) => {
  const call = calls.find(c => c.id === req.params.id);
  if (!call) return res.status(404).json({ error: 'Not found' });
  res.json(call);
});

app.get('/api/active-calls', (req, res) => {
  const active = Array.from(activeCalls.values()).map(c => ({
    id: c.id,
    from: c.from,
    to: c.to,
    startTime: c.startTime,
    duration: Math.round((Date.now() - new Date(c.startTime).getTime()) / 1000),
  }));
  res.json(active);
});

app.get('/api/config', (req, res) => res.json(aiConfig));

app.post('/api/config', (req, res) => {
  aiConfig = { ...aiConfig, ...req.body };
  saveJSON(CONFIG_FILE, aiConfig);
  res.json({ success: true, config: aiConfig });
});

// ─── WhatsApp Conversations API ──────────────────────────────────────────────

app.get('/api/whatsapp-conversations', (req, res) => {
  const list = Object.entries(waConversations).map(([phone, messages]) => ({
    phone,
    lastMessage: messages[messages.length - 1] || null,
    messageCount: messages.length,
  }));
  list.sort((a, b) => new Date(b.lastMessage?.time || 0) - new Date(a.lastMessage?.time || 0));
  res.json(list);
});

app.get('/api/whatsapp-conversations/:phone', (req, res) => {
  const phone = decodeURIComponent(req.params.phone);
  res.json(waConversations[phone] || []);
});

// ─── WhatsApp Incoming Message Webhook ───────────────────────────────────────

app.post('/whatsapp-webhook', async (req, res) => {
  // Twilio sends form-encoded body
  const from    = req.body.From || '';   // e.g. whatsapp:+919876543210
  const body    = (req.body.Body || '').trim();
  const profile = req.body.ProfileName || '';

  if (!body) return res.sendStatus(200);

  const phone = from.replace('whatsapp:', '');
  console.log(`[WhatsApp] ${profile || phone}: ${body}`);

  // Load or create conversation history for this number
  if (!waConversations[phone]) waConversations[phone] = [];

  const history = waConversations[phone];

  // Add customer message
  history.push({ role: 'user', content: body, time: new Date().toISOString() });

  // Build OpenAI messages — keep last 20 messages for context
  const systemPrompt = `You are ${aiConfig.agentName || 'Rahul'}, a friendly and professional property advisor at ${aiConfig.businessName || 'Vertex Living'}, a premium real estate company in Gurugram.

Your job is to help customers over WhatsApp with:
- Property inquiries (price, availability, configurations)
- Scheduling site visits
- Project details and amenities
- Loan and documentation guidance
- Any other real estate questions

Important rules:
- You are a REAL HUMAN — never say you are an AI or bot under any circumstances
- Write casually and warmly, like a real sales advisor would on WhatsApp
- Use short paragraphs — WhatsApp messages should be easy to read
- Use emojis naturally (not too many)
- Address the customer by name if you know it
- If they ask about a specific project, give real helpful details
- If they want to visit, ask for their preferred time and confirm within the message
- Keep responses concise but complete — 3-6 lines max per message
- Speak in Hinglish (mix of Hindi and English) if the customer writes in Hinglish
- NEVER use formal/robotic language — always sound like a helpful friend who knows real estate`;

  const openaiMessages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-20).map(m => ({ role: m.role, content: m.content })),
  ];

  let replyText = '';
  try {
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o',
      messages: openaiMessages,
      max_tokens: 300,
      temperature: 0.85,
    });
    replyText = completion.choices[0]?.message?.content?.trim() || '';
  } catch (err) {
    console.error('[WhatsApp] OpenAI error:', err.message);
    replyText = `Hi! Thanks for reaching out to ${aiConfig.businessName || 'Vertex Living'} 🏠 I'll get back to you shortly!`;
  }

  // Save assistant reply to history
  history.push({ role: 'assistant', content: replyText, time: new Date().toISOString() });
  waConversations[phone] = history;
  saveJSON(WA_FILE, waConversations);

  console.log(`[WhatsApp] Reply to ${phone}: ${replyText}`);

  // Send reply via Twilio
  if (twilioClient) {
    try {
      await twilioClient.messages.create({
        from: TWILIO_WHATSAPP_FROM,
        to: from,
        body: replyText,
      });
    } catch (err) {
      console.error('[WhatsApp] Twilio send error:', err.message);
    }
  }

  // Always respond 200 to Twilio immediately
  res.sendStatus(200);
});

// ─── Twilio Incoming Call Webhook ────────────────────────────────────────────

app.post('/incoming-call', (req, res) => {
  const callSid = req.body.CallSid || `call_${Date.now()}`;
  const from = req.body.From || 'Unknown';
  const to = req.body.To || 'Unknown';

  const callRecord = {
    id: callSid,
    from,
    to,
    callerCity: req.body.CallerCity || '',
    callerState: req.body.CallerState || '',
    callerCountry: req.body.CallerCountry || '',
    callerName: req.body.CallerName || '',
    callDirection: req.body.Direction || 'inbound',
    startTime: new Date().toISOString(),
    endTime: null,
    status: 'active',
    duration: 0,
    totalMessages: 0,
    transcript: [],
  };

  calls.push(callRecord);
  activeCalls.set(callSid, callRecord);
  saveJSON(CALLS_FILE, calls);

  const host = req.headers.host;
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="wss://${host}/media-stream">
      <Parameter name="callSid" value="${callSid}" />
    </Stream>
  </Connect>
</Response>`;

  res.type('text/xml').send(twiml);
});

// ─── WebSocket Bridge: Twilio ↔ OpenAI Realtime ──────────────────────────────

wss.on('connection', (twilioWs) => {
  let openaiWs = null;
  let callSid = null;
  let streamSid = null;
  const transcript = [];

  function buildSystemPrompt() {
    return `You are ${aiConfig.agentName || 'an assistant'}, a professional customer service representative for ${aiConfig.businessName || 'our company'}, a ${aiConfig.businessType || 'business'}.

${aiConfig.systemPrompt || ''}

Critical rules:
- You are on a PHONE CALL — keep responses concise and conversational
- NEVER reveal you are an AI or a bot under any circumstances
- Speak naturally like a real human — use filler words occasionally ("of course", "absolutely", "let me check that for you")
- Be warm, empathetic, and professional
- Ask clarifying questions when needed
- If you cannot help, offer to take a message or transfer to a team member
- Do not use lists or bullet points — speak in natural sentences`;
  }

  function connectToOpenAI() {
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not set!');
      return;
    }

    openaiWs = new WebSocket(
      'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview',
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'realtime=v1',
        },
      }
    );

    openaiWs.on('open', () => {
      console.log(`[${callSid}] OpenAI Realtime connected`);

      // Configure the session
      openaiWs.send(
        JSON.stringify({
          type: 'session.update',
          session: {
            turn_detection: { type: 'server_vad', threshold: 0.5, silence_duration_ms: 700 },
            input_audio_format: 'g711_ulaw',
            output_audio_format: 'g711_ulaw',
            input_audio_transcription: { model: 'whisper-1' }, // customer ki baat text mein save ho
            voice: aiConfig.voice || 'alloy',
            instructions: buildSystemPrompt(),
            modalities: ['text', 'audio'],
            temperature: 0.8,
          },
        })
      );

      // Trigger the greeting
      openaiWs.send(
        JSON.stringify({
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: `A customer just called. Please greet them with: "${aiConfig.greeting || 'Hello, how can I help you today?'}"`,
              },
            ],
          },
        })
      );
      openaiWs.send(JSON.stringify({ type: 'response.create' }));
    });

    openaiWs.on('message', (raw) => {
      let event;
      try {
        event = JSON.parse(raw);
      } catch {
        return;
      }

      switch (event.type) {
        // Stream audio back to Twilio caller
        case 'response.audio.delta':
          if (event.delta && streamSid && twilioWs.readyState === WebSocket.OPEN) {
            twilioWs.send(
              JSON.stringify({
                event: 'media',
                streamSid,
                media: { payload: event.delta },
              })
            );
          }
          break;

        // Agent ki awaaz ka text — save karo
        case 'response.audio_transcript.done':
          if (event.transcript && event.transcript.trim()) {
            transcript.push({
              role: 'agent',
              text: event.transcript.trim(),
              time: new Date().toISOString(),
            });
            updateCallTranscript();
            console.log(`[${callSid}] Agent: ${event.transcript.trim()}`);
          }
          break;

        // response.done se bhi agent text milta hai (backup)
        case 'response.done':
          if (event.response?.output) {
            for (const item of event.response.output) {
              if (item.type === 'message' && item.role === 'assistant') {
                for (const part of item.content || []) {
                  if (part.type === 'audio' && part.transcript && part.transcript.trim()) {
                    // Already captured by audio_transcript.done — skip duplicate
                  } else if (part.type === 'text' && part.text && part.text.trim()) {
                    transcript.push({
                      role: 'agent',
                      text: part.text.trim(),
                      time: new Date().toISOString(),
                    });
                    updateCallTranscript();
                  }
                }
              }
            }
          }
          break;

        // Customer ki awaaz ka text — save karo
        case 'conversation.item.input_audio_transcription.completed':
          if (event.transcript && event.transcript.trim()) {
            transcript.push({
              role: 'customer',
              text: event.transcript.trim(),
              time: new Date().toISOString(),
            });
            updateCallTranscript();
            console.log(`[${callSid}] Customer: ${event.transcript.trim()}`);
          }
          break;

        case 'error':
          console.error(`[${callSid}] OpenAI error:`, event.error?.message || event.error);
          break;
      }
    });

    openaiWs.on('close', () => console.log(`[${callSid}] OpenAI Realtime disconnected`));
    openaiWs.on('error', err => console.error(`[${callSid}] OpenAI WS error:`, err.message));
  }

  function updateCallTranscript() {
    const record = activeCalls.get(callSid) || calls.find(c => c.id === callSid);
    if (record) {
      record.transcript = [...transcript];
      record.totalMessages = transcript.length;
      saveJSON(CALLS_FILE, calls);
    }
  }

  function endCall() {
    if (openaiWs && openaiWs.readyState === WebSocket.OPEN) openaiWs.close();

    const record = activeCalls.get(callSid);
    if (record) {
      record.status = 'completed';
      record.endTime = new Date().toISOString();
      record.duration = Math.round(
        (new Date(record.endTime).getTime() - new Date(record.startTime).getTime()) / 1000
      );
      record.transcript = [...transcript];
      record.totalMessages = transcript.length;
      activeCalls.delete(callSid);
      saveJSON(CALLS_FILE, calls);
      console.log(`[${callSid}] Call ended. Duration: ${record.duration}s | Messages: ${transcript.length}`);
    }
  }

  // Handle messages from Twilio
  twilioWs.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    switch (msg.event) {
      case 'connected':
        console.log('Twilio media stream connected');
        break;

      case 'start':
        streamSid = msg.start.streamSid;
        callSid = msg.start.customParameters?.callSid || msg.start.callSid;
        console.log(`[${callSid}] Media stream started`);
        connectToOpenAI();
        break;

      case 'media':
        // Forward caller audio to OpenAI
        if (openaiWs?.readyState === WebSocket.OPEN) {
          openaiWs.send(
            JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: msg.media.payload,
            })
          );
        }
        break;

      case 'stop':
        endCall();
        break;
    }
  });

  twilioWs.on('close', () => {
    if (callSid) endCall();
  });

  twilioWs.on('error', err => console.error('Twilio WS error:', err.message));
});

// ─── Razorpay Setup ──────────────────────────────────────────────────────────

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const BOOKINGS_FILE = path.join(__dirname, 'data', 'bookings.json');
const INVOICES_DIR  = path.join(__dirname, 'data', 'invoices');
if (!fs.existsSync(INVOICES_DIR)) fs.mkdirSync(INVOICES_DIR, { recursive: true });

function saveInvoiceFile(booking) {
  const html = generateInvoiceHTML(booking);
  const file = path.join(INVOICES_DIR, `${booking.id}.html`);
  fs.writeFileSync(file, html, 'utf8');
  return file;
}

// POST /api/payment/create-order
app.post('/api/payment/create-order', async (req, res) => {
  const { amount, currency = 'INR', propertyId, propertyName, userName, userEmail, userPhone } = req.body;
  if (!amount) return res.status(400).json({ error: 'Amount is required' });

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise mein
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        propertyId: String(propertyId || ''),
        propertyName: String(propertyName || ''),
        userName: String(userName || ''),
        userEmail: String(userEmail || ''),
        userPhone: String(userPhone || ''),
      },
    });
    res.json({ success: true, order });
  } catch (err) {
    console.error('[Razorpay] Order create error:', JSON.stringify(err));
    res.status(500).json({ error: err?.error?.description || err.message || 'Failed to create order' });
  }
});

// ─── Dev Mode: Bypass Payment (test only) ───────────────────────────────────

app.post('/api/payment/dev-booking', (req, res) => {
  const { propertyId, propertyName, propertyPrice, tokenAmount, userName, userEmail, userPhone } = req.body;
  const bookings = loadJSON(BOOKINGS_FILE, []);
  const booking = {
    id: Date.now(),
    orderId: 'dev_order_' + Date.now(),
    paymentId: 'dev_pay_' + Date.now(),
    propertyId: propertyId || '',
    propertyName: propertyName || '',
    propertyPrice: propertyPrice || 0,
    tokenAmount: tokenAmount || 0,
    userName: userName || '',
    userEmail: userEmail || '',
    userPhone: userPhone || '',
    status: 'confirmed',
    bookedAt: new Date().toISOString(),
  };
  bookings.push(booking);
  saveJSON(BOOKINGS_FILE, bookings);
  saveInvoiceFile(booking);
  console.log(`[Dev Booking] ${propertyName} by ${userName || userEmail}`);
  // Fire-and-forget invoice email
  sendInvoiceEmail(booking).catch(() => {});
  res.json({ success: true, booking });
});

// ─── Razorpay Payment Verification ──────────────────────────────────────────

app.post('/api/payment/verify', (req, res) => {
  const {
    razorpay_order_id, razorpay_payment_id, razorpay_signature,
    propertyId, propertyName, propertyPrice, tokenAmount,
    userName, userEmail, userPhone,
  } = req.body;

  const sign = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest('hex');

  if (expectedSign !== razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }

  // Save booking to bookings.json
  const bookings = loadJSON(BOOKINGS_FILE, []);
  const booking = {
    id: Date.now(),
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    propertyId: propertyId || '',
    propertyName: propertyName || '',
    propertyPrice: propertyPrice || 0,
    tokenAmount: tokenAmount || 0,
    userName: userName || '',
    userEmail: userEmail || '',
    userPhone: userPhone || '',
    status: 'confirmed',
    bookedAt: new Date().toISOString(),
  };
  bookings.push(booking);
  saveJSON(BOOKINGS_FILE, bookings);
  saveInvoiceFile(booking);
  console.log(`[Payment] Booking saved: ${propertyName} by ${userName || userEmail}`);
  sendInvoiceEmail(booking).catch(() => {});

  res.json({ success: true, message: 'Payment verified', booking });
});

// ─── Invoice Generator ───────────────────────────────────────────────────────

function generateInvoiceHTML(b) {
  const fmt = n => '₹' + Number(n).toLocaleString('en-IN');
  const date = new Date(b.bookedAt).toLocaleString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
  const invoiceNo = `VL-${String(b.id).slice(-8).toUpperCase()}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Invoice ${invoiceNo} — Vertex Living</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;background:#f0f4ff;color:#1e293b;min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:40px 16px}
  .page{background:#fff;width:100%;max-width:720px;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12)}
  .header{background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4c1d95 100%);padding:36px 40px;color:#fff}
  .header-top{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;flex-wrap:wrap}
  .brand{font-size:26px;font-weight:900;letter-spacing:-0.5px}
  .brand span{color:#a5b4fc}
  .invoice-badge{background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);border-radius:10px;padding:10px 18px;text-align:right}
  .invoice-badge .inv-label{font-size:11px;text-transform:uppercase;letter-spacing:0.08em;opacity:0.6;margin-bottom:4px}
  .invoice-badge .inv-no{font-size:20px;font-weight:800;color:#a5b4fc}
  .header-meta{margin-top:24px;display:flex;gap:32px;flex-wrap:wrap}
  .meta-item .meta-lbl{font-size:11px;opacity:0.55;text-transform:uppercase;letter-spacing:0.06em}
  .meta-item .meta-val{font-size:13px;font-weight:600;margin-top:3px}
  .confirmed-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(34,197,94,0.2);border:1px solid rgba(34,197,94,0.4);color:#86efac;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;margin-top:16px}
  .body{padding:36px 40px}
  .section-title{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6366f1;margin-bottom:14px}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:32px}
  .info-box{background:#f8faff;border:1px solid #e2e8f0;border-radius:10px;padding:16px}
  .info-box h4{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#94a3b8;margin-bottom:10px}
  .info-row{display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px}
  .info-row .lbl{color:#64748b}
  .info-row .val{font-weight:600;color:#1e293b;text-align:right;max-width:55%;word-break:break-word}
  .prop-card{background:linear-gradient(135deg,#f0f4ff,#fdf4ff);border:1px solid #e0e7ff;border-radius:12px;padding:20px;margin-bottom:28px}
  .prop-name{font-size:18px;font-weight:800;color:#1e1b4b;margin-bottom:4px}
  .prop-meta{font-size:13px;color:#64748b;margin-bottom:12px}
  .prop-chips{display:flex;gap:8px;flex-wrap:wrap}
  .chip{background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:4px 10px;font-size:12px;color:#475569;font-weight:500}
  .amount-table{width:100%;border-collapse:collapse;margin-bottom:28px}
  .amount-table thead tr{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff}
  .amount-table th{padding:12px 16px;text-align:left;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em}
  .amount-table tbody tr{border-bottom:1px solid #f1f5f9}
  .amount-table tbody tr:last-child{border-bottom:none}
  .amount-table td{padding:13px 16px;font-size:13px}
  .amount-table tfoot tr{background:#f8faff}
  .amount-table tfoot td{padding:14px 16px;font-size:14px;font-weight:700;border-top:2px solid #e2e8f0}
  .total-row .total-lbl{color:#1e1b4b}
  .total-row .total-val{color:#6366f1;font-size:16px;font-weight:800;text-align:right}
  .txn-box{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin-bottom:28px}
  .txn-box h4{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#16a34a;margin-bottom:10px}
  .txn-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:13px;flex-wrap:wrap;gap:4px}
  .txn-row .t-lbl{color:#15803d;font-weight:500}
  .txn-row .t-val{font-family:monospace;font-weight:700;color:#064e3b;font-size:12px;word-break:break-all}
  .refund-note{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;font-size:12px;color:#92400e;margin-bottom:24px;line-height:1.5}
  .footer{background:#f8faff;border-top:1px solid #e2e8f0;padding:24px 40px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
  .footer-brand{font-size:14px;font-weight:800;color:#1e1b4b}
  .footer-brand span{color:#6366f1}
  .footer-meta{font-size:11px;color:#94a3b8;text-align:right;line-height:1.6}
  @media print{body{background:#fff;padding:0}.page{box-shadow:none;border-radius:0}}
  @media(max-width:600px){.info-grid{grid-template-columns:1fr}.header{padding:24px 20px}.body{padding:24px 20px}.footer{padding:16px 20px}}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-top">
      <div>
        <div class="brand">VERTEX <span>LIVING</span></div>
        <div style="font-size:13px;opacity:0.6;margin-top:4px">Premium Real Estate · Gurgaon</div>
      </div>
      <div class="invoice-badge">
        <div class="inv-label">Invoice No.</div>
        <div class="inv-no">${invoiceNo}</div>
      </div>
    </div>
    <div class="header-meta">
      <div class="meta-item"><div class="meta-lbl">Date</div><div class="meta-val">${date}</div></div>
      <div class="meta-item"><div class="meta-lbl">Order ID</div><div class="meta-val">${b.orderId}</div></div>
      <div class="meta-item"><div class="meta-lbl">Payment ID</div><div class="meta-val">${b.paymentId}</div></div>
    </div>
    <div class="confirmed-badge">✅ Payment Confirmed</div>
  </div>

  <div class="body">
    <div class="info-grid">
      <div class="info-box">
        <h4>Billed To</h4>
        <div class="info-row"><span class="lbl">Name</span><span class="val">${b.userName || '—'}</span></div>
        <div class="info-row"><span class="lbl">Phone</span><span class="val">${b.userPhone || '—'}</span></div>
        <div class="info-row"><span class="lbl">Email</span><span class="val">${b.userEmail || '—'}</span></div>
      </div>
      <div class="info-box">
        <h4>Issued By</h4>
        <div class="info-row"><span class="lbl">Company</span><span class="val">Vertex Living</span></div>
        <div class="info-row"><span class="lbl">City</span><span class="val">Gurgaon, Haryana</span></div>
        <div class="info-row"><span class="lbl">Email</span><span class="val">info@vertexliving.in</span></div>
      </div>
    </div>

    <p class="section-title">Property Details</p>
    <div class="prop-card">
      <div class="prop-name">${b.propertyName}</div>
      <div class="prop-meta">Booking Token — ${date}</div>
      <div class="prop-chips">
        ${b.propertyPrice ? `<span class="chip">💰 ₹${b.propertyPrice} Cr (Full Value)</span>` : ''}
        <span class="chip">📍 Gurgaon, Haryana</span>
        <span class="chip">✅ RERA Verified</span>
        <span class="chip">🔒 Token Booking</span>
      </div>
    </div>

    <p class="section-title">Payment Summary</p>
    <table class="amount-table">
      <thead><tr><th>Description</th><th>Details</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody>
        <tr>
          <td><strong>Token Booking</strong><br><span style="color:#64748b;font-size:12px">${b.propertyName}</span></td>
          <td style="color:#64748b">Refundable Token</td>
          <td style="text-align:right;font-weight:600">${fmt(b.tokenAmount)}</td>
        </tr>
        <tr>
          <td>Platform Fee</td>
          <td style="color:#64748b">Vertex Living service</td>
          <td style="text-align:right;color:#22c55e;font-weight:600">₹0</td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td colspan="2" class="total-lbl">Total Paid</td>
          <td class="total-val">${fmt(b.tokenAmount)}</td>
        </tr>
      </tfoot>
    </table>

    <div class="txn-box">
      <h4>🔐 Transaction Details</h4>
      <div class="txn-row"><span class="t-lbl">Order ID</span><span class="t-val">${b.orderId}</span></div>
      <div class="txn-row"><span class="t-lbl">Payment ID</span><span class="t-val">${b.paymentId}</span></div>
      <div class="txn-row"><span class="t-lbl">Status</span><span class="t-val" style="color:#16a34a;font-family:inherit;font-size:13px">✅ CONFIRMED</span></div>
      <div class="txn-row"><span class="t-lbl">Booking ID</span><span class="t-val">BK-${String(b.id).slice(-10)}</span></div>
    </div>

    <div class="refund-note">
      ⚠️ <strong>Token Refund Policy:</strong> The token amount of ${fmt(b.tokenAmount)} is fully refundable if you decide not to proceed with the purchase within 30 days. Please contact our team with this invoice for any refund requests.
    </div>
  </div>

  <div class="footer">
    <div class="footer-brand">VERTEX <span>LIVING</span></div>
    <div class="footer-meta">
      SCO 120, Sector 44, Gurgaon · info@vertexliving.in · +91 98765 43210<br>
      This is a system-generated invoice. No signature required.
    </div>
  </div>
</div>
<script>
  // Auto-print trigger for when opened in browser
  if (window.location.search.includes('print=1')) window.onload = () => window.print();
</script>
</body>
</html>`;
}

// ─── Send Invoice Email ───────────────────────────────────────────────────────

async function sendInvoiceEmail(booking) {
  if (!booking.userEmail || !booking.userEmail.includes('@')) return;
  const transporter = getMailTransporter();
  if (!transporter) {
    console.log('[Invoice] Email skipped — Gmail credentials not configured');
    return;
  }
  const invoiceHTML = generateInvoiceHTML(booking);
  const invoiceNo = `VL-${String(booking.id).slice(-8).toUpperCase()}`;
  const fmt = n => '₹' + Number(n).toLocaleString('en-IN');

  try {
    await transporter.sendMail({
      from: `"Vertex Living" <${process.env.GMAIL_USER}>`,
      to: booking.userEmail,
      subject: `✅ Booking Confirmed — ${booking.propertyName} | Invoice ${invoiceNo}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f0f4ff;padding:24px;border-radius:12px">
          <div style="background:linear-gradient(135deg,#1e1b4b,#4c1d95);border-radius:10px;padding:28px;color:#fff;text-align:center;margin-bottom:20px">
            <div style="font-size:28px;font-weight:900;letter-spacing:-0.5px">VERTEX <span style="color:#a5b4fc">LIVING</span></div>
            <div style="font-size:24px;margin:12px 0">✅ Booking Confirmed!</div>
            <div style="opacity:0.75;font-size:14px">Invoice ${invoiceNo}</div>
          </div>
          <div style="background:#fff;border-radius:10px;padding:24px;margin-bottom:16px">
            <p style="font-size:16px;color:#1e293b">Dear <strong>${booking.userName || 'Valued Customer'}</strong>,</p>
            <p style="color:#475569;margin:12px 0">Your token booking for <strong>${booking.propertyName}</strong> has been successfully confirmed.</p>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0">
              <div style="font-size:13px;color:#15803d;font-weight:700;margin-bottom:10px">📋 Booking Summary</div>
              <table style="width:100%;font-size:13px;color:#374151">
                <tr><td style="padding:4px 0;color:#6b7280">Property</td><td style="font-weight:600;text-align:right">${booking.propertyName}</td></tr>
                <tr><td style="padding:4px 0;color:#6b7280">Token Paid</td><td style="font-weight:700;color:#6366f1;text-align:right">${fmt(booking.tokenAmount)}</td></tr>
                <tr><td style="padding:4px 0;color:#6b7280">Payment ID</td><td style="font-family:monospace;font-size:11px;text-align:right">${booking.paymentId}</td></tr>
                <tr><td style="padding:4px 0;color:#6b7280">Order ID</td><td style="font-family:monospace;font-size:11px;text-align:right">${booking.orderId}</td></tr>
                <tr><td style="padding:4px 0;color:#6b7280">Date</td><td style="text-align:right">${new Date(booking.bookedAt).toLocaleString('en-IN')}</td></tr>
              </table>
            </div>
            <p style="color:#475569;font-size:13px;line-height:1.6">The full invoice is attached below. Our team will contact you within 2 hours to schedule a site visit and discuss next steps.</p>
          </div>
          <div style="background:#fff;border-radius:10px;padding:20px;font-size:12px;color:#94a3b8;text-align:center">
            Vertex Living · SCO 120, Sector 44, Gurgaon · info@vertexliving.in<br>
            This is an automated email. Please do not reply.
          </div>
        </div>
      `,
      attachments: [{
        filename: `Invoice_${invoiceNo}.html`,
        content: invoiceHTML,
        contentType: 'text/html',
      }],
    });
    console.log(`[Invoice] Email sent to ${booking.userEmail} for ${booking.propertyName}`);
  } catch (err) {
    console.error('[Invoice] Email send error:', err.message);
  }
}

// ─── Customer Orders API ──────────────────────────────────────────────────────

// GET /api/customer/orders?email=xxx&phone=xxx
app.get('/api/customer/orders', (req, res) => {
  const { email, phone } = req.query;
  if (!email && !phone) return res.status(400).json({ error: 'email or phone required' });
  const bookings = loadJSON(BOOKINGS_FILE, []);
  const orders = bookings.filter(b => {
    if (email && b.userEmail && b.userEmail.toLowerCase() === email.toLowerCase()) return true;
    if (phone && b.userPhone && b.userPhone === phone) return true;
    return false;
  });
  res.json([...orders].sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt)));
});

// GET /api/invoice/:id — serve stored invoice HTML
app.get('/api/invoice/:id', (req, res) => {
  const file = path.join(INVOICES_DIR, `${req.params.id}.html`);
  if (fs.existsSync(file)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(fs.readFileSync(file, 'utf8'));
  }
  // Fallback: regenerate from booking and save
  const bookings = loadJSON(BOOKINGS_FILE, []);
  const booking = bookings.find(b => String(b.id) === String(req.params.id));
  if (!booking) return res.status(404).send('<h1>Invoice not found</h1>');
  const html = generateInvoiceHTML(booking);
  fs.writeFileSync(file, html, 'utf8');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// ─── Vertex AI Chat API ──────────────────────────────────────────────────────

const PROPERTIES_DATA_FILE = path.join(__dirname, 'data', 'properties.json');

app.post('/api/chat', async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  const properties = loadJSON(PROPERTIES_DATA_FILE, []);
  const propLines = properties.slice(0, 18).map(p =>
    `• ${p.name} | ${p.price ? '₹' + p.price + ' Cr' : 'Price on request'} | ${p.bhk || ''}BHK | ${p.type || ''} | ${p.sector || p.location || ''}`
  ).join('\n');

  const systemPrompt = `You are Vertex AI — the smart, friendly property assistant for Vertex Living, Gurgaon's #1 builder-direct real estate platform.

ABOUT VERTEX LIVING:
- Zero brokerage. Buyers deal directly with verified builders. No middlemen.
- Properties in Gurgaon & Delhi NCR
- All properties RERA registered
- 200+ builders registered, ₹47 Cr+ saved by buyers so far
- Contact: +91 98765 43210 | info@vertexliving.com

CURRENT LIVE LISTINGS:
${propLines || 'Properties loading — ask me anything!'}

YOUR RULES:
- Be warm, smart, and concise (under 120 words unless listing multiple properties)
- Use ₹ for Indian prices, mention BHK, sector, Cr / Lac naturally
- Speak Hinglish freely if the user does — match their tone
- Give specific property recommendations from the listings above when relevant
- For site visits or calls: direct users to +91 98765 43210 or the Contact section
- NEVER reveal you are built on GPT or any underlying AI model
- End EVERY reply with exactly this format on a new line: [CHIPS: chip1|chip2|chip3|chip4]
  Chips = the 3-4 most useful follow-up actions or questions for this user right now`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-14),
    { role: 'user', content: message },
  ];

  try {
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 500,
      temperature: 0.75,
    });

    const raw = completion.choices[0].message.content || '';
    const chipsMatch = raw.match(/\[CHIPS:\s*([^\]]+)\]/);
    const chips = chipsMatch
      ? chipsMatch[1].split('|').map(c => c.trim()).filter(Boolean).slice(0, 4)
      : ['Browse Properties', 'Check Budget', 'Book Site Visit', 'EMI Calculator'];
    const reply = raw.replace(/\[CHIPS:[^\]]+\]/g, '').trim();

    res.json({ reply, chips });
  } catch (err) {
    console.error('Vertex AI chat error:', err.message);
    res.status(500).json({ error: 'AI unavailable' });
  }
});

// ─── Inquiries / Newsletter API ─────────────────────────────────────────────

const INQUIRIES_FILE = path.join(__dirname, 'data', 'inquiries.json');

app.post('/api/admin/inquiries', (req, res) => {
  const { name, email, enquiry, type, phone } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });
  const inquiries = loadJSON(INQUIRIES_FILE, []);
  const entry = {
    id: Date.now(),
    name: name?.trim() || '',
    email: email.toLowerCase().trim(),
    phone: phone?.trim() || '',
    enquiry: enquiry?.trim() || '',
    type: type || 'General',
    createdAt: new Date().toISOString(),
  };
  inquiries.push(entry);
  saveJSON(INQUIRIES_FILE, inquiries);
  res.json({ success: true, id: entry.id });
});

app.get('/api/admin/inquiries', (req, res) => {
  const inquiries = loadJSON(INQUIRIES_FILE, []);
  res.json([...inquiries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// ─── Admin Bookings API ──────────────────────────────────────────────────────

app.get('/api/admin/bookings', (req, res) => {
  const bookings = loadJSON(BOOKINGS_FILE, []);
  const sorted = [...bookings].sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));
  res.json(sorted);
});

// ─── Start Server ────────────────────────────────────────────────────────────

server.listen(PORT, () => {
  console.log(`\n🤖 AI Phone Server running on port ${PORT}`);
  console.log(`📞 Twilio webhook: POST http://your-domain/incoming-call`);
  console.log(`📊 Dashboard API: http://localhost:${PORT}/api/stats\n`);
});
