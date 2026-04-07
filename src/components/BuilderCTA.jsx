import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './BuilderCTA.css';

const API = import.meta.env.VITE_API_URL || '';

const STATUS_CONFIG = {
  'Ready to Move':      { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  icon: '✅' },
  'Under Construction': { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '🔨' },
  'New Launch':         { color: '#6366f1', bg: 'rgba(99,102,241,0.15)', icon: '🚀' },
  'Pre-Launch':         { color: '#ec4899', bg: 'rgba(236,72,153,0.12)', icon: '🔖' },
};

const LISTED_PROPERTIES = [
  {
    id: 1,
    name: 'DLF The Camellias – Phase 2',
    builder: 'DLF Ltd.',
    location: 'Sector 42, Gurgaon',
    config: '4 & 5 BHK Ultra-Luxury',
    price: '₹12 Cr – ₹22 Cr',
    status: 'Ready to Move',
    area: '6,200–9,500 sq ft',
    img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80',
    rera: 'HRERA-PKL-2022-0041',
  },
  {
    id: 2,
    name: 'M3M Crown',
    builder: 'M3M India',
    location: 'Sector 111, Gurgaon',
    config: '3 & 4 BHK Residences',
    price: '₹3.5 Cr – ₹7 Cr',
    status: 'Under Construction',
    area: '2,200–4,100 sq ft',
    img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&q=80',
    rera: 'HRERA-GGN-2023-0189',
  },
  {
    id: 3,
    name: 'Sobha City — Towers',
    builder: 'Sobha Ltd.',
    location: 'Sector 108, Gurgaon',
    config: '2, 3 & 4 BHK Apartments',
    price: '₹1.8 Cr – ₹4.2 Cr',
    status: 'New Launch',
    area: '1,250–2,850 sq ft',
    img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80',
    rera: 'HRERA-GGN-2024-0312',
  },
  {
    id: 4,
    name: 'Emaar DigiHomes',
    builder: 'Emaar India',
    location: 'Sector 62, Gurgaon',
    config: '2 & 3 BHK Smart Homes',
    price: '₹85 L – ₹1.9 Cr',
    status: 'Under Construction',
    area: '880–1,600 sq ft',
    img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80',
    rera: 'HRERA-GGN-2023-0554',
  },
  {
    id: 5,
    name: 'Godrej Meridien',
    builder: 'Godrej Properties',
    location: 'Sector 106, Gurgaon',
    config: '3 & 4 BHK Premium',
    price: '₹2.6 Cr – ₹5.8 Cr',
    status: 'Ready to Move',
    area: '1,800–3,200 sq ft',
    img: 'https://images.unsplash.com/photo-1592595896616-c37162298647?w=400&q=80',
    rera: 'HRERA-GGN-2021-0091',
  },
  {
    id: 6,
    name: 'Tata Primanti',
    builder: 'Tata Housing',
    location: 'Sector 72, Gurgaon',
    config: '3 & 4 BHK Villas',
    price: '₹4.2 Cr – ₹9 Cr',
    status: 'Pre-Launch',
    area: '2,950–5,400 sq ft',
    img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80',
    rera: 'Applied',
  },
];

const BENEFITS = [
  {
    icon: '🎯',
    title: 'Reach Serious Buyers',
    desc: 'Buyers who search builder-direct are already past the "just browsing" stage. Higher intent, faster closures.',
  },
  {
    icon: '💸',
    title: 'Zero Commission on Sales',
    desc: 'You pay one flat listing fee per project. We take no cut on the deal. Your margin stays yours.',
  },
  {
    icon: '🔒',
    title: 'Control Your Pricing',
    desc: 'No agent inflating prices to protect commissions. Your declared price is what buyers see — period.',
  },
  {
    icon: '✅',
    title: 'RERA Trust Badge',
    desc: 'Verified projects get a RERA-seal shown on every card and search result. Builds instant buyer confidence.',
  },
  {
    icon: '📊',
    title: 'Real-Time Lead Dashboard',
    desc: 'Track enquiries, call logs, and site-visit requests from one clean dashboard. No spreadsheets needed.',
  },
  {
    icon: '📦',
    title: 'Flexible Packages',
    desc: 'Starter (1 project), Pro (5 projects), Enterprise (unlimited). Scale as your portfolio grows.',
  },
];

