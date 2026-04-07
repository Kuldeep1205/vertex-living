import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const DATA_DIR = process.env.VERCEL ? '/tmp/data' : path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const FILES = {
  properties:        path.join(DATA_DIR, 'properties.json'),
  pendingProperties: path.join(DATA_DIR, 'pending_properties.json'),
  agents:            path.join(DATA_DIR, 'agents.json'),
  settings:          path.join(DATA_DIR, 'settings.json'),
  inquiries:         path.join(DATA_DIR, 'inquiries.json'),
  users:             path.join(DATA_DIR, 'users.json'),
};

const DEFAULT_SETTINGS = {
  companyName: 'Vertex Living',
  tagline: 'Find Your Dream Property in Gurgaon',
  heroSubtitle: 'Trusted by 10,000+ families across Gurgaon & Delhi NCR',
  phone: '+91 98765 43210',
  email: 'info@vertexliving.in',
  whatsapp: '+91 98765 43210',
  address: 'SCO 120, Sector 44, Gurgaon, Haryana 122003',
  officeHours: 'Mon–Sat: 9 AM – 7 PM',
  facebookUrl: '',
  instagramUrl: '',
  youtubeUrl: '',
  aboutText: 'Vertex Living is Gurgaon\'s most trusted real estate platform.',
  footerTagline: 'Your trusted real estate partner in Gurgaon & Delhi NCR',
  // Hero section
  heroTitle: 'Builder to Buyer.',
  heroTitleHighlight: 'Zero Brokerage.',
  heroDescription: 'Buy directly from verified builders in Gurgaon & Delhi NCR. No middlemen, no hidden fees. Save ₹3–20 Lakhs on your next home.',
  trustPill1: '✓ 200+ Builders Registered',
  trustPill2: '✓ ₹47 Cr+ Saved by Buyers',
  trustPill3: '✓ RERA Verified Projects',
  // Stats section
  stat1Num: '200+',   stat1Label: 'Builders Registered', stat1Icon: '🏗',
  stat2Num: '₹47 Cr+', stat2Label: 'Saved by Buyers',   stat2Icon: '💰',
  stat3Num: '0%',     stat3Label: 'Brokerage Fee',       stat3Icon: '🚫',
  stat4Num: '2,500+', stat4Label: 'Direct Listings',     stat4Icon: '🏠',
};

function readFile(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return fallback; }
}

