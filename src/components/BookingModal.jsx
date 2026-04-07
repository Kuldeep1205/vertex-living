import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './BookingModal.css';

const API = import.meta.env.VITE_API_URL || 'https://vertex-living-server.vercel.app';

// Parse a price value that might be a number (crores) or string like "₹4.5 Cr"
function parsePrice(price) {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    const match = price.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }
  return 0;
}

function calcToken() {
  return 25000; // Fixed refundable token
}

function formatINR(n) {
  if (n >= 1e5) return '₹' + (n / 1e5).toFixed(1) + ' L';
  return '₹' + n.toLocaleString('en-IN');
}

export default function BookingModal({ property, onClose }) {
  const { user, openLogin } = useAuth();
  const [step, setStep] = useState('form'); // form | processing | success | error
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
  });
  const [errMsg, setErrMsg] = useState('');

  // Keep form pre-filled if user logs in mid-flow
  useEffect(() => {
    if (user) setForm(f => ({
      name:  f.name  || user.name  || '',
      phone: f.phone || user.phone || '',
      email: f.email || user.email || '',
    }));
  }, [user]);

  if (!property) return null;

  const tokenAmount = calcToken();
  const tokenDisplay = formatINR(tokenAmount);
  const priceDisplay = property.priceDisplay || (typeof property.price === 'number' ? `₹${property.price} Cr` : property.price);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  // Try Razorpay first; fall back to direct booking if unavailable
  const handlePay = async e => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setErrMsg('Name and phone are required.'); return;
    }
    setErrMsg('');
    setStep('processing');

    // Try Razorpay
    if (window.Razorpay) {
      try {
        const res = await fetch(`${API}/api/payment/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: tokenAmount,
            currency: 'INR',
            propertyId: property.id,
            propertyName: property.name,
            userName: form.name,
            userEmail: form.email,
            userPhone: form.phone,
          }),
        });
        const data = await res.json();

        if (data.success && data.order?.id) {
          const options = {
            key: 'rzp_test_SYUruOfFcgX4xH',
            amount: data.order.amount,
            currency: data.order.currency,
            name: 'Vertex Living',
            description: `Token Booking – ${property.name}`,
            image: '/vite.svg',
            order_id: data.order.id,
            prefill: { name: form.name, email: form.email, contact: form.phone },
            theme: { color: '#6366f1' },
            modal: { ondismiss: () => setStep('form') },
            handler: async (response) => {
              try {
                const vRes = await fetch(`${API}/api/payment/verify`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    propertyId: property.id,
                    propertyName: property.name,
                    propertyPrice: parsePrice(property.price),
                    tokenAmount,
                    userName: form.name,
                    userEmail: form.email,
                    userPhone: form.phone,
                  }),
                });
                const vData = await vRes.json();
                if (vData.success) setStep('success');
                else { setErrMsg('Payment verification failed. Contact support.'); setStep('error'); }
              } catch { setErrMsg('Verification error. Contact support.'); setStep('error'); }
            },
          };
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', (r) => {
            setErrMsg(r?.error?.description || 'Payment failed.');
            setStep('error');
          });
          rzp.open();
          return;
        }
      } catch {
        // Fall through to direct booking
      }
    }

    // Fallback: direct booking (dev mode / Razorpay keys not configured)
    try {
      const res = await fetch(`${API}/api/payment/dev-booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          propertyName: property.name,
          propertyPrice: parsePrice(property.price),
          tokenAmount,
          userName: form.name,
          userEmail: form.email,
          userPhone: form.phone,
        }),
      });
      const data = await res.json();
      if (data.success) setStep('success');
      else { setErrMsg(data.error || 'Booking failed.'); setStep('error'); }
    } catch {
      setErrMsg('Server not reachable. Please try again.'); setStep('error');
    }
  };

  return (
    <div className="bm-overlay" onClick={onClose}>
      <motion.div
        className="bm-modal"
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 24 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <button className="bm-close" onClick={onClose}>✕</button>

        <AnimatePresence mode="wait">

          {/* ── Success ── */}
          {step === 'success' && (
            <motion.div key="success" className="bm-success"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bm-success-ring">
                <svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="28" fill="none" stroke="#22c55e" strokeWidth="3"/><polyline points="18,31 26,39 42,21" fill="none" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3>Booking Confirmed!</h3>
              <p>Your token of <strong>{tokenDisplay}</strong> for <strong>{property.name}</strong> has been registered.</p>
              <p className="bm-success-sub">Our team will call you within 2 hours to confirm your visit & documentation.</p>
              <button className="bm-pay-btn" onClick={onClose}>Done</button>
            </motion.div>
          )}

          {/* ── Error ── */}
          {step === 'error' && (
            <motion.div key="error" className="bm-error-state"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚠️</div>
              <h3>Something went wrong</h3>
              <p>{errMsg}</p>
              <button className="bm-pay-btn" onClick={() => { setStep('form'); setErrMsg(''); }}>Try Again</button>
            </motion.div>
          )}

          {/* ── Processing ── */}
          {step === 'processing' && (
            <motion.div key="processing" className="bm-processing"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bm-spinner-ring" />
              <p>Opening payment gateway…</p>
            </motion.div>
          )}

          {/* ── Form ── */}
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Property Info Header */}
              <div className="bm-prop-header">
                <div className="bm-prop-icon">🏢</div>
                <div>
                  <div className="bm-prop-name">{property.name}</div>
                  <div className="bm-prop-loc">{property.location || property.city}</div>
                </div>
                <div className="bm-prop-price">{priceDisplay}</div>
              </div>

              {/* Token Info */}
              <div className="bm-token-info">
                <div className="bm-token-label">Refundable Token</div>
                <div className="bm-token-amount">{tokenDisplay}</div>
                <div className="bm-token-note">Fully refundable if you decide not to proceed</div>
              </div>

              {/* Login Prompt if not logged in */}
              {!user && (
                <div className="bm-login-prompt">
                  <span>Already have an account?</span>
                  <button onClick={openLogin} className="bm-login-link">Login to auto-fill</button>
                </div>
              )}

              {/* Form */}
              <form className="bm-form" onSubmit={handlePay} noValidate>
                {errMsg && <div className="bm-err">{errMsg}</div>}

                <div className="bm-field">
                  <label>Full Name *</label>
                  <input value={form.name} onChange={set('name')} placeholder="Your full name" required />
                </div>
                <div className="bm-row">
                  <div className="bm-field">
                    <label>Phone *</label>
                    <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" required />
                  </div>
                  <div className="bm-field">
                    <label>Email</label>
                    <input type="email" value={form.email} onChange={set('email')} placeholder="you@email.com" />
                  </div>
                </div>

                <button type="submit" className="bm-pay-btn">
                  🔐 Book Now · Pay {tokenDisplay} Token
                </button>

                <div className="bm-footer-note">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  100% Secure · RERA Verified · Refundable Token
                </div>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}
