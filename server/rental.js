import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const FILES = {
  users:       path.join(DATA_DIR, 'rental_users.json'),
  properties:  path.join(DATA_DIR, 'rental_properties.json'),
  inquiries:   path.join(DATA_DIR, 'rental_inquiries.json'),
};

function readFile(file, fallback = []) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return fallback; }
}

function writeFile(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ─── Auth ────────────────────────────────────────────────────────────────────

// POST /api/rental/auth/register
router.post('/auth/register', (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password || !phone || !role) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (!['owner', 'tenant'].includes(role)) {
    return res.status(400).json({ error: 'Role must be "owner" or "tenant".' });
  }

  const users = readFile(FILES.users);
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: 'Email already registered.' });
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    password,
    phone,
    role,
    avatar: name[0].toUpperCase(),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeFile(FILES.users, users);

  const { password: _pw, ...userNoPass } = newUser;
  return res.status(201).json({ success: true, user: userNoPass });
});

// POST /api/rental/auth/login
router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const users = readFile(FILES.users);
  const found = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!found) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const { password: _pw, ...userNoPass } = found;
  return res.json({ success: true, user: userNoPass });
});

// ─── Properties ──────────────────────────────────────────────────────────────

// GET /api/rental/properties
router.get('/properties', (_req, res) => {
  const properties = readFile(FILES.properties);
  return res.json(properties);
});

// POST /api/rental/properties
router.post('/properties', (req, res) => {
  const {
    title, type, rentPerMonth, deposit, area, location, sector,
    furnishing, bedrooms, bathrooms, floor, totalFloors,
    availableFrom, description, amenities, photos,
    ownerId, ownerName, ownerPhone, ownerEmail,
  } = req.body;

  if (!title || !type || !rentPerMonth || !ownerId) {
    return res.status(400).json({ error: 'Required fields missing.' });
  }

  const properties = readFile(FILES.properties);
  const newProperty = {
    id: Date.now(),
    title,
    type,
    rentPerMonth: parseFloat(rentPerMonth) || 0,
    deposit: parseFloat(deposit) || 0,
    area: area || '',
    location: location || '',
    sector: sector || '',
    city: 'Gurgaon',
    furnishing: furnishing || 'Unfurnished',
    bedrooms: parseInt(bedrooms) || 0,
    bathrooms: parseInt(bathrooms) || 0,
    floor: floor || '',
    totalFloors: totalFloors || '',
    availableFrom: availableFrom || '',
    description: description || '',
    amenities: Array.isArray(amenities) ? amenities : [],
    photos: Array.isArray(photos) ? photos : [],
    ownerId,
    ownerName: ownerName || '',
    ownerPhone: ownerPhone || '',
    ownerEmail: ownerEmail || '',
    listedAt: new Date().toISOString(),
    status: 'active',
  };

  properties.push(newProperty);
  writeFile(FILES.properties, properties);
  return res.status(201).json({ success: true, property: newProperty });
});

// GET /api/rental/my-properties/:ownerId
router.get('/my-properties/:ownerId', (req, res) => {
  const { ownerId } = req.params;
  const properties = readFile(FILES.properties);
  const mine = properties.filter(p => String(p.ownerId) === String(ownerId));
  return res.json(mine);
});

// DELETE /api/rental/properties/:id
router.delete('/properties/:id', (req, res) => {
  const { id } = req.params;
  const properties = readFile(FILES.properties);
  const updated = properties.filter(p => String(p.id) !== String(id));

  if (updated.length === properties.length) {
    return res.status(404).json({ error: 'Property not found.' });
  }

  writeFile(FILES.properties, updated);
  return res.json({ success: true });
});

// ─── Inquiries ───────────────────────────────────────────────────────────────

