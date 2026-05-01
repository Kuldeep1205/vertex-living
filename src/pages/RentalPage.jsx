import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { useRentalAuth } from '../context/RentalAuthContext';
import { generateCityConfig, getCitiesByRegion } from '../data/cityData';
import './RentalPage.css';

const API = import.meta.env.VITE_API_URL || 'https://vertex-living-server.onrender.com';

// ─── Utility ──────────────────────────────────────────────────────────────────

function fmtRent(n) {
  if (!n && n !== 0) return '—';
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function furnishingBadge(f) {
  if (f === 'Furnished')      return 'rental-badge rental-badge-furnished';
  if (f === 'Semi-Furnished') return 'rental-badge rental-badge-semi';
  return 'rental-badge rental-badge-unfurnished';
}


const PROPERTY_TYPES = ['1BHK','2BHK','3BHK','4BHK','Villa','PG','Commercial'];
const FURNISHING_OPTIONS = ['Furnished','Semi-Furnished','Unfurnished'];

// ─── City SEO Configs — lazy-built from cityData.js ───────────────────────────
const CITY_CONFIGS = {};
function getAllCityConfigs() {
  if (Object.keys(CITY_CONFIGS).length > 0) return CITY_CONFIGS;
  const allSlugs = [
    'mumbai','bangalore','hyderabad','chennai','kolkata','pune',
    'delhi','gurugram','gurgaon','noida','greater-noida','faridabad','ghaziabad','jaipur',
    'navi-mumbai','thane',
    'ahmedabad','chandigarh','lucknow','kochi','indore','bhopal','surat','vadodara','rajkot','nagpur','coimbatore','visakhapatnam','mangalore','mysore','dehradun','patna','bhubaneswar','raipur','ranchi','jamshedpur','guwahati',
    'ludhiana','jalandhar','kanpur','allahabad','varanasi','srinagar','jammu','shimla','goa','trivandrum','madurai',
    'gwalior','jabalpur','bilaspur','siliguri','aligarh','bareilly','moradabad','mathura','kolhapur','nashik','aurangabad','saharanpur',
  ];
  allSlugs.forEach(s => { CITY_CONFIGS[s] = generateCityConfig(s); });
  return CITY_CONFIGS;
}

// ─── City FAQ Data ────────────────────────────────────────────────────────────
const CITY_FAQS = {
  default: [
    { name: 'What is the average rent for a 2BHK flat in this city?', acceptedAnswer: { text: 'Average rent for a 2BHK in most cities ranges from ₹12,000 to ₹30,000/month depending on location, furnishing, and amenities. Premium localities command higher rents. Vertex Living lists verified properties at all price points.' } },
    { name: 'Is it possible to rent a flat without paying brokerage?', acceptedAnswer: { text: 'Yes! All properties on Vertex Living are listed directly by verified owners — zero brokerage guaranteed. You deal directly with the landlord or their authorised representative.' } },
    { name: 'What documents are required to rent a flat?', acceptedAnswer: { text: 'Standard documents include: valid ID proof (Aadhaar/Passport), PAN card, passport-size photographs, address proof, employment/income proof, and 2–3 months rent as security deposit. Some landlords may also require a NOC from your current landlord.' } },
    { name: 'Are there furnished flats available for rent?', acceptedAnswer: { text: 'Yes, Vertex Living lists both furnished, semi-furnished, and unfurnished properties. Fully furnished 2BHK/3BHK flats typically cost ₹5,000–₹15,000 more per month in rent but save you the cost of buying furniture.' } },
    { name: 'How do I schedule a site visit?', acceptedAnswer: { text: 'Simply click the "Contact Owner" button on any listing, fill in your details, and the owner will connect with you directly. You can also call or WhatsApp the owner directly — no middlemen involved.' } },
    { name: 'Is the security deposit refundable?', acceptedAnswer: { text: 'In most cases, the security deposit (typically 2–3 months rent) is fully refundable at the end of your tenancy, subject to property condition. Always get the terms in writing in your rental agreement.' } },
    { name: 'What is the typical lease duration?', acceptedAnswer: { text: 'Standard residential lease duration in India is 11 months, renewable by mutual agreement. Some owners may offer shorter or longer terms. Vertex Living recommends a registered rent agreement for legal protection.' } },
    { name: 'Can I list my property for rent on Vertex Living?', acceptedAnswer: { text: 'Yes! Register as an owner on Vertex Living and list your property for free. Reach thousands of verified tenants across India without paying any brokerage commission.' } },
  ],
};
const AMENITIES_LIST = [
  'Parking','Lift','24/7 Security','Power Backup','Gym','Swimming Pool',
  'Club House','Intercom','CCTV','Visitors Parking','Pet Friendly','Gas Pipeline',
  'Gated Community','Modular Kitchen','Balcony','Terrace',
];

const RENT_RANGES = [
  { label: 'Any',      min: 0,     max: Infinity },
  { label: '< ₹10K',  min: 0,     max: 10000 },
  { label: '₹10K–25K',min: 10000, max: 25000 },
  { label: '₹25K–50K',min: 25000, max: 50000 },
  { label: '₹50K+',   min: 50000, max: Infinity },
];

// ─── Small icon helpers ────────────────────────────────────────────────────────

const IconBed   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 9V21"/><path d="M22 9V21"/><path d="M2 21H22"/><rect x="2" y="9" width="20" height="8" rx="2"/><path d="M6 9V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"/></svg>;
const IconBath  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><line x1="10" x2="8" y1="5" y2="7"/><line x1="2" x2="22" y1="12" y2="12"/></svg>;
const IconArea  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>;
const IconPin   = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconHome  = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;

// ─── Location Autocomplete Input ───────────────────────────────────────────────

function LocationInput({ value, onChange, placeholder = 'Search city, area, locality…' }) {
  const [query, setQuery]       = useState(value || '');
  const [suggestions, setSugg]  = useState([]);
  const [detecting, setDetect]  = useState(false);
  const [open, setOpen]         = useState(false);
  const debounceRef             = useRef(null);
  const wrapRef                 = useRef(null);

  // Sync external value changes
  useEffect(() => { setQuery(value || ''); }, [value]);

  // Close on outside click
  useEffect(() => {
    const fn = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const fetchSuggestions = useCallback((q) => {
    if (!q || q.length < 2) { setSugg([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&countrycodes=in&format=json&limit=6&addressdetails=1`;
        const res  = await fetch(url, { headers: { 'Accept-Language': 'en' } });
        const data = await res.json();
        const seen = new Set();
        const items = data
          .map(d => {
            const a = d.address || {};
            const parts = [
              a.suburb || a.neighbourhood || a.quarter,
              a.city_district || a.county,
              a.city || a.town || a.village || a.municipality,
              a.state,
            ].filter(Boolean);
            return [...new Set(parts)].join(', ');
          })
          .filter(label => { if (!label || seen.has(label)) return false; seen.add(label); return true; });
        setSugg(items);
        setOpen(items.length > 0);
      } catch { setSugg([]); }
    }, 350);
  }, []);

  const handleChange = (e) => {
    const v = e.target.value;
    setQuery(v);
    onChange(v);
    fetchSuggestions(v);
  };

  const pick = (label) => {
    setQuery(label);
    onChange(label);
    setSugg([]);
    setOpen(false);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setDetect(true);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const url  = `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json&addressdetails=1`;
        const res  = await fetch(url, { headers: { 'Accept-Language': 'en' } });
        const data = await res.json();
        const a    = data.address || {};
        const label = [
          a.suburb || a.neighbourhood,
          a.city_district,
          a.city || a.town || a.village,
          a.state,
        ].filter(Boolean).join(', ') || data.display_name?.split(',').slice(0, 3).join(',');
        if (label) { setQuery(label); onChange(label); }
      } catch {}
      setDetect(false);
    }, () => setDetect(false));
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'flex', gap: 6 }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <input
          className="rental-input"
          value={query}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
        />
        {open && suggestions.length > 0 && (
          <ul style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 999,
            background: 'var(--rp-surface, #1e293b)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: '6px 0', margin: 0, listStyle: 'none',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)', maxHeight: 220, overflowY: 'auto',
          }}>
            {suggestions.map((s, i) => (
              <li key={i}
                onMouseDown={() => pick(s)}
                style={{
                  padding: '8px 14px', cursor: 'pointer', fontSize: '0.85rem',
                  color: 'var(--rp-text, #e2e8f0)', display: 'flex', alignItems: 'center', gap: 8,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <IconPin /> {s}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        type="button"
        title="Detect my location"
        onClick={detectLocation}
        disabled={detecting}
        style={{
          padding: '0 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(99,102,241,0.12)', color: '#818cf8', cursor: 'pointer',
          fontSize: '1rem', flexShrink: 0, transition: 'all 0.2s',
        }}
      >
        {detecting ? '…' : '📍'}
      </button>
    </div>
  );
}

// ─── Auth Modal ────────────────────────────────────────────────────────────────

function RentalAuthModal() {
  const {
    rentalAuthModal, closeRentalAuth, rentalTab, setRentalTab,
    rentalLogin, rentalRegister,
  } = useRentalAuth();

  const [form, setForm]   = useState({ name:'', email:'', password:'', phone:'', role:'tenant' });
  const [err, setErr]     = useState('');
  const [busy, setBusy]   = useState(false);

  useEffect(() => {
    if (!rentalAuthModal) { setErr(''); setForm({ name:'', email:'', password:'', phone:'', role:'tenant' }); }
  }, [rentalAuthModal]);

  if (!rentalAuthModal) return null;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    let error;
    if (rentalTab === 'login') {
      error = await rentalLogin(form.email, form.password);
    } else {
      if (!form.name.trim()) { setBusy(false); setErr('Name is required.'); return; }
      if (!form.phone.trim()) { setBusy(false); setErr('Phone is required.'); return; }
      error = await rentalRegister(form.name, form.email, form.password, form.phone, form.role);
    }
    setBusy(false);
    if (error) setErr(error);
  };

  return (
    <div className="rental-modal-overlay" onClick={e => e.target === e.currentTarget && closeRentalAuth()}>
      <div className="rental-modal rental-modal-narrow">
        <div className="rental-modal-header">
          <h2>Rental Portal</h2>
          <button className="rental-modal-close" onClick={closeRentalAuth}>&#x2715;</button>
        </div>
        <div className="rental-modal-body">
          <div className="rental-auth-tabs">
            <button className={`rental-auth-tab${rentalTab === 'login' ? ' active' : ''}`} onClick={() => { setRentalTab('login'); setErr(''); }}>Sign In</button>
            <button className={`rental-auth-tab${rentalTab === 'register' ? ' active' : ''}`} onClick={() => { setRentalTab('register'); setErr(''); }}>Create Account</button>
          </div>
          <form className="rental-form" onSubmit={handleSubmit}>
            {rentalTab === 'register' && (
              <>
                <div className="rental-form-group">
                  <label>Full Name</label>
                  <input className="rental-input" placeholder="Enter your name" value={form.name} onChange={e => set('name', e.target.value)} required />
                </div>
                <div className="rental-form-group">
                  <label>I am a</label>
                  <div className="rental-role-selector">
                    {['tenant','owner'].map(r => (
                      <div key={r} className={`rental-role-option${form.role === r ? ' selected' : ''}`} onClick={() => set('role', r)}>
                        <div className="rental-role-option-icon">{r === 'owner' ? '🏠' : '🔑'}</div>
                        <div className="rental-role-option-title">{r === 'owner' ? 'Owner' : 'Tenant'}</div>
                        <div className="rental-role-option-desc">{r === 'owner' ? 'List my property' : 'Looking to rent'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            <div className="rental-form-group">
              <label>Email Address</label>
              <input className="rental-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div className="rental-form-group">
              <label>Password</label>
              <input className="rental-input" type="password" placeholder="Enter password" value={form.password} onChange={e => set('password', e.target.value)} required />
            </div>
            {rentalTab === 'register' && (
              <div className="rental-form-group">
                <label>Phone Number</label>
                <input className="rental-input" type="tel" placeholder="+91 9671009931" value={form.phone} onChange={e => set('phone', e.target.value)} required />
              </div>
            )}
            {err && <div className="rental-form-error">{err}</div>}
            <button className="rental-btn" type="submit" disabled={busy}>
              {busy ? 'Please wait…' : rentalTab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Inline Auth Section (shown on page instead of modal) ─────────────────────

function RentalInlineAuth() {
  const { rentalLogin, rentalRegister } = useRentalAuth();
  const [tab,  setTab]  = useState('login');  // 'login' | 'register'
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'', role:'tenant' });
  const [err,  setErr]  = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    let error;
    if (tab === 'login') {
      error = await rentalLogin(form.email, form.password);
    } else {
      if (!form.name.trim())  { setBusy(false); setErr('Name is required.'); return; }
      if (!form.phone.trim()) { setBusy(false); setErr('Phone is required.'); return; }
      error = await rentalRegister(form.name, form.email, form.password, form.phone, form.role);
    }
    setBusy(false);
    if (error) setErr(error);
  };

  return (
    <div style={{ maxWidth: 460, margin: '0 auto', padding: '0 16px 32px' }}>
      <div style={{
        background: 'var(--rp-surface, #161b22)',
        border: '1px solid var(--rp-border, #30363d)',
        borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
      }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--rp-border, #30363d)' }}>
          {['login','register'].map(t => (
            <button key={t}
              onClick={() => { setTab(t); setErr(''); }}
              style={{
                flex: 1, padding: '16px', border: 'none', cursor: 'pointer',
                background: tab === t ? 'rgba(99,102,241,0.1)' : 'transparent',
                color: tab === t ? '#818cf8' : 'var(--rp-muted, #8b949e)',
                fontWeight: 700, fontSize: '0.9rem', fontFamily: 'inherit',
                borderBottom: tab === t ? '2px solid #6366f1' : '2px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              {t === 'login' ? '🔑 Sign In' : '✨ Register'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{ marginBottom: 10, fontSize: '0.8rem', color: 'var(--rp-muted)', textAlign: 'center' }}>
            {tab === 'login'
              ? 'Welcome back! Sign in to your rental account.'
              : 'Create your free account and start renting or listing.'}
          </div>

          {tab === 'register' && (
            <>
              <div className="rental-form-group" style={{ marginTop: 12 }}>
                <label>Full Name</label>
                <input className="rental-input" placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} required />
              </div>
              <div className="rental-form-group">
                <label>Phone Number</label>
                <input className="rental-input" type="tel" placeholder="+91 9671009931" value={form.phone} onChange={e => set('phone', e.target.value)} required />
              </div>
              <div className="rental-form-group">
                <label>I am a</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['tenant','owner'].map(r => (
                    <button key={r} type="button"
                      onClick={() => set('role', r)}
                      style={{
                        flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer',
                        border: form.role === r ? '2px solid #6366f1' : '1px solid var(--rp-border, #30363d)',
                        background: form.role === r ? 'rgba(99,102,241,0.12)' : 'transparent',
                        color: form.role === r ? '#818cf8' : 'var(--rp-muted)',
                        fontWeight: 700, fontSize: '0.85rem', fontFamily: 'inherit',
                        transition: 'all 0.2s',
                      }}
                    >
                      {r === 'tenant' ? '🧑‍💼 Tenant' : '🏠 Owner'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="rental-form-group" style={{ marginTop: tab === 'register' ? 0 : 12 }}>
            <label>Email Address</label>
            <input className="rental-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
          </div>
          <div className="rental-form-group">
            <label>Password</label>
            <input className="rental-input" type="password" placeholder="Enter password" value={form.password} onChange={e => set('password', e.target.value)} required />
          </div>

          {err && <div className="rental-form-error" style={{ marginBottom: 12 }}>{err}</div>}

          <button type="submit" className="rental-btn" style={{ width: '100%', padding: '12px', fontSize: '0.95rem', marginTop: 4 }} disabled={busy}>
            {busy ? (tab === 'login' ? 'Signing in…' : 'Creating account…') : (tab === 'login' ? 'Sign In' : 'Create Account')}
          </button>

          <div style={{ textAlign: 'center', marginTop: 14, fontSize: '0.82rem', color: 'var(--rp-muted)' }}>
            {tab === 'login'
              ? <>Don't have an account? <button type="button" onClick={() => { setTab('register'); setErr(''); }} style={{ background:'none', border:'none', color:'#818cf8', cursor:'pointer', fontWeight:700, padding:0 }}>Register free</button></>
              : <>Already have an account? <button type="button" onClick={() => { setTab('login'); setErr(''); }} style={{ background:'none', border:'none', color:'#818cf8', cursor:'pointer', fontWeight:700, padding:0 }}>Sign In</button></>
            }
          </div>
        </form>
      </div>

      {/* Info row below the card */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16, flexWrap: 'wrap' }}>
        {['🔒 Secure & Private', '✅ Verified Owners', '🆓 Free to Use'].map(t => (
          <span key={t} style={{ fontSize: '0.78rem', color: 'var(--rp-muted)' }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Add Property Modal ────────────────────────────────────────────────────────

function AddPropertyModal({ onClose, onAdded }) {
  const { rentalUser } = useRentalAuth();
  const blank = {
    title:'', type:'2BHK', rentPerMonth:'', deposit:'', area:'', location:'', sector:'',
    furnishing:'Unfurnished', bedrooms:'', bathrooms:'', floor:'', totalFloors:'',
    availableFrom:'', description:'', amenities:[],
  };
  const [form, setForm]         = useState(blank);
  const [err, setErr]           = useState('');
  const [busy, setBusy]         = useState(false);
  const [photoFiles, setPhotoFiles] = useState([]);   // File objects
  const [photoPreviews, setPhotoPreviews] = useState([]); // local blob URLs
  const [uploading, setUploading]   = useState(false);
  const fileInputRef = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleAmenity = (a) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a],
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5); // max 5
    setPhotoFiles(files);
    const previews = files.map(f => URL.createObjectURL(f));
    setPhotoPreviews(previews);
  };

  const removePhoto = (i) => {
    setPhotoFiles(prev => prev.filter((_, idx) => idx !== i));
    setPhotoPreviews(prev => {
      URL.revokeObjectURL(prev[i]);
      return prev.filter((_, idx) => idx !== i);
    });
    // reset file input so same file can be re-added
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      // 1. Upload photos first
      let uploadedUrls = [];
      if (photoFiles.length > 0) {
        setUploading(true);
        const fd = new FormData();
        photoFiles.forEach(f => fd.append('files', f));
        const upRes  = await fetch(`${API}/api/builder/upload-files`, { method: 'POST', body: fd });
        const upData = await upRes.json();
        if (!upRes.ok) { setErr(upData.error || 'Photo upload failed.'); setBusy(false); setUploading(false); return; }
        uploadedUrls = upData.urls || [];
        setUploading(false);
      }

      // 2. Save property
      const res = await fetch(`${API}/api/rental/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          photos: uploadedUrls,
          ownerId: rentalUser.id,
          ownerName: rentalUser.name,
          ownerPhone: rentalUser.phone,
          ownerEmail: rentalUser.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || 'Failed to add property.'); setBusy(false); return; }
      onAdded(data.property);
      onClose();
    } catch {
      setErr('Server not reachable.');
    }
    setBusy(false);
  };

  return (
    <div className="rental-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rental-modal">
        <div className="rental-modal-header">
          <h2>List a New Property</h2>
          <button className="rental-modal-close" onClick={onClose}>&#x2715;</button>
        </div>
        <div className="rental-modal-body">
          <form className="rental-form" onSubmit={handleSubmit}>
            <div className="rental-form-group">
              <label>Property Title</label>
              <input className="rental-input" placeholder="e.g. Spacious 2BHK in Sector 47" value={form.title} onChange={e => set('title', e.target.value)} required />
            </div>

            <div className="rental-form-row">
              <div className="rental-form-group">
                <label>Property Type</label>
                <select className="rental-select" value={form.type} onChange={e => set('type', e.target.value)}>
                  {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="rental-form-group">
                <label>Furnishing</label>
                <select className="rental-select" value={form.furnishing} onChange={e => set('furnishing', e.target.value)}>
                  {FURNISHING_OPTIONS.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div className="rental-form-row">
              <div className="rental-form-group">
                <label>Rent Per Month (₹)</label>
                <input className="rental-input" type="number" min="0" placeholder="e.g. 25000" value={form.rentPerMonth} onChange={e => set('rentPerMonth', e.target.value)} required />
              </div>
              <div className="rental-form-group">
                <label>Security Deposit (₹)</label>
                <input className="rental-input" type="number" min="0" placeholder="e.g. 50000" value={form.deposit} onChange={e => set('deposit', e.target.value)} />
              </div>
            </div>

            <div className="rental-form-row">
              <div className="rental-form-group">
                <label>Bedrooms</label>
                <input className="rental-input" type="number" min="0" placeholder="e.g. 2" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} />
              </div>
              <div className="rental-form-group">
                <label>Bathrooms</label>
                <input className="rental-input" type="number" min="0" placeholder="e.g. 2" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} />
              </div>
            </div>

            <div className="rental-form-row">
              <div className="rental-form-group">
                <label>Area (sq ft)</label>
                <input className="rental-input" placeholder="e.g. 1200 sq ft" value={form.area} onChange={e => set('area', e.target.value)} />
              </div>
              <div className="rental-form-group">
                <label>Available From</label>
                <input className="rental-input" type="date" value={form.availableFrom} onChange={e => set('availableFrom', e.target.value)} />
              </div>
            </div>

            <div className="rental-form-row">
              <div className="rental-form-group">
                <label>Floor</label>
                <input className="rental-input" placeholder="e.g. 3rd" value={form.floor} onChange={e => set('floor', e.target.value)} />
              </div>
              <div className="rental-form-group">
                <label>Total Floors</label>
                <input className="rental-input" placeholder="e.g. 12" value={form.totalFloors} onChange={e => set('totalFloors', e.target.value)} />
              </div>
            </div>

            <div className="rental-form-group">
              <label>City / Locality <span style={{ fontSize:'0.75rem', color:'var(--rp-muted)' }}>(Gurugram & Delhi NCR)</span></label>
              <LocationInput
                value={form.sector}
                onChange={v => set('sector', v)}
                placeholder="e.g. Koramangala, Bengaluru or Sector 47, Gurgaon…"
              />
            </div>

            <div className="rental-form-group">
              <label>Full Address</label>
              <input className="rental-input" placeholder="Building name, street, landmark" value={form.location} onChange={e => set('location', e.target.value)} />
            </div>

            <div className="rental-form-group">
              <label>Description</label>
              <textarea className="rental-textarea" placeholder="Describe the property — highlights, nearby landmarks, special features…" value={form.description} onChange={e => set('description', e.target.value)} rows={4} />
            </div>

            <div className="rental-form-group">
              <label>Amenities</label>
              <div className="rental-amenities-grid">
                {AMENITIES_LIST.map(a => (
                  <label key={a} className="rental-amenity-check">
                    <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} />
                    {a}
                  </label>
                ))}
              </div>
            </div>

            <div className="rental-form-group">
              <label>Property Photos <span style={{ fontSize:'0.75rem', color:'var(--rp-muted)' }}>(JPG / PDF, up to 5 files)</span></label>
              <div
                className="rental-upload-zone"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.5 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span>Click to select files</span>
                <span style={{ fontSize:'0.75rem', opacity: 0.5 }}>Images, Videos, PDFs & all types · max 100 MB each</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="*/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              {photoPreviews.length > 0 && (
                <div className="rental-photos-preview" style={{ marginTop: 10 }}>
                  {photoPreviews.map((src, i) => (
                    <div key={i} style={{ position: 'relative', display: 'inline-block' }}>
                      {photoFiles[i]?.name?.endsWith('.pdf') ? (
                        <div className="rental-photo-thumb" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:8, fontSize:'0.7rem', color:'#818cf8', gap:4 }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          PDF
                        </div>
                      ) : (
                        <img className="rental-photo-thumb" src={src} alt="" />
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        style={{
                          position:'absolute', top:-6, right:-6, width:18, height:18,
                          borderRadius:'50%', background:'#ef4444', border:'none',
                          color:'#fff', fontSize:'10px', cursor:'pointer', lineHeight:'18px', textAlign:'center',
                        }}
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {err && <div className="rental-form-error">{err}</div>}

            <div className="rental-form-actions">
              <button type="button" className="rental-btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="rental-btn" disabled={busy}>
                {uploading ? 'Uploading photos…' : busy ? 'Listing…' : 'List Property'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Inquiry Modal ─────────────────────────────────────────────────────────────

function InquiryModal({ property, onClose }) {
  const { rentalUser } = useRentalAuth();
  const [form, setForm] = useState({
    tenantName:  rentalUser?.name  || '',
    tenantEmail: rentalUser?.email || '',
    tenantPhone: rentalUser?.phone || '',
    message: '',
  });
  const [err, setErr]       = useState('');
  const [success, setSuccess] = useState(false);
  const [busy, setBusy]     = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const res = await fetch(`${API}/api/rental/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          propertyTitle: property.title,
          ownerId: property.ownerId,
          ...form,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || 'Failed to send inquiry.'); setBusy(false); return; }
      setSuccess(true);
    } catch {
      setErr('Server not reachable.');
    }
    setBusy(false);
  };

  return (
    <div className="rental-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rental-modal rental-modal-narrow">
        <div className="rental-modal-header">
          <h2>Contact Owner</h2>
          <button className="rental-modal-close" onClick={onClose}>&#x2715;</button>
        </div>
        <div className="rental-modal-body">
          {success ? (
            <div className="rental-form-success" style={{ textAlign:'center', padding:'24px' }}>
              <div style={{ fontSize:'2rem', marginBottom:8 }}>&#10003;</div>
              <strong>Inquiry sent!</strong>
              <p style={{ marginTop:8, marginBottom:16, fontSize:'0.88rem' }}>The owner will contact you shortly.</p>
              <button className="rental-btn" onClick={onClose}>Close</button>
            </div>
          ) : (
            <>
              {/* Property info */}
              <div style={{ marginBottom:14, padding:'12px 14px', background:'var(--rp-surface2)', borderRadius:10, border:'1px solid var(--rp-border)' }}>
                <div style={{ fontWeight:700, fontSize:'0.92rem' }}>{property.title}</div>
                <div style={{ fontSize:'0.8rem', color:'var(--rp-muted)', marginTop:2 }}>{property.sector || property.location} &nbsp;·&nbsp; {fmtRent(property.rentPerMonth)}/mo</div>
              </div>

              {/* Owner direct contact */}
              {(property.ownerPhone || property.ownerEmail) && (
                <div style={{ marginBottom:16, padding:'14px', background:'rgba(34,197,94,0.06)', borderRadius:10, border:'1px solid rgba(34,197,94,0.2)' }}>
                  <div style={{ fontSize:'0.75rem', fontWeight:700, color:'#22c55e', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>📞 Owner Direct Contact</div>
                  <div style={{ fontWeight:700, fontSize:'0.9rem', marginBottom:6 }}>{property.ownerName}</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {property.ownerPhone && (
                      <a href={`tel:${property.ownerPhone}`} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, background:'rgba(34,197,94,0.12)', color:'#22c55e', textDecoration:'none', fontSize:'0.85rem', fontWeight:600, border:'1px solid rgba(34,197,94,0.25)' }}>
                        📱 {property.ownerPhone}
                      </a>
                    )}
                    {property.ownerPhone && (() => {
                      const num = property.ownerPhone.replace(/\D/g, '');
                      const phone = num.startsWith('91') ? num : `91${num}`;
                      const msg = encodeURIComponent(`Hi ${property.ownerName}, I'm interested in your property "${property.title}" listed on Vertex Living (${property.sector || property.location}). Rent: ${fmtRent(property.rentPerMonth)}/mo. Please share more details.`);
                      return (
                        <a href={`https://wa.me/${phone}?text=${msg}`} target="_blank" rel="noopener noreferrer"
                          style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, background:'rgba(37,211,102,0.12)', color:'#25d366', textDecoration:'none', fontSize:'0.85rem', fontWeight:600, border:'1px solid rgba(37,211,102,0.3)' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          WhatsApp
                        </a>
                      );
                    })()}
                    {property.ownerEmail && (
                      <a href={`mailto:${property.ownerEmail}`} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, background:'rgba(99,102,241,0.1)', color:'#818cf8', textDecoration:'none', fontSize:'0.85rem', fontWeight:600, border:'1px solid rgba(99,102,241,0.25)' }}>
                        ✉️ {property.ownerEmail}
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div style={{ fontSize:'0.8rem', color:'var(--rp-muted)', marginBottom:12 }}>Or send a message below and the owner will reply:</div>
              <form className="rental-form" onSubmit={handleSubmit}>
                <div className="rental-form-group">
                  <label>Your Name</label>
                  <input className="rental-input" placeholder="Full name" value={form.tenantName} onChange={e => set('tenantName', e.target.value)} required />
                </div>
                <div className="rental-form-group">
                  <label>Email</label>
                  <input className="rental-input" type="email" placeholder="you@example.com" value={form.tenantEmail} onChange={e => set('tenantEmail', e.target.value)} required />
                </div>
                <div className="rental-form-group">
                  <label>Phone</label>
                  <input className="rental-input" type="tel" placeholder="+91 9671009931" value={form.tenantPhone} onChange={e => set('tenantPhone', e.target.value)} />
                </div>
                <div className="rental-form-group">
                  <label>Message</label>
                  <textarea className="rental-textarea" placeholder="Hi, I'm interested in this property. Please share more details." value={form.message} onChange={e => set('message', e.target.value)} required rows={4} />
                </div>
                {err && <div className="rental-form-error">{err}</div>}
                <div className="rental-form-actions">
                  <button type="button" className="rental-btn-outline" onClick={onClose}>Cancel</button>
                  <button type="submit" className="rental-btn" disabled={busy}>{busy ? 'Sending…' : 'Send Inquiry'}</button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Inquiries Modal (owner view) ──────────────────────────────────────────────

function OwnerInquiriesModal({ property, inquiries, onClose }) {
  const mine = inquiries.filter(i => String(i.propertyId) === String(property.id));
  return (
    <div className="rental-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rental-modal">
        <div className="rental-modal-header">
          <h2>Inquiries — {property.title}</h2>
          <button className="rental-modal-close" onClick={onClose}>&#x2715;</button>
        </div>
        <div className="rental-modal-body">
          {mine.length === 0 ? (
            <p style={{ color:'var(--rp-muted)', textAlign:'center', padding:'24px 0' }}>No inquiries yet for this property.</p>
          ) : (
            <div className="rental-inquiries-list">
              {mine.map(inq => (
                <div key={inq.id} className="rental-inquiry-card">
                  <div className="rental-inquiry-header">
                    <span className="rental-inquiry-name">{inq.tenantName}</span>
                    <span className="rental-inquiry-date">{fmtDate(inq.createdAt)}</span>
                  </div>
                  <div className="rental-inquiry-contact">{inq.tenantEmail}{inq.tenantPhone ? ` · ${inq.tenantPhone}` : ''}</div>
                  <div className="rental-inquiry-message">"{inq.message}"</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Property Card ─────────────────────────────────────────────────────────────

function PropertyCard({ property, isOwner, onInquiry, onDelete, ownerInquiries }) {
  const [imgError, setImgError] = useState(false);
  const [showInqModal, setShowInqModal] = useState(false);
  const hasImg = property.photos?.length > 0 && property.photos[0] && !imgError;

  const inquiryCount = ownerInquiries?.filter(i => String(i.propertyId) === String(property.id)).length || 0;

  return (
    <div className="rental-card">
      {hasImg ? (
        <img className="rental-card-img" src={property.photos[0]} alt={property.title} onError={() => setImgError(true)} />
      ) : (
        <div className="rental-card-img-placeholder">
          <IconHome />
          <span>No photo</span>
        </div>
      )}

      <div className="rental-card-body">
        <div className="rental-card-header">
          <h3 className="rental-card-title">{property.title}</h3>
          <div>
            <div className="rental-card-price">{fmtRent(property.rentPerMonth)}<span>/mo</span></div>
          </div>
        </div>

        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          <span className="rental-badge rental-badge-type">{property.type}</span>
          <span className={furnishingBadge(property.furnishing)}>{property.furnishing}</span>
          <span className={`rental-badge ${property.status === 'active' ? 'rental-badge-active' : 'rental-badge-inactive'}`}>{property.status}</span>
        </div>

        {(property.sector || property.location) && (
          <div className="rental-card-location">
            <IconPin /> {property.sector || property.location}
          </div>
        )}

        <div className="rental-card-meta">
          {property.bedrooms > 0 && <span className="rental-card-meta-item"><IconBed /> {property.bedrooms} Bed</span>}
          {property.bathrooms > 0 && <span className="rental-card-meta-item"><IconBath /> {property.bathrooms} Bath</span>}
          {property.area && <span className="rental-card-meta-item"><IconArea /> {property.area}</span>}
          {property.floor && <span className="rental-card-meta-item">Floor {property.floor}{property.totalFloors ? `/${property.totalFloors}` : ''}</span>}
        </div>

        {property.deposit > 0 && (
          <div className="rental-card-deposit">Deposit: <strong>{fmtRent(property.deposit)}</strong></div>
        )}

        {property.availableFrom && (
          <div className="rental-available-from">&#10003; Available from {fmtDate(property.availableFrom)}</div>
        )}

        {property.amenities?.length > 0 && (
          <div className="rental-card-amenities">
            {property.amenities.slice(0, 4).map(a => <span key={a} className="rental-amenity-tag">{a}</span>)}
            {property.amenities.length > 4 && <span className="rental-amenity-tag">+{property.amenities.length - 4} more</span>}
          </div>
        )}
      </div>

      <div className="rental-card-footer">
        <div className="rental-card-owner" style={{ fontSize:'0.78rem' }}>
          {isOwner
            ? <span style={{ color:'var(--rp-success)' }}>Your listing</span>
            : <span>Owner: {property.ownerName}</span>
          }
        </div>
        <div className="rental-card-actions">
          {isOwner ? (
            <>
              <button
                className="rental-btn-outline rental-btn-outline-sm"
                onClick={() => setShowInqModal(true)}
              >
                Inquiries {inquiryCount > 0 && <span className="rental-badge rental-badge-active" style={{ marginLeft:4 }}>{inquiryCount}</span>}
              </button>
              <button
                className="rental-btn rental-btn-sm rental-btn-danger"
                onClick={() => onDelete(property.id)}
              >
                Delete
              </button>
            </>
          ) : (
            <button className="rental-btn rental-btn-sm" onClick={() => onInquiry(property)}>Contact Owner</button>
          )}
        </div>
      </div>

      {showInqModal && (
        <OwnerInquiriesModal
          property={property}
          inquiries={ownerInquiries || []}
          onClose={() => setShowInqModal(false)}
        />
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function RentalPage() {
  const { city: resolvedCity } = useParams();
  const config = resolvedCity ? (getAllCityConfigs()[resolvedCity] || generateCityConfig(resolvedCity)) : null;
  const {
    rentalUser, openRentalLogin, openRentalRegister, rentalLogout,
    isRentalOwner,
  } = useRentalAuth();

  const [activeTab, setActiveTab]     = useState('browse'); // 'browse' | 'mylistings'
  const [properties, setProperties]  = useState([]);
  const [inquiries, setInquiries]    = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [inquiryTarget, setInquiryTarget] = useState(null);

  // Filters
  const [filterType,      setFilterType]      = useState('');
  const [filterFurnishing,setFilterFurnishing]= useState('');
  const [filterRent,      setFilterRent]      = useState(0);
  const [filterSector,    setFilterSector]    = useState('');

  // Load all properties
  const loadProperties = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/rental/properties`);
      const data = await res.json();
      if (Array.isArray(data)) setProperties(data);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  // Load owner inquiries
  const loadInquiries = useCallback(async () => {
    if (!rentalUser || !isRentalOwner) return;
    try {
      const res = await fetch(`${API}/api/rental/inquiries/${rentalUser.id}`);
      const data = await res.json();
      if (Array.isArray(data)) setInquiries(data);
    } catch { /* ignore */ }
  }, [rentalUser, isRentalOwner]);

  useEffect(() => { loadProperties(); }, [loadProperties]);
  useEffect(() => { loadInquiries(); }, [loadInquiries]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await fetch(`${API}/api/rental/properties/${id}`, { method: 'DELETE' });
      setProperties(prev => prev.filter(p => p.id !== id));
    } catch { /* ignore */ }
  };

  const handleAdded = (property) => {
    setProperties(prev => [property, ...prev]);
    loadInquiries();
  };

  const rentRange = RENT_RANGES[filterRent];
  const filtered = properties.filter(p => {
    // City filter (from /rent/:city route)
    if (resolvedCity && config) {
      const locLower = `${p.sector || ''} ${p.location || ''} ${p.city || ''}`.toLowerCase();
      const cityNorm = resolvedCity.toLowerCase();
      const extraTerms = cityNorm === 'gurugram' ? ['gurgaon'] : cityNorm === 'gurgaon' ? ['gurugram'] : [];
      if (![cityNorm, ...extraTerms].some(t => locLower.includes(t) || locLower.includes(t.replace(/-/g, ' ')))) return false;
    }
    if (filterType       && p.type !== filterType) return false;
    if (filterFurnishing && p.furnishing !== filterFurnishing) return false;
    if (p.rentPerMonth < rentRange.min || p.rentPerMonth > rentRange.max) return false;
    if (filterSector) {
      const words = filterSector.toLowerCase().split(/[\s,]+/).filter(w => w.length > 1);
      const loc = `${p.sector || ''} ${p.location || ''}`.toLowerCase();
      if (words.length > 0 && !words.some(w => loc.includes(w))) return false;
    }
    return true;
  });

  const myProperties = properties.filter(p => rentalUser && String(p.ownerId) === String(rentalUser.id));
  const displayList  = activeTab === 'mylistings' ? myProperties : filtered;
  const displayCount = activeTab === 'mylistings' ? myProperties.length : filtered.length;

  const clearFilters = () => {
    setFilterType(''); setFilterFurnishing(''); setFilterRent(0); setFilterSector('');
  };
  const hasFilters = filterType || filterFurnishing || filterRent > 0 || filterSector;

  return (
    <div className="rental-page">
      <Helmet>
        <title>{config ? config.title : 'Rent Property in India — Zero Brokerage | Vertex Living'}</title>
        <meta name="description" content={config ? config.description : 'Rent verified flats, apartments & houses anywhere in India. Zero brokerage. Direct from owners. Updated daily.'} />
        <meta name="keywords" content={config ? config.keywords : 'rent property India, flat for rent India, rent flat India, rental property, 2bhk rent India, 3bhk rent India, vertex living rental'} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
        <link rel="canonical" href={`https://vertexliving.in/rent${resolvedCity ? '/' + resolvedCity : ''}`} />
        {config && <meta name="geo.region" content={config.geoRegion} />}
        {config && <meta name="geo.placename" content={config.displayName + ', India'} />}
        {config && <meta name="geo.position" content={config.geoPosition} />}
        {config && <meta name="ICBM" content={config.geoPosition} />}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={config ? config.ogTitle : 'Rent Property Anywhere in India | Zero Brokerage | Vertex Living'} />
        <meta property="og:description" content={config ? config.ogDesc : 'Rent verified flats & apartments across India. Zero brokerage. Direct from owners.'} />
        <meta property="og:url" content={`https://vertexliving.in/rent${resolvedCity ? '/' + resolvedCity : ''}`} />
        <meta property="og:image" content="https://vertexliving.in/logo1.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Vertex Living" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={config ? config.ogTitle : 'Rent Property Anywhere in India | Zero Brokerage | Vertex Living'} />
        <meta name="twitter:description" content={config ? config.ogDesc : 'Rent verified flats & apartments across India. Zero brokerage.'} />
        <meta name="twitter:image" content="https://vertexliving.in/logo1.png" />
        {config && <meta name="language" content="English, Hindi" />}
      </Helmet>
      {/* Hero */}
      <div className="rental-hero">
        <h1 className="rental-hero-title">{config ? config.h1 : 'Rent Property Anywhere in India — Zero Brokerage'}</h1>
        <p className="rental-hero-subtitle">
          {config
            ? `Verified rental flats & apartments in ${config.displayName} — direct from owners, zero brokerage`
            : 'Verified rental properties across India — direct from owners, zero brokerage'}
        </p>
        <div className="rental-hero-pills">
          <span className="rental-hero-pill">&#10003; Zero Brokerage</span>
          <span className="rental-hero-pill">&#10003; Verified Owners</span>
          <span className="rental-hero-pill">&#10003; Instant Contact</span>
          <span className="rental-hero-pill">&#10003; Pan India</span>
        </div>
      </div>

      {/* City-specific intro content — unique SEO-rich content */}
      {config && (
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 16px 24px' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 16, padding: '24px 28px', marginTop: -8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <span style={{ fontSize: '1.6rem' }}>{config.displayIcon}</span>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--rp-text)', margin: 0 }}>
                Rental Market in {config.displayName}
              </h2>
            </div>
            <p style={{ color: 'var(--rp-muted)', lineHeight: 1.75, fontSize: '0.9rem', margin: '0 0 16px' }}>
              {config.intro}
            </p>
            {config.popularSectors && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--rp-muted)', fontWeight: 600, marginRight: 4 }}>Popular Areas:</span>
                {config.popularSectors.map(s => (
                  <span key={s} style={{
                    background: 'rgba(99,102,241,0.12)', color: '#818cf8',
                    border: '1px solid rgba(99,102,241,0.2)', borderRadius: 20,
                    padding: '3px 12px', fontSize: '0.78rem', fontWeight: 500,
                  }}>
                    {s}
                  </span>
                ))}
              </div>
            )}
            <a href={`/rent/${resolvedCity}`} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              color: '#818cf8', fontWeight: 600, fontSize: '0.85rem',
              textDecoration: 'none',
            }}>
              {displayCount} properties in {config.displayName} →
            </a>
          </div>
        </div>
      )}

      {/* Auth Section — inline card when not logged in */}
      {!rentalUser ? (
        <RentalInlineAuth />
      ) : (
        <div className="rental-owner-banner">
          <div className="rental-owner-info">
            <div className="rental-owner-avatar">{rentalUser.avatar}</div>
            <div className="rental-owner-details">
              <span>{rentalUser.role === 'owner' ? 'Property Owner' : 'Tenant'}</span>
              <strong>{rentalUser.name}</strong>
            </div>
          </div>
          <div className="rental-owner-actions">
            {isRentalOwner && (
              <button className="rental-btn rental-btn-sm" onClick={() => { setActiveTab('mylistings'); setShowAddModal(true); }}>
                + Add Property
              </button>
            )}
            <button className="rental-btn-outline rental-btn-outline-sm" onClick={rentalLogout}>Sign Out</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      {rentalUser && (
        <div className="rental-tabs">
          <button className={`rental-tab${activeTab === 'browse' ? ' active' : ''}`} onClick={() => setActiveTab('browse')}>
            Browse Rentals
          </button>
          {isRentalOwner && (
            <button className={`rental-tab${activeTab === 'mylistings' ? ' active' : ''}`} onClick={() => setActiveTab('mylistings')}>
              My Listings {myProperties.length > 0 && `(${myProperties.length})`}
            </button>
          )}
        </div>
      )}

      {/* Filter bar (only on browse tab) */}
      {activeTab === 'browse' && (
        <div className="rental-filters">
          <div className="rental-filter-group">
            <span className="rental-filter-label">Type</span>
            <select className="rental-filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="rental-filter-group">
            <span className="rental-filter-label">Furnishing</span>
            <select className="rental-filter-select" value={filterFurnishing} onChange={e => setFilterFurnishing(e.target.value)}>
              <option value="">Any</option>
              {FURNISHING_OPTIONS.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div className="rental-filter-group">
            <span className="rental-filter-label">Rent Range</span>
            <select className="rental-filter-select" value={filterRent} onChange={e => setFilterRent(Number(e.target.value))}>
              {RENT_RANGES.map((r, i) => <option key={r.label} value={i}>{r.label}</option>)}
            </select>
          </div>
          <div className="rental-filter-group" style={{ minWidth: 220 }}>
            <span className="rental-filter-label">Location</span>
            <LocationInput
              value={filterSector}
              onChange={v => setFilterSector(v)}
              placeholder="City, area, locality…"
            />
          </div>
          {hasFilters && (
            <button className="rental-filter-clear" onClick={clearFilters}>Clear filters</button>
          )}
          <span className="rental-filter-count">{filtered.length} {filtered.length === 1 ? 'property' : 'properties'}</span>
        </div>
      )}

      {/* FAQ JSON-LD Schema */}
      {config && (
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "name": `Rent Property FAQ — ${config.displayName}`,
          "url": `https://vertexliving.in/rent/${resolvedCity}`,
          "mainEntity": (CITY_FAQS[resolvedCity] || CITY_FAQS.default),
        })}</script>
      )}
      {config && (
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": `Vertex Living — ${config.displayName}`,
          "description": `Premium rental property services in ${config.displayName}. Zero brokerage flats, villas and apartments. Direct from verified owners.`,
          "url": `https://vertexliving.in/rent/${resolvedCity}`,
          "telephone": "+919671009931",
          "email": "support@vertexliving.in",
          "priceRange": "₹₹",
          "address": { "@type": "PostalAddress", "addressLocality": config.displayName, "addressRegion": config.region, "addressCountry": "IN" },
          "geo": { "@type": "GeoCoordinates", "latitude": config.lat, "longitude": config.lng },
          "areaServed": { "@type": "City", "name": config.displayName },
          "openingHoursSpecification": [
            { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], "opens": "09:00", "closes": "19:00" },
            { "@type": "OpeningHoursSpecification", "dayOfWeek": "Sunday", "opens": "10:00", "closes": "17:00" },
          ],
        })}</script>
      )}
      {config && (
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home",          "item": "https://vertexliving.in/" },
            { "@type": "ListItem", "position": 2, "name": "Rent",           "item": "https://vertexliving.in/rent" },
            { "@type": "ListItem", "position": 3, "name": config.displayName, "item": `https://vertexliving.in/rent/${resolvedCity}` },
          ]
        })}</script>
      )}

      {/* Content */}
      <div className="rental-content">
        {activeTab === 'mylistings' && isRentalOwner && (
          <div className="rental-my-listings-header">
            <h2>My Listings</h2>
            <button className="rental-btn" onClick={() => setShowAddModal(true)}>+ Add New Property</button>
          </div>
        )}

        {loading ? (
          <div className="rental-loading">
            <div className="rental-spinner" />
            <span>Loading properties…</span>
          </div>
        ) : (
          <div className="rental-grid">
            {displayList.length === 0 ? (
              <div className="rental-empty">
                <div className="rental-empty-icon">{activeTab === 'mylistings' ? '🏠' : '🔍'}</div>
                <h3>{activeTab === 'mylistings' ? 'No listings yet' : 'No properties found'}</h3>
                <p>
                  {activeTab === 'mylistings'
                    ? 'Click "Add New Property" to list your first rental.'
                    : hasFilters ? 'Try adjusting your filters.' : 'No rental properties listed yet.'}
                </p>
              </div>
            ) : (
              displayList.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isOwner={rentalUser && String(property.ownerId) === String(rentalUser.id)}
                  onInquiry={setInquiryTarget}
                  onDelete={handleDelete}
                  ownerInquiries={inquiries}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Related Cities Section */}
      {config && (
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '16px 16px 32px' }}>
          <div style={{ borderTop: '1px solid var(--rp-border, #30363d)', paddingTop: 24 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--rp-text)', marginBottom: 16 }}>
              Explore Rentals in Other Cities
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {Object.keys(getAllCityConfigs()).filter(c => c !== resolvedCity).map(cityKey => (
                <a key={cityKey} href={`/rent/${cityKey}`} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 10,
                  background: 'rgba(99,102,241,0.08)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  color: '#818cf8', textDecoration: 'none',
                  fontSize: '0.85rem', fontWeight: 600,
                  transition: 'all 0.2s',
                }}>
                  {getAllCityConfigs()[cityKey].displayIcon} {getAllCityConfigs()[cityKey].displayName}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <RentalAuthModal />
      {showAddModal && (
        <AddPropertyModal onClose={() => setShowAddModal(false)} onAdded={handleAdded} />
      )}
      {inquiryTarget && (
        <InquiryModal property={inquiryTarget} onClose={() => setInquiryTarget(null)} />
      )}
    </div>
  );
}
