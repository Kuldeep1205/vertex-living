import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ScheduleVisitModal.css';

const API = import.meta.env.VITE_API_URL || 'https://vertex-living.onrender.com';

const TIME_SLOTS = [
  '9:00 AM – 11:00 AM',
  '11:00 AM – 1:00 PM',
  '1:00 PM – 3:00 PM',
  '3:00 PM – 5:00 PM',
  '5:00 PM – 7:00 PM',
];

const today = () => new Date().toISOString().split('T')[0];

export default function ScheduleVisitModal({ property, onClose }) {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', date: '', timeSlot: '', message: '',
  });
  const [step, setStep]     = useState('form'); // form | loading | success | error
  const [errMsg, setErrMsg] = useState('');

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim())     { setErrMsg('Please enter your name.'); return; }
    if (!form.phone.trim())    { setErrMsg('Please enter your phone number.'); return; }
    if (!form.date)            { setErrMsg('Please select a preferred date.'); return; }
    if (!form.timeSlot)        { setErrMsg('Please select a time slot.'); return; }
    setErrMsg('');
    setStep('loading');
    try {
      const res = await fetch(`${API}/api/visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          propertyId:       property?.id       || '',
          propertyName:     property?.name     || '',
          propertyLocation: property?.location || property?.city || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) { setErrMsg(data.error || 'Something went wrong.'); setStep('form'); return; }
      setStep('success');
    } catch {
      setErrMsg('Server not reachable. Please try again.');
      setStep('form');
    }
  };

  return (
    <div className="svm-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div
        className="svm-modal"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        exit={{    opacity: 0, y: 20, scale: 0.96 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className="svm-header">
          <div className="svm-header-left">
            <span className="svm-icon">📅</span>
            <div>
              <h3 className="svm-title">Schedule Site Visit</h3>
              {property && (
                <p className="svm-subtitle">{property.name} · {property.location || property.city || 'Gurgaon'}</p>
              )}
            </div>
          </div>
          <button className="svm-close" onClick={onClose}>✕</button>
        </div>

        <AnimatePresence mode="wait">
          {step === 'success' ? (
            <motion.div
              key="success"
              className="svm-success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
            >
              <div className="svm-success-icon">✅</div>
              <h4>Visit Booked Successfully!</h4>
              <p>
                <strong>{form.name}</strong>, your site visit has been scheduled for{' '}
                <strong>{new Date(form.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>{' '}
                during <strong>{form.timeSlot}</strong>.
              </p>
              <p className="svm-success-note">
                Our team will contact you on <strong>{form.phone}</strong> within 2 hours to confirm the visit.
              </p>
              <button className="svm-submit-btn" onClick={onClose}>Done</button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              className="svm-form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {errMsg && <div className="svm-error">{errMsg}</div>}

              <div className="svm-row">
                <div className="svm-field">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={set('name')}
                    disabled={step === 'loading'}
                  />
                </div>
                <div className="svm-field">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={form.phone}
                    onChange={set('phone')}
                    disabled={step === 'loading'}
                  />
                </div>
              </div>

              <div className="svm-field">
                <label>Email Address (optional)</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={set('email')}
                  disabled={step === 'loading'}
                />
              </div>

              <div className="svm-row">
                <div className="svm-field">
                  <label>Preferred Date *</label>
                  <input
                    type="date"
                    min={today()}
                    value={form.date}
                    onChange={set('date')}
                    disabled={step === 'loading'}
                  />
                </div>
                <div className="svm-field">
                  <label>Preferred Time *</label>
                  <select
                    value={form.timeSlot}
                    onChange={set('timeSlot')}
                    disabled={step === 'loading'}
                  >
                    <option value="">Select time slot</option>
                    {TIME_SLOTS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="svm-field">
                <label>Message (optional)</label>
                <textarea
                  placeholder="Any specific requirements or questions..."
                  value={form.message}
                  onChange={set('message')}
                  rows={3}
                  disabled={step === 'loading'}
                />
              </div>

              <div className="svm-trust">
                <span>✅ Free site visit</span>
                <span>📞 Team will call to confirm</span>
                <span>🏠 RERA Verified property</span>
              </div>

              <button type="submit" className="svm-submit-btn" disabled={step === 'loading'}>
                {step === 'loading' ? '⏳ Booking...' : '📅 Book Site Visit'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
