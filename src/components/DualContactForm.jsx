import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './DualContactForm.css';
import { apiFetch, whatsappLink } from '../utils/apiFetch';
const BUYER_INITIAL  = { name: '', phone: '', email: '', budget: '', type: '', sector: '', message: '' };
const BUILDER_INITIAL = { company: '', contact: '', phone: '', email: '', rera: '', project: '', enquiry: '', message: '' };

export default function DualContactForm() {
  const { isBuilder, user } = useAuth();
  const [tab,    setTab]    = useState(isBuilder ? 'builder' : 'buyer');
  const [buyer,  setBuyer]  = useState({
    ...BUYER_INITIAL,
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [builder, setBuilder] = useState({
    ...BUILDER_INITIAL,
    contact: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [status, setStatus] = useState('idle'); // idle | submitting | success

  const handleBuyer   = e => setBuyer(f  => ({ ...f,  [e.target.name]: e.target.value }));
  const handleBuilder = e => setBuilder(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus('submitting');
    const payload = tab === 'buyer'
      ? { ...buyer, formType: 'buyer' }
      : { ...builder, formType: 'builder' };
    try {
      const res = await apiFetch('/api/admin/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Server error');
      setStatus('success');
    } catch {
      setStatus('wa-fallback');
    }
  };

  const reset = () => {
    setBuyer(BUYER_INITIAL);
    setBuilder(BUILDER_INITIAL);
    setStatus('idle');
  };

  // Logged-in buyer should never see the builder tab
  const showBuilderTab = !user || isBuilder;

  return (
    <div className="dcf-wrap">
      {/* Tab switcher — hide builder tab for logged-in buyers */}
      <div className="dcf-tabs">
        {!isBuilder && (
          <button
            className={`dcf-tab${tab === 'buyer' ? ' active' : ''}`}
            onClick={() => { setTab('buyer'); setStatus('idle'); }}
          >
            🏡 I&apos;m a Buyer
          </button>
        )}
        {showBuilderTab && (
          <button
            className={`dcf-tab${tab === 'builder' ? ' active' : ''}`}
            onClick={() => { setTab('builder'); setStatus('idle'); }}
          >
            🏗 I&apos;m a Builder
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {status === 'wa-fallback' ? (
          <motion.div
            key="wa-fallback"
            className="dcf-success"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1,   y: 0  }}
            exit={{    opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.4 }}
            style={{ background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.3)' }}
          >
            <div className="dcf-success-icon">📲</div>
            <h3>Connect via WhatsApp</h3>
            <p>Our server is warming up. Reach us instantly on WhatsApp — we reply within minutes!</p>
            <a
              href={whatsappLink(tab === 'buyer'
                ? `Hi! I'm looking for a property. Name: ${buyer.name}, Budget: ${buyer.budget || 'flexible'}, Type: ${buyer.type || 'any'}.`
                : `Hi! I'm a builder interested in listing. Company: ${builder.company}, Contact: ${builder.contact}.`)}
              target="_blank"
              rel="noreferrer"
              className="dcf-reset-btn"
              style={{ display: 'inline-block', textDecoration: 'none', background: '#25d366', color: '#fff' }}
            >
              Open WhatsApp
            </a>
            <button className="dcf-reset-btn" style={{ marginTop: 8 }} onClick={() => setStatus('idle')}>Try Again</button>
          </motion.div>
        ) : status === 'success' ? (
          <motion.div
            key="success"
            className="dcf-success"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1,   y: 0  }}
            exit={{    opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="dcf-success-icon">✅</div>
            <h3>Message Received!</h3>
            <p>
              {tab === 'buyer'
                ? 'We will match you with verified builder-direct listings and reply within 2 hours.'
                : 'Our team will review your listing request and contact you within 48 hours.'}
            </p>
            <button className="dcf-reset-btn" onClick={reset}>Send Another Message</button>
          </motion.div>
        ) : tab === 'buyer' ? (
          <motion.form
            key="buyer-form"
            className="dcf-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{    opacity: 0, x:  20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="dcf-row">
              <div className="dcf-field">
                <label>Full Name *</label>
                <input name="name" value={buyer.name} onChange={handleBuyer} placeholder="Your name" required />
              </div>
              <div className="dcf-field">
                <label>Phone *</label>
                <input name="phone" type="tel" value={buyer.phone} onChange={handleBuyer} placeholder="+91 98765 43210" required />
              </div>
            </div>
            <div className="dcf-field">
              <label>Email</label>
              <input name="email" type="email" value={buyer.email} onChange={handleBuyer} placeholder="you@email.com" />
            </div>
            <div className="dcf-row">
              <div className="dcf-field">
                <label>Budget Range</label>
                <select name="budget" value={buyer.budget} onChange={handleBuyer}>
                  <option value="">Select budget</option>
                  <option>Under ₹50 Lakh</option>
                  <option>₹50L – ₹1 Cr</option>
                  <option>₹1 Cr – ₹2 Cr</option>
                  <option>₹2 Cr – ₹5 Cr</option>
                  <option>Above ₹5 Cr</option>
                </select>
              </div>
              <div className="dcf-field">
                <label>Property Type</label>
                <select name="type" value={buyer.type} onChange={handleBuyer}>
                  <option value="">Select type</option>
                  <option>Apartment</option>
                  <option>Villa</option>
                  <option>Plot</option>
                  <option>Commercial</option>
                </select>
              </div>
            </div>
            <div className="dcf-field">
              <label>Preferred Sector / Area</label>
              <input name="sector" value={buyer.sector} onChange={handleBuyer} placeholder="e.g. Sector 65, Golf Course Road" />
            </div>
            <div className="dcf-field">
              <label>Message (optional)</label>
              <textarea name="message" value={buyer.message} onChange={handleBuyer}
                placeholder="Tell us more about what you're looking for…" rows={3} />
            </div>
            <button type="submit" className={`dcf-submit${status === 'submitting' ? ' loading' : ''}`} disabled={status === 'submitting'}>
              {status === 'submitting' ? <span className="dcf-spinner" /> : 'Find Builder-Direct Homes →'}
            </button>
          </motion.form>
        ) : (
          <motion.form
            key="builder-form"
            className="dcf-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{    opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="dcf-row">
              <div className="dcf-field">
                <label>Company Name *</label>
                <input name="company" value={builder.company} onChange={handleBuilder} placeholder="Your company" required />
              </div>
              <div className="dcf-field">
                <label>Contact Person *</label>
                <input name="contact" value={builder.contact} onChange={handleBuilder} placeholder="Your name" required />
              </div>
            </div>
            <div className="dcf-row">
              <div className="dcf-field">
                <label>Phone *</label>
                <input name="phone" type="tel" value={builder.phone} onChange={handleBuilder} placeholder="+91 98765 43210" required />
              </div>
              <div className="dcf-field">
                <label>Email *</label>
                <input name="email" type="email" value={builder.email} onChange={handleBuilder} placeholder="sales@company.com" required />
              </div>
            </div>
            <div className="dcf-row">
              <div className="dcf-field">
                <label>RERA No.</label>
                <input name="rera" value={builder.rera} onChange={handleBuilder} placeholder="HRERA-PKL-2024-XXXXX" />
              </div>
              <div className="dcf-field">
                <label>Project Name</label>
                <input name="project" value={builder.project} onChange={handleBuilder} placeholder="Project name" />
              </div>
            </div>
            <div className="dcf-field">
              <label>Enquiry Type</label>
              <select name="enquiry" value={builder.enquiry} onChange={handleBuilder}>
                <option value="">Select</option>
                <option>List a new project</option>
                <option>Update existing listing</option>
                <option>Partnership inquiry</option>
                <option>Other</option>
              </select>
            </div>
            <div className="dcf-field">
              <label>Message (optional)</label>
              <textarea name="message" value={builder.message} onChange={handleBuilder}
                placeholder="Tell us about your project…" rows={3} />
            </div>
            <button type="submit" className={`dcf-submit${status === 'submitting' ? ' loading' : ''}`} disabled={status === 'submitting'}>
              {status === 'submitting' ? <span className="dcf-spinner" /> : 'Submit Builder Enquiry →'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
