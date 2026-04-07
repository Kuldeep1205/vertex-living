import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import QRCode from 'qrcode';
import OpenAI from 'openai';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const WA_FILE = path.join(__dirname, 'whatsapp.json');
const CONFIG_FILE = path.join(__dirname, 'config.json');

function loadJSON(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}
function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

let waConversations = loadJSON(WA_FILE, {});
let aiConfig = loadJSON(CONFIG_FILE, {});

// Reload config every 30 seconds (in case user updates it from dashboard)
setInterval(() => {
  aiConfig = loadJSON(CONFIG_FILE, {});
}, 30000);

// ─── WhatsApp Client ──────────────────────────────────────────────────────────

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: path.join(__dirname, '.wwebjs_auth') }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  },
});

client.on('qr', async (qr) => {
  console.log('\n📱 WhatsApp QR Code — apne phone se scan karo:\n');
  qrcode.generate(qr, { small: true });
  console.log('\n(Ek baar scan karne ke baad dubara nahi karana padega)\n');

  // Save QR as image and auto-open
  const qrPath = path.join(__dirname, 'whatsapp-qr.png');
  try {
    await QRCode.toFile(qrPath, qr, { width: 400, margin: 2 });
    console.log(`📂 QR image saved: ${qrPath}`);
    exec(`start "" "${qrPath}"`); // Windows mein auto-open
  } catch (err) {
    console.error('QR save error:', err.message);
  }
});

client.on('ready', () => {
  console.log('✅ WhatsApp connected! Ab AI automatic replies dega.\n');
});

client.on('authenticated', () => {
  console.log('🔐 WhatsApp authenticated successfully');
});

client.on('auth_failure', (msg) => {
  console.error('❌ WhatsApp auth failed:', msg);
});

client.on('disconnected', (reason) => {
  console.log('⚠️  WhatsApp disconnected:', reason);
});

// ─── Message Handler ──────────────────────────────────────────────────────────

client.on('message', async (msg) => {
  // Ignore group messages, status updates, and messages from self
  if (msg.from === 'status@broadcast') return;
  if (msg.fromMe) return;
  if (msg.from.endsWith('@g.us')) return; // group chat

  const phone = msg.from.replace('@c.us', '');
  const body = msg.body?.trim();
  if (!body) return;

  // Get contact name if available
  const contact = await msg.getContact();
  const name = contact?.pushname || contact?.name || phone;

  console.log(`\n💬 Message from ${name} (${phone}): ${body}`);

  // Load conversation history
  if (!waConversations[phone]) waConversations[phone] = [];
  const history = waConversations[phone];

  // Save incoming message
  history.push({ role: 'user', content: body, time: new Date().toISOString(), name });

  // Build system prompt
  const systemPrompt = `You are ${aiConfig.agentName || 'Rahul'}, a friendly and professional property advisor at ${aiConfig.businessName || 'Vertex Living'}, a premium real estate company in Gurugram.

You help customers on WhatsApp with:
- Property inquiries (price, availability, configurations, possession date)
- Scheduling site visits
- Project details, amenities, location advantages
- Home loan guidance
- Documentation process
- Any real estate questions about Gurugram / Gurgaon

Customer's name: ${name}

Your personality rules:
- You are a REAL HUMAN — NEVER say you are AI, bot, or automated system under any circumstances
- If asked "are you a bot/AI?", confidently say "Nahi yaar, main Rahul hoon, ek real advisor 😄"
- Write casually and warmly, exactly like a real WhatsApp conversation
- Use short paragraphs — easy to read on phone
- Use emojis naturally (not too many, not too few)
- Address the customer by their name occasionally
- If they ask about a specific project, give helpful details about Gurugram real estate
- If they want to visit, enthusiastically help schedule: ask preferred day + time
- Keep replies concise — 3-6 lines max (unless they ask for detailed info)
- Speak in Hinglish (mix of Hindi + English) if the customer writes in Hinglish
- NEVER use formal/robotic language — always sound like a helpful knowledgeable friend
- Never use bullet points or numbered lists — write in natural flowing sentences
- If you don't know something specific, say you'll check and get back — don't make up false data`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-20).map(m => ({ role: m.role, content: m.content })),
  ];

  let reply = '';
  try {
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 350,
      temperature: 0.85,
    });
    reply = completion.choices[0]?.message?.content?.trim() || '';
  } catch (err) {
    console.error('❌ OpenAI error:', err.message);
    reply = `Hi ${name}! 😊 Vertex Living mein aapka swagat hai! Abhi thoda busy hoon, 2 minute mein reply karta hoon.`;
  }

  // Save reply to history
  history.push({ role: 'assistant', content: reply, time: new Date().toISOString() });
  waConversations[phone] = history;
  saveJSON(WA_FILE, waConversations);

  // Send reply
  try {
    await msg.reply(reply);
    console.log(`✉️  Reply sent to ${name}: ${reply.substring(0, 80)}...`);
  } catch (err) {
    console.error('❌ Send error:', err.message);
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────

console.log('🤖 WhatsApp AI Bot shuru ho raha hai...');
console.log('📡 Pehli baar chalaane pe QR code aayega — phone se scan karo\n');
client.initialize();