// POST /api/rental/inquiries
router.post('/inquiries', (req, res) => {
  const { propertyId, propertyTitle, ownerId, tenantName, tenantEmail, tenantPhone, message } = req.body;

  if (!propertyId || !tenantName || !tenantEmail || !message) {
    return res.status(400).json({ error: 'Required fields missing.' });
  }

  const inquiries = readFile(FILES.inquiries);
  const newInquiry = {
    id: Date.now(),
    propertyId,
    propertyTitle: propertyTitle || '',
    ownerId: ownerId || null,
    tenantName,
    tenantEmail,
    tenantPhone: tenantPhone || '',
    message,
    createdAt: new Date().toISOString(),
  };

  inquiries.push(newInquiry);
  writeFile(FILES.inquiries, inquiries);
  return res.status(201).json({ success: true, inquiry: newInquiry });
});

// GET /api/rental/inquiries/:ownerId
router.get('/inquiries/:ownerId', (req, res) => {
  const { ownerId } = req.params;
  const inquiries = readFile(FILES.inquiries);
  const filtered = inquiries.filter(i => String(i.ownerId) === String(ownerId));
  return res.json(filtered);
});

// ─── Admin Routes ─────────────────────────────────────────────────────────────

// GET /api/rental/admin/stats
router.get('/admin/stats', (_req, res) => {
  const properties = readFile(FILES.properties);
  const users      = readFile(FILES.users);
  const inquiries  = readFile(FILES.inquiries);
  return res.json({
    totalProperties: properties.length,
    activeProperties: properties.filter(p => p.status === 'active').length,
    inactiveProperties: properties.filter(p => p.status === 'inactive').length,
    totalOwners: users.filter(u => u.role === 'owner').length,
    totalTenants: users.filter(u => u.role === 'tenant').length,
    totalInquiries: inquiries.length,
  });
});

// GET /api/rental/admin/properties
router.get('/admin/properties', (_req, res) => {
  const properties = readFile(FILES.properties);
  return res.json(properties);
});

// GET /api/rental/admin/users
router.get('/admin/users', (_req, res) => {
  const users = readFile(FILES.users);
  return res.json(users.map(({ password: _pw, ...u }) => u));
});

// GET /api/rental/admin/inquiries
router.get('/admin/inquiries', (_req, res) => {
  const inquiries = readFile(FILES.inquiries);
  return res.json(inquiries);
});

// PATCH /api/rental/admin/properties/:id/status
router.patch('/admin/properties/:id/status', (req, res) => {
  const { id }     = req.params;
  const { status } = req.body;
  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ error: 'Status must be active or inactive.' });
  }
  const properties = readFile(FILES.properties);
  const idx = properties.findIndex(p => String(p.id) === String(id));
  if (idx === -1) return res.status(404).json({ error: 'Property not found.' });
  properties[idx].status = status;
  writeFile(FILES.properties, properties);
  return res.json({ success: true, property: properties[idx] });
});

// DELETE /api/rental/admin/properties/:id
router.delete('/admin/properties/:id', (req, res) => {
  const { id }    = req.params;
  const properties = readFile(FILES.properties);
  const updated   = properties.filter(p => String(p.id) !== String(id));
  if (updated.length === properties.length) return res.status(404).json({ error: 'Not found.' });
  writeFile(FILES.properties, updated);
  return res.json({ success: true });
});

// DELETE /api/rental/admin/users/:id
router.delete('/admin/users/:id', (req, res) => {
  const { id } = req.params;
  const users  = readFile(FILES.users);
  const updated = users.filter(u => String(u.id) !== String(id));
  if (updated.length === users.length) return res.status(404).json({ error: 'Not found.' });
  writeFile(FILES.users, updated);
  return res.json({ success: true });
});

// DELETE /api/rental/admin/inquiries/:id
router.delete('/admin/inquiries/:id', (req, res) => {
  const { id }  = req.params;
  const inquiries = readFile(FILES.inquiries);
  const updated = inquiries.filter(i => String(i.id) !== String(id));
  if (updated.length === inquiries.length) return res.status(404).json({ error: 'Not found.' });
  writeFile(FILES.inquiries, updated);
  return res.json({ success: true });
});

export default router;