function writeFile(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function formatPrice(price) {
  const n = parseFloat(price);
  if (isNaN(n)) return '';
  if (n >= 1) return `₹${n} Cr`;
  return `₹${Math.round(n * 100)} Lac`;
}

// ─── PROPERTIES ──────────────────────────────────────────────────────────────

router.get('/properties', (req, res) => {
  res.json(readFile(FILES.properties, []));
});

router.post('/properties', (req, res) => {
  const list = readFile(FILES.properties, []);
  const price = parseFloat(req.body.price) || 0;
  const rawPhotos = Array.isArray(req.body.photos) ? req.body.photos : [];
  const photos = rawPhotos.map(u => u.replace(/^https?:\/\/[^/]+/, ''));
  const item = {
    id: Date.now(),
    name:         req.body.name         || '',
    sector:       req.body.sector       || '',
    location:     req.body.location     || '',
    city:         req.body.city         || 'Gurgaon',
    type:         req.body.type         || 'Apartment',
    bedrooms:     parseInt(req.body.bedrooms) || 0,
    price,
    priceDisplay: req.body.priceDisplay || formatPrice(price),
    area:         req.body.area         || '',
    status:       req.body.status       || 'Ready to Move',
    developer:    req.body.developer    || '',
    description:  req.body.description  || '',
    amenities:    Array.isArray(req.body.amenities) ? req.body.amenities : [],
    photos,
  };
  list.push(item);
  writeFile(FILES.properties, list);
  res.json(item);
});

router.put('/properties/:id', (req, res) => {
  const list = readFile(FILES.properties, []);
  const idx = list.findIndex(p => String(p.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const price = parseFloat(req.body.price) || 0;
  list[idx] = {
    ...list[idx],
    name:         req.body.name         ?? list[idx].name,
    sector:       req.body.sector       ?? list[idx].sector,
    location:     req.body.location     ?? list[idx].location,
    city:         req.body.city         ?? list[idx].city,
    type:         req.body.type         ?? list[idx].type,
    bedrooms:     parseInt(req.body.bedrooms) || list[idx].bedrooms,
    price,
    priceDisplay: formatPrice(price),
    area:         req.body.area         ?? list[idx].area,
    status:       req.body.status       ?? list[idx].status,
    developer:    req.body.developer    ?? list[idx].developer,
  };
  writeFile(FILES.properties, list);
  res.json(list[idx]);
});

router.delete('/properties/:id', (req, res) => {
  const list = readFile(FILES.properties, []).filter(
    p => String(p.id) !== String(req.params.id)
  );
  writeFile(FILES.properties, list);
  res.json({ ok: true });
});

// ─── AGENTS ──────────────────────────────────────────────────────────────────

router.get('/agents', (req, res) => {
  res.json(readFile(FILES.agents, []));
});

router.post('/agents', (req, res) => {
  const list = readFile(FILES.agents, []);
  const item = {
    id:             Date.now(),
    name:           req.body.name           || '',
    photo:          req.body.photo          || '',
    experience:     parseInt(req.body.experience) || 0,
    specialization: req.body.specialization || '',
    deals:          parseInt(req.body.deals) || 0,
    rating:         parseFloat(req.body.rating) || 5.0,
    topAgent:       req.body.topAgent === true || req.body.topAgent === 'true',
    phone:          req.body.phone          || '',
    email:          req.body.email          || '',
  };
  list.push(item);
  writeFile(FILES.agents, list);
  res.json(item);
});

router.put('/agents/:id', (req, res) => {
  const list = readFile(FILES.agents, []);
  const idx = list.findIndex(a => String(a.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  list[idx] = {
    ...list[idx],
    name:           req.body.name           ?? list[idx].name,
    photo:          req.body.photo          ?? list[idx].photo,
    experience:     parseInt(req.body.experience) || list[idx].experience,
    specialization: req.body.specialization ?? list[idx].specialization,
    deals:          parseInt(req.body.deals) || list[idx].deals,
    rating:         parseFloat(req.body.rating) || list[idx].rating,
    topAgent:       req.body.topAgent === true || req.body.topAgent === 'true',
    phone:          req.body.phone          ?? list[idx].phone,
    email:          req.body.email          ?? list[idx].email,
  };
  writeFile(FILES.agents, list);
  res.json(list[idx]);
});

router.delete('/agents/:id', (req, res) => {
  const list = readFile(FILES.agents, []).filter(
    a => String(a.id) !== String(req.params.id)
  );
  writeFile(FILES.agents, list);
  res.json({ ok: true });
});

// ─── SETTINGS ────────────────────────────────────────────────────────────────

router.get('/settings', (req, res) => {
  res.json(readFile(FILES.settings, DEFAULT_SETTINGS));
});

router.put('/settings', (req, res) => {
  const current = readFile(FILES.settings, DEFAULT_SETTINGS);
  const updated = { ...current, ...req.body };
  writeFile(FILES.settings, updated);
  res.json(updated);
});

// ─── INQUIRIES ───────────────────────────────────────────────────────────────

router.get('/inquiries', (req, res) => {
  res.json(readFile(FILES.inquiries, []));
});

router.post('/inquiries', (req, res) => {
  const list = readFile(FILES.inquiries, []);
  const item = {
    id:        Date.now(),
    ...req.body,
    createdAt: new Date().toISOString(),
    read:      false,
  };
  list.unshift(item);
  writeFile(FILES.inquiries, list);
  res.json(item);
});

router.patch('/inquiries/:id/read', (req, res) => {
  const list = readFile(FILES.inquiries, []);
  const idx = list.findIndex(i => String(i.id) === String(req.params.id));
  if (idx !== -1) { list[idx].read = true; writeFile(FILES.inquiries, list); }
  res.json({ ok: true });
});

router.delete('/inquiries/:id', (req, res) => {
  const list = readFile(FILES.inquiries, []).filter(
    i => String(i.id) !== String(req.params.id)
  );
  writeFile(FILES.inquiries, list);
  res.json({ ok: true });
});

// ─── USERS ───────────────────────────────────────────────────────────────────

router.get('/users', (req, res) => {
  const users = readFile(FILES.users, []);
  // Password nahi bhejna
  res.json(users.map(({ password, ...rest }) => rest));
});

router.delete('/users/:id', (req, res) => {
  const list = readFile(FILES.users, []);
  const user = list.find(u => String(u.id) === String(req.params.id));
  // Admin accounts delete nahi ho sakte
  if (user?.role === 'admin') return res.status(403).json({ error: 'Admin accounts cannot be deleted.' });
  const filtered = list.filter(u => String(u.id) !== String(req.params.id));
  writeFile(FILES.users, filtered);
  res.json({ ok: true });
});

// ─── PENDING BUILDER LISTINGS ────────────────────────────────────────────────

// GET all pending
router.get('/pending-properties', (req, res) => {
  res.json(readFile(FILES.pendingProperties, []));
});

// POST approve — move from pending → live properties
router.post('/pending-properties/:id/approve', (req, res) => {
  const pending = readFile(FILES.pendingProperties, []);
  const idx = pending.findIndex(p => String(p.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const raw = { ...pending[idx], approvedAt: new Date().toISOString() };
  delete raw.approvalStatus;
  // Normalize photo URLs — strip hostname so they work via vite proxy
  if (Array.isArray(raw.photos)) {
    raw.photos = raw.photos.map(u => u.replace(/^https?:\/\/[^/]+/, ''));
  }
  const prop = raw;

  const live = readFile(FILES.properties, []);
  live.push(prop);
  writeFile(FILES.properties, live);

  pending.splice(idx, 1);
  writeFile(FILES.pendingProperties, pending);

  res.json({ ok: true, property: prop });
});

// DELETE reject — remove from pending
router.delete('/pending-properties/:id', (req, res) => {
  const pending = readFile(FILES.pendingProperties, []).filter(
    p => String(p.id) !== String(req.params.id)
  );
  writeFile(FILES.pendingProperties, pending);
  res.json({ ok: true });
});

export default router;
