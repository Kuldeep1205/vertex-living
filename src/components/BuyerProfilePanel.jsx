import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './BuyerProfilePanel.css';

const API = import.meta.env.VITE_API_URL || 'https://vertex-living-server.onrender.com';

const INQUIRY_INIT = {
  subject: '',
  budget: '',
  type: '',
  sector: '',
  bedrooms: '',
  message: '',
};

const BUDGET_OPTIONS = ['Under ₹50 Lakh', '₹50L – ₹1 Cr', '₹1 Cr – ₹2 Cr', '₹2 Cr – ₹5 Cr', '₹5 Cr – ₹10 Cr', 'Above ₹10 Cr'];
const TYPE_OPTIONS   = ['Apartment', 'Villa', 'Plot', 'Penthouse', 'Commercial'];
const BHK_OPTIONS    = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5 BHK+'];

export default function BuyerProfilePanel() {
  const { user, logout } = useAuth();
  const [tab, setTab]         = useState('orders'); // orders | inquiry | history | profile
  const [form, setForm]       = useState(INQUIRY_INIT);
  const [inqStatus, setInqStatus] = useState('idle');
  const [inqErr, setInqErr]   = useState('');
  const [myInquiries, setMyInquiries] = useState([]);
  const [loadingInq, setLoadingInq]   = useState(false);
  const [myOrders, setMyOrders]       = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  // Load orders on mount and when orders tab is active
  useEffect(() => {
    if (user && (tab === 'orders' || myOrders.length === 0)) {
      setLoadingOrders(true);
      const params = new URLSearchParams();
      if (user.email) params.set('email', user.email);
      if (user.phone) params.set('phone', user.phone);
      fetch(`${API}/api/customer/orders?${params}`)
        .then(r => r.json())
        .then(data => setMyOrders(Array.isArray(data) ? data : []))
        .catch(() => setMyOrders([]))
        .finally(() => setLoadingOrders(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, user]);

  // Load past inquiries when tab switches
  useEffect(() => {
    if (tab === 'history' && user) {
      setLoadingInq(true);
      fetch(`${API}/api/admin/inquiries`)
        .then(r => r.json())
        .then(data => {
          const mine = Array.isArray(data)
            ? data.filter(i => i.email === user.email || i.phone === user.phone)
            : [];
          setMyInquiries(mine);
        })
        .catch(() => setMyInquiries([]))
        .finally(() => setLoadingInq(false));
    }
  }, [tab, user]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.message.trim() && !form.subject.trim()) {
      setInqErr('Please write a message or select a subject.'); return;
    }
    setInqStatus('submitting'); setInqErr('');
    try {
      const res = await fetch(`${API}/api/admin/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          formType: 'buyer',
          userId: user.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setInqErr(data.error || 'Failed to send.'); setInqStatus('error'); return; }
      setInqStatus('success');
    } catch {
      setInqErr('Server not reachable.'); setInqStatus('error');
    }
  };

  const resetForm = () => { setForm(INQUIRY_INIT); setInqStatus('idle'); setInqErr(''); };

  // Avatar color from name
  const avatarColor = (() => {
    const colors = ['#6366f1','#8b5cf6','#ec4899','#06b6d4','#10b981','#f59e0b'];
    const idx = (user?.name?.charCodeAt(0) || 0) % colors.length;
    return colors[idx];
  })();

  return (
    <div className="bpp-wrap">

      {/* ── Profile Header ── */}
      <div className="bpp-header">
        <div className="bpp-avatar" style={{ background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}99)` }}>
          {user?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="bpp-user-info">
          <div className="bpp-name">{user?.name}</div>
          <div className="bpp-email">{user?.email}</div>
          {user?.phone && <div className="bpp-phone">📞 {user.phone}</div>}
        </div>
        <div className="bpp-role-badge">🏠 Buyer</div>
      </div>

      {/* ── Tabs ── */}
      <div className="bpp-tabs">
        {[
          { key: 'orders',  label: `📦 My Orders${myOrders.length > 0 ? ` (${myOrders.length})` : ''}` },
          { key: 'inquiry', label: '📝 New Inquiry' },
          { key: 'history', label: '📋 My Inquiries' },
          { key: 'profile', label: '👤 Profile' },
        ].map(t => (
          <button
            key={t.key}
            className={`bpp-tab${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── My Orders Tab ── */}
        {tab === 'orders' && (
          <motion.div key="orders"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}>
            <div className="bpp-orders-wrap">
              <div className="bpp-form-title">
                <span>📦 My Bookings & Orders</span>
                <span className="bpp-form-sub">All confirmed property bookings linked to your account</span>
              </div>

              {loadingOrders ? (
                <div className="bpp-loading">Loading your orders…</div>
              ) : myOrders.length === 0 ? (
                <div className="bpp-empty">
                  <div style={{ fontSize: '2.8rem', marginBottom: 10 }}>🏠</div>
                  <p>No bookings yet. Book a property to see your orders here.</p>
                </div>
              ) : (
                <div className="bpp-order-list">
                  {myOrders.map((order, i) => {
                    const fmt = n => '₹' + Number(n).toLocaleString('en-IN');
                    const invoiceNo = `VL-${String(order.id).slice(-8).toUpperCase()}`;
                    const bookedDate = new Date(order.bookedAt).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    });
                    return (
                      <motion.div key={order.id || i}
                        className="bpp-order-card"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}>
                        {/* Header */}
                        <div className="bpp-order-header">
                          <div className="bpp-order-prop">{order.propertyName}</div>
                          <span className="bpp-order-status confirmed">✅ Confirmed</span>
                        </div>

                        {/* Invoice No + Date */}
                        <div className="bpp-order-invoice-row">
                          <span className="bpp-invoice-badge">🧾 {invoiceNo}</span>
                          <span className="bpp-order-date">{bookedDate}</span>
                        </div>

                        {/* Amount */}
                        <div className="bpp-order-amount-row">
                          <div className="bpp-order-token">
                            <span className="bpp-order-token-lbl">Token Paid</span>
                            <span className="bpp-order-token-val">{fmt(order.tokenAmount)}</span>
                          </div>
                          {order.propertyPrice > 0 && (
                            <div className="bpp-order-token">
                              <span className="bpp-order-token-lbl">Property Value</span>
                              <span className="bpp-order-token-val" style={{ color: '#94a3b8' }}>₹{order.propertyPrice} Cr</span>
                            </div>
                          )}
                        </div>

                        {/* Transaction IDs */}
                        <div className="bpp-order-txn-grid">
                          <div className="bpp-txn-item">
                            <span className="bpp-txn-lbl">Order ID</span>
                            <span className="bpp-txn-val">{order.orderId}</span>
                          </div>
                          <div className="bpp-txn-item">
                            <span className="bpp-txn-lbl">Payment ID</span>
                            <span className="bpp-txn-val">{order.paymentId}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="bpp-order-actions">
                          <a
                            href={`/api/invoice/${order.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bpp-invoice-btn"
                          >
                            🧾 View Invoice
                          </a>
                          <a
                            href={`/api/invoice/${order.id}?print=1`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bpp-invoice-btn secondary"
                          >
                            🖨 Download / Print
                          </a>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── New Inquiry Tab ── */}
        {tab === 'inquiry' && (
          <motion.div key="inquiry"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}>

            {inqStatus === 'success' ? (
              <div className="bpp-success">
                <div className="bpp-success-icon">
                  <svg viewBox="0 0 60 60" width="64" height="64">
                    <circle cx="30" cy="30" r="28" fill="none" stroke="#22c55e" strokeWidth="3"/>
                    <polyline points="18,31 26,39 42,21" fill="none" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h4>Inquiry Sent!</h4>
                <p>Our team will reach out to you within 2 hours with matching properties.</p>
                <button className="bpp-submit-btn" onClick={resetForm}>Send Another</button>
              </div>
            ) : (
              <form className="bpp-form" onSubmit={handleSubmit} noValidate>
                <div className="bpp-form-title">
                  <span>🔍 Property Inquiry</span>
                  <span className="bpp-form-sub">Tell us what you're looking for</span>
                </div>

                {inqErr && <div className="bpp-err">{inqErr}</div>}

                <div className="bpp-field">
                  <label>Subject / Project Name</label>
                  <input value={form.subject} onChange={set('subject')}
                    placeholder="e.g. Looking for 3 BHK in Sector 65" />
                </div>

                <div className="bpp-row">
                  <div className="bpp-field">
                    <label>Budget Range</label>
                    <select value={form.budget} onChange={set('budget')}>
                      <option value="">Select budget</option>
                      {BUDGET_OPTIONS.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="bpp-field">
                    <label>Bedrooms</label>
                    <select value={form.bedrooms} onChange={set('bedrooms')}>
                      <option value="">Any</option>
                      {BHK_OPTIONS.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                </div>

                <div className="bpp-row">
                  <div className="bpp-field">
                    <label>Property Type</label>
                    <select value={form.type} onChange={set('type')}>
                      <option value="">Any type</option>
                      {TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="bpp-field">
                    <label>Preferred Sector / Area</label>
                    <input value={form.sector} onChange={set('sector')}
                      placeholder="e.g. Sector 65, Golf Course Road" />
                  </div>
                </div>

                <div className="bpp-field">
                  <label>Message *</label>
                  <textarea value={form.message} onChange={set('message')} rows={4}
                    placeholder="Describe your requirements — timeline, possession preference, must-have amenities, budget flexibility…" />
                </div>

                <button
                  type="submit"
                  className={`bpp-submit-btn${inqStatus === 'submitting' ? ' loading' : ''}`}
                  disabled={inqStatus === 'submitting'}
                >
                  {inqStatus === 'submitting'
                    ? <span className="bpp-spinner" />
                    : '📨 Send Inquiry to Team →'}
                </button>
              </form>
            )}
          </motion.div>
        )}

        {/* ── My Inquiries Tab ── */}
        {tab === 'history' && (
          <motion.div key="history"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}>
            <div className="bpp-form-title">
              <span>📋 Your Past Inquiries</span>
              <span className="bpp-form-sub">All inquiries linked to your account</span>
            </div>
            {loadingInq ? (
              <div className="bpp-loading">Loading your inquiries…</div>
            ) : myInquiries.length === 0 ? (
              <div className="bpp-empty">
                <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>📭</div>
                <p>No inquiries yet. Send your first one!</p>
                <button className="bpp-submit-btn" style={{ marginTop: 12 }} onClick={() => setTab('inquiry')}>
                  + New Inquiry
                </button>
              </div>
            ) : (
              <div className="bpp-inq-list">
                {myInquiries.slice().reverse().map((inq, i) => (
                  <div key={inq.id || i} className="bpp-inq-card">
                    <div className="bpp-inq-header">
                      <span className="bpp-inq-subject">{inq.subject || inq.message?.slice(0, 50) || 'Property Inquiry'}</span>
                      <span className={`bpp-inq-status ${inq.read ? 'read' : 'unread'}`}>
                        {inq.read ? '✅ Seen' : '🔵 New'}
                      </span>
                    </div>
                    <div className="bpp-inq-meta">
                      {inq.budget && <span>💰 {inq.budget}</span>}
                      {inq.type && <span>🏠 {inq.type}</span>}
                      {inq.bedrooms && <span>🛏 {inq.bedrooms}</span>}
                      {inq.sector && <span>📍 {inq.sector}</span>}
                    </div>
                    {inq.message && <p className="bpp-inq-msg">{inq.message}</p>}
                    <div className="bpp-inq-date">
                      {new Date(inq.createdAt || inq.submittedAt || Date.now()).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Profile Tab ── */}
        {tab === 'profile' && (
          <motion.div key="profile"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}>
            <div className="bpp-form-title">
              <span>👤 My Account</span>
              <span className="bpp-form-sub">Your profile details</span>
            </div>
            <div className="bpp-profile-grid">
              <div className="bpp-profile-row">
                <span className="bpp-profile-label">Full Name</span>
                <span className="bpp-profile-value">{user?.name || '—'}</span>
              </div>
              <div className="bpp-profile-row">
                <span className="bpp-profile-label">Email</span>
                <span className="bpp-profile-value">{user?.email || '—'}</span>
              </div>
              <div className="bpp-profile-row">
                <span className="bpp-profile-label">Phone</span>
                <span className="bpp-profile-value">{user?.phone || '—'}</span>
              </div>
              <div className="bpp-profile-row">
                <span className="bpp-profile-label">Account Type</span>
                <span className="bpp-profile-value" style={{ color: '#a5b4fc' }}>🏠 Buyer</span>
              </div>
              <div className="bpp-profile-row">
                <span className="bpp-profile-label">Member Since</span>
                <span className="bpp-profile-value">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                </span>
              </div>
            </div>
            <button className="bpp-logout-btn" onClick={logout}>
              🚪 Log Out
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
