import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import './BuilderListingPanel.css';
import { apiFetch, whatsappLink } from '../utils/apiFetch';

const API = import.meta.env.VITE_API_URL || 'https://vertex-living-server.onrender.com';

const EMPTY_FORM = {
  name: '', developer: '', location: '', sector: '',
  type: 'Apartment', bedrooms: 3, price: '', priceUnit: 'Cr', priceDisplay: '',
  area: '', status: 'Under Construction',
  description: '',
};

const PROPERTY_TYPES  = ['Apartment', 'Villa', 'Plot', 'Commercial', 'Penthouse'];
const STATUS_OPTIONS  = ['Ready to Move', 'Under Construction', 'Pre-Launch'];
const SECTOR_OPTIONS  = [
  'Sector 42', 'Sector 43', 'Sector 49', 'Sector 57', 'Sector 65',
  'Sector 66', 'Sector 67', 'Sector 82', 'Sector 83', 'Sector 84',
  'Sector 85', 'Sector 86', 'Sector 92', 'Sector 93', 'Golf Course Road',
  'Golf Course Extension', 'Dwarka Expressway', 'Sohna Road', 'NH-48',
  'Cyber City', 'MG Road', 'Other',
];

export default function BuilderListingPanel() {
  const { user } = useAuth();
  const [view, setView]         = useState('list'); // 'list' | 'add'
  const [form, setForm]         = useState(EMPTY_FORM);
  const [myProps, setMyProps]   = useState([]);
  const [status, setStatus]     = useState('idle'); // idle | saving | saved | error
  const [errMsg, setErrMsg]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]); // File objects
  const [filePreviews, setFilePreviews]   = useState([]); // { name, url, type }
  const fileInputRef = useRef(null);

  const fetchMyProps = () => {
    setLoading(true);
    // Fetch both live and pending listings
    Promise.all([
      fetch(`${API}/api/admin/properties`).then(r => r.json()).catch(() => []),
      fetch(`${API}/api/admin/pending-properties`).then(r => r.json()).catch(() => []),
    ]).then(([live, pending]) => {
      const liveArr    = Array.isArray(live) ? live : [];
      const pendingArr = Array.isArray(pending) ? pending : [];
      const myLive    = liveArr.filter(p => p.builderId === user?.id);
      const myPending = pendingArr.filter(p => p.builderId === user?.id)
        .map(p => ({ ...p, _isPending: true }));
      setMyProps([...myPending, ...myLive]);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchMyProps(); }, []);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleFileChange = e => {
    const files = Array.from(e.target.files);
    const allowed = ['.jpg', '.jpeg', '.pdf'];
    const valid = files.filter(f => {
      const ext = '.' + f.name.split('.').pop().toLowerCase();
      return allowed.includes(ext);
    });
    if (valid.length !== files.length) {
      setErrMsg('Only JPG and PDF files are allowed.');
    } else {
      setErrMsg('');
    }
    setSelectedFiles(prev => [...prev, ...valid]);
    const previews = valid.map(f => ({
      name: f.name,
      type: f.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image',
      url: f.name.toLowerCase().endsWith('.pdf') ? null : URL.createObjectURL(f),
    }));
    setFilePreviews(prev => [...prev, ...previews]);
    // Reset input so same file can be re-added
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
    if (!form.name.trim() || !form.location.trim() || !form.price) {
      setErrMsg('Project name, location and price are required.'); return;
    }
    setStatus('saving'); setErrMsg('');

    let uploadedUrls = [];
    // Upload files first if any
    if (selectedFiles.length > 0) {
      const fd = new FormData();
      selectedFiles.forEach(f => fd.append('files', f));
      try {
        const upRes = await fetch(`${API}/api/builder/upload-files`, { method: 'POST', body: fd });
        const upData = await upRes.json();
        if (!upRes.ok) { setErrMsg(upData.error || 'File upload failed.'); setStatus('error'); return; }
        uploadedUrls = upData.urls.map(u => `${API}${u}`);
      } catch {
        setErrMsg('File upload failed. Check server connection.'); setStatus('error'); return;
      }
    }

    const payload = {
      ...form,
      bedrooms: Number(form.bedrooms),
      price: form.priceUnit === 'Lac' ? (parseFloat(form.price) || 0) / 100 : (parseFloat(form.price) || 0),
      priceDisplay: form.priceDisplay || (form.priceUnit === 'Lac' ? `₹${form.price} Lac` : `₹${form.price} Cr`),
      photos: uploadedUrls,
      builderId: user?.id,
      developer: form.developer || user?.name,
      city: 'Gurgaon',
    };

    try {
      const res = await fetch(`${API}/api/builder/list-property`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, userId: user?.id }),
      });
      const data = await res.json();
      if (!res.ok) { setErrMsg(data.error || 'Failed to list property.'); setStatus('error'); return; }
      setStatus('saved');
      setForm(EMPTY_FORM);
      setSelectedFiles([]);
      setFilePreviews([]);
      setTimeout(() => { setStatus('idle'); setView('list'); fetchMyProps(); }, 1800);
    } catch {
      setErrMsg('Server warming up. Please try again in 30 seconds.'); setStatus('error');
    }
  };

  return (
    <div className="blp-wrap">
      {/* Header */}
      <div className="blp-header">
        <div className="blp-header-left">
          <div className="blp-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
            </svg>
          </div>
          <div>
            <h3 className="blp-title">Builder Dashboard</h3>
            <p className="blp-sub">Welcome, {user?.name} — manage your property listings</p>
          </div>
        </div>
        <div className="blp-header-tabs">
          <button className={`blp-tab${view === 'list' ? ' active' : ''}`} onClick={() => setView('list')}>
            My Listings ({myProps.length})
          </button>
          <button className={`blp-tab${view === 'add' ? ' active' : ''}`} onClick={() => setView('add')}>
            + List Property
          </button>
        </div>
      </div>

      {/* My Listings view */}
      {view === 'list' && (
        <div className="blp-listings">
          {loading ? (
            <div className="blp-loading">Loading your listings…</div>
          ) : myProps.length === 0 ? (
            <div className="blp-empty">
              <div className="blp-empty-icon">🏗</div>
              <p>You haven't listed any properties yet.</p>
              <button className="blp-cta-btn" onClick={() => setView('add')}>List Your First Property →</button>
            </div>
          ) : (
            <div className="blp-cards">
              {myProps.map((p, i) => (
                <div key={p.id || i} className="blp-card">
                  {p.photos?.[0] ? (
                    <img src={p.photos[0]} alt={p.name} className="blp-card-img" />
                  ) : (
                    <div className="blp-card-img-placeholder">🏢</div>
                  )}
                  <div className="blp-card-body">
                    <div className="blp-card-name">{p.name}</div>
                    <div className="blp-card-loc">{p.location}</div>
                    <div className="blp-card-meta">
                      <span>{p.type}</span>
                      <span>{p.bedrooms} BHK</span>
                      <span>{p.priceDisplay || `₹${p.price} Cr`}</span>
                    </div>
                    {p._isPending ? (
                      <div className="blp-card-status pending">⏳ Pending Review</div>
                    ) : (
                      <div className={`blp-card-status ${p.status === 'Ready to Move' ? 'green' : 'yellow'}`}>
                        ✅ Live — {p.status}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add listing view */}
      {view === 'add' && (
        <div className="blp-form-wrap">
          {status === 'saved' ? (
            <div className="blp-success">
              <div className="blp-success-icon">⏳</div>
              <h4>Property Submitted for Review!</h4>
              <p>Your property has been saved and is <strong>pending admin approval</strong>. It will go live on Vertex Living within 24 hours after verification. You can track the status below in "My Listings".</p>
            </div>
          ) : (
            <form className="blp-form" onSubmit={handleSubmit} noValidate>
              {errMsg && <div className="blp-error">{errMsg}</div>}

              <div className="blp-form-row">
                <div className="blp-field">
                  <label>Project / Property Name *</label>
                  <input value={form.name} onChange={set('name')} placeholder="e.g. Apex Residency" required />
                </div>
                <div className="blp-field">
                  <label>Developer / Company Name</label>
                  <input value={form.developer} onChange={set('developer')} placeholder={user?.name} />
                </div>
              </div>

              <div className="blp-field">
                <label>Location / Address *</label>
                <input value={form.location} onChange={set('location')} placeholder="e.g. Sector 65, Golf Course Extension Road, Gurgaon" required />
              </div>

              <div className="blp-form-row">
                <div className="blp-field">
                  <label>Sector / Area</label>
                  <select value={form.sector} onChange={set('sector')}>
                    <option value="">Select sector</option>
                    {SECTOR_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="blp-field">
                  <label>Property Type</label>
                  <select value={form.type} onChange={set('type')}>
                    {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="blp-form-row">
                <div className="blp-field">
                  <label>Bedrooms (BHK)</label>
                  <select value={form.bedrooms} onChange={set('bedrooms')}>
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} BHK</option>)}
                  </select>
                </div>
                <div className="blp-field">
                  <label>Price *</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="number" step="0.01" min="0" value={form.price} onChange={set('price')}
                      placeholder={form.priceUnit === 'Lac' ? 'e.g. 85' : 'e.g. 2.5'} required
                      style={{ flex: 1 }} />
                    <select value={form.priceUnit} onChange={set('priceUnit')} style={{ width: '80px' }}>
                      <option value="Lac">Lac</option>
                      <option value="Cr">Crore</option>
                    </select>
                  </div>
                </div>
                <div className="blp-field">
                  <label>Price Display (optional)</label>
                  <input value={form.priceDisplay} onChange={set('priceDisplay')} placeholder="e.g. ₹2.5 Cr onwards" />
                </div>
              </div>

              <div className="blp-form-row">
                <div className="blp-field">
                  <label>Area (sq.ft)</label>
                  <input value={form.area} onChange={set('area')} placeholder="e.g. 1850 sqft" />
                </div>
                <div className="blp-field">
                  <label>Status</label>
                  <select value={form.status} onChange={set('status')}>
                    {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="blp-field">
                <label>Description</label>
                <textarea value={form.description} onChange={set('description')} rows={3}
                  placeholder="Describe the project, amenities, USP…" />
              </div>

              <div className="blp-field">
                <label>Property Images / Documents</label>
                <div className="blp-upload-area" onClick={() => fileInputRef.current?.click()}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.pdf"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  <div className="blp-upload-icon">📎</div>
                  <div className="blp-upload-text">Click to upload JPG or PDF files</div>
                  <div className="blp-upload-hint">Max 20 MB per file · JPG, PDF only</div>
                </div>
                {filePreviews.length > 0 && (
                  <div className="blp-file-list">
                    {filePreviews.map((f, i) => (
                      <div key={i} className="blp-file-item">
                        {f.type === 'image' ? (
                          <img src={f.url} alt={f.name} className="blp-file-thumb" />
                        ) : (
                          <div className="blp-file-pdf-icon">📄</div>
                        )}
                        <span className="blp-file-name">{f.name}</span>
                        <button type="button" className="blp-file-remove" onClick={() => removeFile(i)}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="blp-form-actions">
                <button type="button" className="blp-cancel-btn" onClick={() => setView('list')}>Cancel</button>
                <button type="submit" className="blp-submit-btn" disabled={status === 'saving'}>
                  {status === 'saving' ? <><span className="blp-spinner" /> Listing…</> : 'List Property on Vertex Living →'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