const ALL_AMENITIES = [
  'Swimming Pool','Gymnasium','Club House','24×7 Security','Power Backup',
  'Lift / Elevator','Parking','Children Play Area','Jogging Track','Garden / Park',
  'CCTV Surveillance','Intercom','Fire Safety','Rainwater Harvesting',
  'Rooftop Terrace','Co-working Space','EV Charging','Concierge Service',
  'Spa & Sauna','Basketball Court','Tennis Court','Badminton Court',
];

const INITIAL_FORM = {
  companyName: '',
  contactName: '',
  phone: '',
  email: '',
  reraNumber: '',
  projectName: '',
  city: '',
  message: '',
  amenities: [],
};

export default function BuilderCTA() {
  const { user, isBuilder, isBuyer, openLogin } = useAuth();
  const [form, setForm]             = useState(INITIAL_FORM);
  const [status, setStatus]         = useState('idle'); // idle | submitting | success | error
  const [errMsg, setErrMsg]         = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews]   = useState([]);
  const fileInputRef = useRef(null);

  // ── Contact Builder lead modal ──
  const [contactProp, setContactProp] = useState(null); // null | property object
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [leadStatus, setLeadStatus] = useState('idle'); // idle | submitting | success | error
  const [leadErr, setLeadErr] = useState('');

  const openContactModal = (prop) => {
    setContactProp(prop);
    setLeadForm({
      name:    user?.name  || '',
      phone:   user?.phone || '',
      email:   user?.email || '',
      message: '',
    });
    setLeadStatus('idle');
    setLeadErr('');
  };

  const closeContactModal = () => { setContactProp(null); setLeadStatus('idle'); };

  const handleLeadSubmit = async e => {
    e.preventDefault();
    if (!leadForm.name.trim() || !leadForm.phone.trim()) {
      setLeadErr('Name and phone number are required.'); return;
    }
    setLeadStatus('submitting'); setLeadErr('');
    try {
      const res = await fetch(`${API}/api/builder/contact-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName:       leadForm.name,
          clientPhone:      leadForm.phone,
          clientEmail:      leadForm.email,
          clientMessage:    leadForm.message,
          propertyId:       contactProp.id,
          propertyName:     contactProp.name,
          propertyPrice:    contactProp.price,
          propertyConfig:   contactProp.config,
          propertyLocation: contactProp.location,
          propertyStatus:   contactProp.status,
          propertyRera:     contactProp.rera,
          builderName:      contactProp.builder,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setLeadErr(data.error || 'Failed to send.'); setLeadStatus('error'); return; }
      setLeadStatus('success');
    } catch {
      setLeadErr('Server not reachable. Please try again.'); setLeadStatus('error');
    }
  };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const toggleAmenity = a => setForm(f => {
    const list = f.amenities || [];
    return { ...f, amenities: list.includes(a) ? list.filter(x => x !== a) : [...list, a] };
  });

  const handleFileChange = e => {
    const files = Array.from(e.target.files);
    const allowed = ['.jpg', '.jpeg', '.pdf'];
    const valid = files.filter(f => allowed.includes('.' + f.name.split('.').pop().toLowerCase()));
    if (valid.length !== files.length) setErrMsg('Only JPG and PDF files are allowed.');
    else setErrMsg('');
    setSelectedFiles(prev => [...prev, ...valid]);
    setFilePreviews(prev => [
      ...prev,
      ...valid.map(f => ({
        name: f.name,
        type: f.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image',
        url: f.name.toLowerCase().endsWith('.pdf') ? null : URL.createObjectURL(f),
      })),
    ]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = idx => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
    setFilePreviews(prev => {
      if (prev[idx]?.url) URL.revokeObjectURL(prev[idx].url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus('submitting');
    setErrMsg('');
    try {
      // Upload files first if any
      let uploadedUrls = [];
      if (selectedFiles.length > 0) {
        const fd = new FormData();
        selectedFiles.forEach(f => fd.append('files', f));
        const upRes = await fetch(`${API}/api/builder/upload-files`, { method: 'POST', body: fd });
        const upData = await upRes.json();
        if (!upRes.ok) { setErrMsg(upData.error || 'File upload failed.'); setStatus('error'); return; }
        uploadedUrls = upData.urls.map(u => `${API}${u}`);
      }
      const res = await fetch(`${API}/api/builder/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, userId: user?.id, attachments: uploadedUrls }),
      });
      const data = await res.json();
      if (!res.ok) { setErrMsg(data.error || 'Submission failed.'); setStatus('error'); return; }
      setStatus('success');
      setSelectedFiles([]); setFilePreviews([]);
    } catch {
      setErrMsg('Server not reachable. Please try again.'); setStatus('error');
    }
  };

  return (
    <section id="builder-cta" className="bcta-section">
      <div className="container">

        {/* Header */}
        <motion.div
          className="bcta-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <div className="bcta-eyebrow">🏗 For Builders & Developers</div>
          <h2 className="bcta-title">
            List Directly. Sell More. <span className="bcta-highlight">Keep 100% Margin.</span>
          </h2>
          <p className="bcta-subtitle">
            Stop paying 2–3% commission to every broker who brings a lead. List your project once,
            reach verified buyers directly, and close deals on your terms.
          </p>
        </motion.div>

        <div className="bcta-grid">

          {/* Left — Benefits */}
          <div className="bcta-benefits">
            <h3 className="bcta-benefits-title">Why list on Vertex Direct?</h3>
            <div className="bcta-benefits-list">
              {BENEFITS.map((b, i) => (
                <motion.div
                  key={i}
                  className="bcta-benefit"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                >
                  <div className="bcta-benefit-icon">{b.icon}</div>
                  <div>
                    <div className="bcta-benefit-title">{b.title}</div>
                    <div className="bcta-benefit-desc">{b.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social proof strip */}
            <div className="bcta-proof">
              <div className="bcta-proof-item">
                <div className="bcta-proof-num">200+</div>
                <div className="bcta-proof-lbl">Builders Onboarded</div>
              </div>
              <div className="bcta-proof-divider" />
              <div className="bcta-proof-item">
                <div className="bcta-proof-num">₹0</div>
                <div className="bcta-proof-lbl">Commission Charged</div>
              </div>
              <div className="bcta-proof-divider" />
              <div className="bcta-proof-item">
                <div className="bcta-proof-num">48 hrs</div>
                <div className="bcta-proof-lbl">Verification Time</div>
              </div>
            </div>
          </div>

          {/* Right — Registration Form (builders only) */}
          <motion.div
            className="bcta-form-wrap"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {/* Buyer / Not logged in — show locked state */}
            {!user ? (
              <div className="bcta-form bcta-locked">
                <div className="bcta-locked-icon">🔒</div>
                <h3 className="bcta-form-title">Register Your Project</h3>
                <p className="bcta-form-sub">Login as a Builder to submit your project application.</p>
                <button className="bcta-submit" onClick={() => openLogin()}>Login / Register as Builder →</button>
              </div>
            ) : isBuyer ? (
              <div className="bcta-form bcta-locked">
                <div className="bcta-locked-icon">🏠</div>
                <h3 className="bcta-form-title">Builder Portal</h3>
                <p className="bcta-form-sub">This section is for verified builders and developers only. You're logged in as a buyer.</p>
                <div className="bcta-terms">To list a project, please register a Builder account.</div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success"
                    className="bcta-success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="bcta-success-icon">🎉</div>
                    <h3>Application Received!</h3>
                    <p>Our team will review your project details and contact you within 48 hours for RERA verification.</p>
                    <button className="bcta-reset-btn" onClick={() => { setForm(INITIAL_FORM); setStatus('idle'); }}>
                      Submit Another Project
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    className="bcta-form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <h3 className="bcta-form-title">Register Your Project</h3>
                    <p className="bcta-form-sub">Free to apply. No credit card required.</p>

                    {status === 'error' && errMsg && (
                      <div className="bcta-error">{errMsg}</div>
                    )}

                    <div className="bcta-row">
                      <div className="bcta-field">
                        <label>Company Name *</label>
                        <input name="companyName" value={form.companyName} onChange={handleChange}
                          placeholder="e.g. DLF Limited" required />
                      </div>
                      <div className="bcta-field">
                        <label>Contact Person *</label>
                        <input name="contactName" value={form.contactName} onChange={handleChange}
                          placeholder="Your name" required />
                      </div>
                    </div>

                    <div className="bcta-row">
                      <div className="bcta-field">
                        <label>Phone *</label>
                        <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                          placeholder="+91 98765 43210" required />
                      </div>
                      <div className="bcta-field">
                        <label>Email *</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange}
                          placeholder="sales@company.com" required />
                      </div>
                    </div>

                    <div className="bcta-row">
                      <div className="bcta-field">
                        <label>RERA Registration No. *</label>
                        <input name="reraNumber" value={form.reraNumber} onChange={handleChange}
                          placeholder="HRERA-PKL-2024-XXXXX" required />
                      </div>
                      <div className="bcta-field">
                        <label>Project Name *</label>
                        <input name="projectName" value={form.projectName} onChange={handleChange}
                          placeholder="e.g. The Camellias Phase 2" required />
                      </div>
                    </div>

                    <div className="bcta-field">
                      <label>City / Sector</label>
                      <input name="city" value={form.city} onChange={handleChange}
                        placeholder="e.g. Sector 54, Gurgaon" />
                    </div>

                    <div className="bcta-field">
                      <label>Message (optional)</label>
                      <textarea name="message" value={form.message} onChange={handleChange}
                        placeholder="Tell us about your project — configuration, possession timeline, USP…"
                        rows={3} />
                    </div>

                    {/* ── Project Images / Documents Upload ── */}
                    <div className="bcta-field">
                      <label>Project Images / Brochure (optional)</label>
                      <div
                        className="bcta-upload-area"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".jpg,.jpeg,.pdf"
                          multiple
                          style={{ display: 'none' }}
                          onChange={handleFileChange}
                        />
                        <div className="bcta-upload-icon">📎</div>
                        <div className="bcta-upload-text">Click to upload JPG or PDF</div>
                        <div className="bcta-upload-hint">Project renders, floor plans, brochures · Max 20 MB each</div>
                      </div>
                      {filePreviews.length > 0 && (
                        <div className="bcta-file-list">
                          {filePreviews.map((f, i) => (
                            <div key={i} className="bcta-file-item">
                              {f.type === 'image'
                                ? <img src={f.url} alt={f.name} className="bcta-file-thumb" />
                                : <div className="bcta-file-pdf">📄</div>
                              }
                              <span className="bcta-file-name">{f.name}</span>
                              <button type="button" className="bcta-file-remove" onClick={() => removeFile(i)}>✕</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ── Amenities ── */}
                    <div className="bcta-field">
                      <label>Project Amenities (optional)</label>
                      <div className="bcta-amenities-grid">
                        {ALL_AMENITIES.map(a => {
                          const active = (form.amenities || []).includes(a);
                          return (
                            <div
                              key={a}
                              className={`bcta-amenity-chip${active ? ' active' : ''}`}
                              onClick={() => toggleAmenity(a)}
                            >
                              {active ? '✓ ' : ''}{a}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className={`bcta-submit${status === 'submitting' ? ' loading' : ''}`}
                      disabled={status === 'submitting'}
                    >
                      {status === 'submitting' ? (
                        <span className="bcta-spinner" />
                      ) : (
                        'Submit Builder Application →'
                      )}
                    </button>

                    <p className="bcta-terms">
                      By submitting, you agree to our listing terms. We verify all projects against RERA before going live.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            )}
          </motion.div>
        </div>

        {/* ── Live Listings ── */}
        <motion.div
          className="bcta-listings-header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="bcta-listings-eyebrow">Live on Platform</div>
          <h3 className="bcta-listings-title">Properties Listed by Our Builders</h3>
          <p className="bcta-listings-sub">Every listing below was submitted directly by the developer — no broker, no markup.</p>
        </motion.div>

        <div className="bcta-listings-grid">
          {LISTED_PROPERTIES.map((p, i) => {
            const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG['Ready to Move'];
            return (
              <motion.div
                key={p.id}
                className="bcta-prop-card"
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6, transition: { duration: 0.22 } }}
              >
                {/* Image */}
                <div className="bcta-prop-img-wrap">
                  <img src={p.img} alt={p.name} className="bcta-prop-img" loading="lazy" />
                  <span
                    className="bcta-prop-status"
                    style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}40` }}
                  >
                    {cfg.icon} {p.status}
                  </span>
                  <span className="bcta-prop-rera">RERA ✓</span>
                </div>

                {/* Body */}
                <div className="bcta-prop-body">
                  <div className="bcta-prop-builder">{p.builder}</div>
                  <h4 className="bcta-prop-name">{p.name}</h4>
                  <div className="bcta-prop-loc">📍 {p.location}</div>

                  <div className="bcta-prop-meta">
                    <span>🏠 {p.config}</span>
                    <span>📐 {p.area}</span>
                  </div>

                  <div className="bcta-prop-footer">
                    <div className="bcta-prop-price">{p.price}</div>
                    <button className="bcta-prop-btn" onClick={() => openContactModal(p)}>Contact Builder</button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="bcta-listings-cta"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p>Seeing only 6? There are <strong>2,500+ live listings</strong> on the platform.</p>
          <button className="bcta-view-all-btn">View All Properties →</button>
        </motion.div>

      </div>

      {/* ── Contact Builder Lead Modal ── */}
      <AnimatePresence>
        {contactProp && (
          <motion.div
            className="bcta-lead-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeContactModal}
          >
            <motion.div
              className="bcta-lead-modal"
              initial={{ opacity: 0, scale: 0.93, y: 28 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 28 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={e => e.stopPropagation()}
            >
              <button className="bcta-lead-close" onClick={closeContactModal}>✕</button>

              <AnimatePresence mode="wait">
                {leadStatus === 'success' ? (
                  <motion.div key="success" className="bcta-lead-success"
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="bcta-lead-success-icon">
                      <svg viewBox="0 0 60 60" width="64" height="64">
                        <circle cx="30" cy="30" r="28" fill="none" stroke="#22c55e" strokeWidth="3"/>
                        <polyline points="18,31 26,39 42,21" fill="none" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3>Request Sent!</h3>
                    <p>Your interest in <strong>{contactProp.name}</strong> has been recorded. {contactProp.builder} will contact you within 24 hours.</p>
                    <button className="bcta-submit" style={{ marginTop: 12 }} onClick={closeContactModal}>Done</button>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {/* Property Info Strip */}
                    <div className="bcta-lead-prop-strip">
                      <img src={contactProp.img} alt={contactProp.name} className="bcta-lead-prop-img" />
                      <div className="bcta-lead-prop-info">
                        <div className="bcta-lead-builder-name">{contactProp.builder}</div>
                        <div className="bcta-lead-prop-name">{contactProp.name}</div>
                        <div className="bcta-lead-prop-meta">
                          <span>📍 {contactProp.location}</span>
                          <span>💰 {contactProp.price}</span>
                        </div>
                        <div className="bcta-lead-prop-meta">
                          <span>🏠 {contactProp.config}</span>
                          {contactProp.rera !== 'Applied' && (
                            <span style={{ color: '#22c55e' }}>✅ RERA: {contactProp.rera}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <h3 className="bcta-lead-title">Contact {contactProp.builder}</h3>
                    <p className="bcta-lead-sub">Fill your details and the builder's team will reach out to you directly.</p>

                    <form className="bcta-lead-form" onSubmit={handleLeadSubmit} noValidate>
                      {leadErr && <div className="bcta-error">{leadErr}</div>}

                      <div className="bcta-row">
                        <div className="bcta-field">
                          <label>Full Name *</label>
                          <input
                            value={leadForm.name}
                            onChange={e => setLeadForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="Your full name" required
                          />
                        </div>
                        <div className="bcta-field">
                          <label>Phone Number *</label>
                          <input
                            type="tel"
                            value={leadForm.phone}
                            onChange={e => setLeadForm(f => ({ ...f, phone: e.target.value }))}
                            placeholder="+91 98765 43210" required
                          />
                        </div>
                      </div>

                      <div className="bcta-field">
                        <label>Email Address</label>
                        <input
                          type="email"
                          value={leadForm.email}
                          onChange={e => setLeadForm(f => ({ ...f, email: e.target.value }))}
                          placeholder="you@email.com"
                        />
                      </div>

                      <div className="bcta-field">
                        <label>Message (optional)</label>
                        <textarea
                          value={leadForm.message}
                          onChange={e => setLeadForm(f => ({ ...f, message: e.target.value }))}
                          placeholder={`I'm interested in ${contactProp.name}. Please share pricing, payment plan and site visit availability.`}
                          rows={3}
                        />
                      </div>

                      <button
                        type="submit"
                        className={`bcta-submit${leadStatus === 'submitting' ? ' loading' : ''}`}
                        disabled={leadStatus === 'submitting'}
                      >
                        {leadStatus === 'submitting'
                          ? <span className="bcta-spinner" />
                          : `📨 Send Interest to ${contactProp.builder} →`}
                      </button>

                      <p className="bcta-terms" style={{ marginTop: 10 }}>
                        Your details are shared only with {contactProp.builder}. We never sell your data.
                      </p>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
