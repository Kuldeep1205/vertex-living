import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css';

/* ── Password strength (4-segment) ── */
function getStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 6)           score++;
  if (pw.length >= 10)          score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw))         score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const clamp = Math.min(4, Math.floor((score / 5) * 4) + (score > 0 ? 1 : 0));
  const map = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];
  return { score: clamp, label: map[clamp] || '', color: colors[clamp] || '' };
}

/* ── SVG Icons ── */
const IC = {
  user:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  mail:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  lock:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  phone: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16z"/></svg>,
  eyeOn: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/></svg>,
  check: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  warn:  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>,
  back:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>,
  shield:<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
};

/* ── Reusable Input ── */
function Field({ label, icon, type = 'text', placeholder, value, onChange, autoComplete, eye, onEye }) {
  return (
    <div className="auth-field">
      <label className="auth-label">{label}</label>
      <div className="auth-input-wrap">
        <span className="auth-input-icon">{icon}</span>
        <input
          className="auth-input"
          type={eye !== undefined ? (eye ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
        />
        {onEye !== undefined && (
          <button type="button" className="auth-eye" onClick={onEye}>
            {eye ? IC.eyeOn : IC.eyeOff}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Brand Left Panel ── */
function BrandPanel() {
  const { returnTo } = useAuth();
  const isPropertyRedirect = returnTo && returnTo.startsWith('/property');
  return (
    <div className="auth-brand">
      <div className="auth-brand-top">
        <div className="auth-brand-logo">
          <div className="auth-brand-logo-icon">
            <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
              <path d="M12 18l8-8 8 8v10a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V18z" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M17 30v-7h6v7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div className="auth-brand-logo-text">Vertex Living</div>
            <span className="auth-brand-logo-sub">Premium Real Estate</span>
          </div>
        </div>

        {isPropertyRedirect ? (
          <>
            <div className="auth-brand-lock-notice">
              <span className="auth-brand-lock-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </span>
              <span>Members-only access</span>
            </div>
            <h2 className="auth-brand-headline">
              Sign in to View <span>Full Property Details</span>
            </h2>
            <p className="auth-brand-desc">
              Create a free account to unlock HD photos, floor plans, price history,
              agent contact, and virtual tours for every property.
            </p>
          </>
        ) : (
          <>
            <h2 className="auth-brand-headline">
              Find Your <span>Dream Home</span> in Gurugram
            </h2>
            <p className="auth-brand-desc">
              Access 2,500+ verified properties with AI-powered recommendations,
              virtual tours, and expert guidance — all in one platform.
            </p>
          </>
        )}
      </div>

      <div className="auth-brand-stats">
        {[
          {
            num: '2,500+', lbl: 'Verified Properties',
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
          },
          {
            num: '1,800+', lbl: 'Happy Customers',
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
          },
          {
            num: '15+', lbl: 'Years of Excellence',
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
          },
        ].map(s => (
          <div className="auth-brand-stat" key={s.lbl}>
            <div className="auth-stat-icon">{s.icon}</div>
            <div>
              <div className="auth-stat-num">{s.num}</div>
              <div className="auth-stat-lbl">{s.lbl}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="auth-brand-bottom">
        <span className="auth-trust-dot" />
        <span className="auth-trust-text">
          <strong>256-bit SSL</strong> encrypted · 100% free to register
        </span>
      </div>
    </div>
  );
}

/* ── Login Form ── */
function LoginForm() {
  const { login, setAuthTab, returnTo } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const isPropertyRedirect = returnTo && returnTo.startsWith('/property');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!password)     { setError('Please enter your password.'); return; }
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 650));
    const err = await login(email, password);
    if (err) { setError(err); setLoading(false); }
  };

  return (
    <>
      <div className="auth-form-header">
        {isPropertyRedirect && (
          <div className="auth-mobile-lock-bar">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Sign in to view full property details
          </div>
        )}
        <p className="auth-form-step">Welcome back</p>
        <h3 className="auth-form-title">Sign in to your account</h3>
        <p className="auth-form-subtitle">
          {isPropertyRedirect
            ? 'Please sign in to view full property details, photos & contact the agent.'
            : 'Access your saved properties and personalized recommendations.'}
        </p>
      </div>

      <div className="auth-tabs">
        <button className="auth-tab active">Sign In</button>
        <button className="auth-tab" onClick={() => setAuthTab('register')}>Create Account</button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="auth-error">
            <span className="auth-error-icon">{IC.warn}</span>
            <span>{error}</span>
          </div>
        )}

        <Field
          label="Email Address"
          icon={IC.mail}
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
        />

        <Field
          label="Password"
          icon={IC.lock}
          placeholder="Enter your password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
          eye={showPw}
          onEye={() => setShowPw(v => !v)}
        />

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? <><span className="auth-spinner" /> Signing in…</> : 'Sign In'}
        </button>

        <p className="auth-switch">
          Don't have an account?{' '}
          <button type="button" onClick={() => setAuthTab('register')}>
            Create one free
          </button>
        </p>
      </form>
    </>
  );
}

/* ── Register Form ── */
function RegisterForm() {
  const { register, setAuthTab, returnTo } = useAuth();
  const [form, setForm]         = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [role,    setRole]      = useState('buyer');
  const [showPw,  setShowPw]    = useState(false);
  const [showCon, setShowCon]   = useState(false);
  const [error,   setError]     = useState('');
  const [loading, setLoading]   = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const str = getStrength(form.password);

  const validate = () => {
    if (!form.name.trim() || form.name.trim().length < 2) return 'Please enter your full name (min. 2 characters).';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email address.';
    if (!form.phone.trim()) return 'Please enter your mobile number.';
    if (!/^[+]?[\d\s\-()]{7,15}$/.test(form.phone.trim())) return 'Please enter a valid mobile number.';
    if (!form.password || form.password.length < 6) return 'Password must be at least 6 characters long.';
    if (form.password !== form.confirm) return 'Passwords do not match. Please re-enter.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 600));
    const err = await register(form.name, form.email, form.password, form.phone, role);
    if (err) { setError(err); setLoading(false); }
  };

  const pwMatch = form.confirm.length > 0;
  const pwOk    = form.password === form.confirm && form.confirm.length > 0;
  const isPropertyRedirect = returnTo && returnTo.startsWith('/property');

  return (
    <>
      <div className="auth-form-header">
        {isPropertyRedirect && (
          <div className="auth-mobile-lock-bar">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Register to view full property details
          </div>
        )}
        <h3 className="auth-form-title">Create your account</h3>
        <p className="auth-form-subtitle">
          {isPropertyRedirect
            ? 'Create a free account to view full property details, photos & contact the agent.'
            : 'Join 1,800+ buyers who found their dream home on Vertex Living.'}
        </p>
      </div>

      <div className="auth-tabs">
        <button className="auth-tab" onClick={() => setAuthTab('login')}>Sign In</button>
        <button className="auth-tab active">Create Account</button>
      </div>

      {/* Role selector */}
      <div className="auth-role-toggle">
        <button
          type="button"
          className={`auth-role-btn${role === 'buyer' ? ' active' : ''}`}
          onClick={() => setRole('buyer')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          I'm a Buyer
        </button>
        <button
          type="button"
          className={`auth-role-btn${role === 'builder' ? ' active' : ''}`}
          onClick={() => setRole('builder')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>
          I'm a Builder
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="auth-error">
            <span className="auth-error-icon">{IC.warn}</span>
            <span>{error}</span>
          </div>
        )}

        <div className="auth-row">
          <Field label="Full Name" icon={IC.user} placeholder="Rahul Sharma"
            value={form.name} onChange={set('name')} autoComplete="name" />
          <Field label="Mobile Number" icon={IC.phone} type="tel" placeholder="+91 98765 43210"
            value={form.phone} onChange={set('phone')} autoComplete="tel" />
        </div>

        <Field label="Email Address" icon={IC.mail} type="email" placeholder="you@example.com"
          value={form.email} onChange={set('email')} autoComplete="email" />

        <div className="auth-field">
          <label className="auth-label">Password</label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon">{IC.lock}</span>
            <input className="auth-input"
              type={showPw ? 'text' : 'password'}
              placeholder="Min. 6 characters"
              value={form.password} onChange={set('password')}
              autoComplete="new-password"
            />
            <button type="button" className="auth-eye" onClick={() => setShowPw(v => !v)}>
              {showPw ? IC.eyeOn : IC.eyeOff}
            </button>
          </div>
          {form.password && (
            <div className="pass-strength">
              <div className="pass-strength-bars">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`pass-bar${str.score >= i ? ' filled' : ''}`}
                    style={{ background: str.score >= i ? str.color : undefined }} />
                ))}
              </div>
              <div className="pass-strength-row">
                <span className="pass-strength-label" style={{ color: str.color }}>{str.label}</span>
                <span className="pass-strength-tip">Use uppercase, numbers &amp; symbols</span>
              </div>
            </div>
          )}
        </div>

        <div className="auth-field">
          <label className="auth-label">Confirm Password</label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon">{IC.lock}</span>
            <input className="auth-input"
              type={showCon ? 'text' : 'password'}
              placeholder="Re-enter your password"
              value={form.confirm} onChange={set('confirm')}
              autoComplete="new-password"
              style={{ borderColor: pwMatch ? (pwOk ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)') : undefined }}
            />
            <button type="button" className="auth-eye" onClick={() => setShowCon(v => !v)}>
              {showCon ? IC.eyeOn : IC.eyeOff}
            </button>
          </div>
          {pwMatch && (
            <span className="auth-hint" style={{ color: pwOk ? '#4ade80' : '#f87171', display: 'flex', alignItems: 'center', gap: 5 }}>
              {pwOk ? IC.check : IC.warn}
              {pwOk ? 'Passwords match' : 'Passwords do not match'}
            </span>
          )}
        </div>

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading
            ? <><span className="auth-spinner" /> Creating account…</>
            : 'Create Account →'}
        </button>

        <p className="auth-terms">
          By creating an account you agree to our{' '}
          <span>Terms of Service</span> and <span>Privacy Policy</span>.
        </p>

        <p className="auth-switch">
          Already have an account?{' '}
          <button type="button" onClick={() => setAuthTab('login')}>Sign in</button>
        </p>
      </form>
    </>
  );
}

/* ── Main Modal ── */
export default function AuthModal() {
  const { authModal, authTab, setAuthTab, closeAuth } = useAuth();

  useEffect(() => {
    if (!authModal) return;
    const fn = e => e.key === 'Escape' && closeAuth();
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [authModal, closeAuth]);

  useEffect(() => {
    document.body.style.overflow = authModal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [authModal]);

  if (!authModal) return null;

  const portalEl = typeof document !== 'undefined' ? document.getElementById('portal-fixed') : null;

  const modal = (
    <div className="auth-overlay" onClick={e => e.target === e.currentTarget && closeAuth()}>
      <div className="auth-modal" role="dialog" aria-modal="true" aria-label="Authentication">

        {/* Left — brand */}
        <BrandPanel />

        {/* Right — form */}
        <div className="auth-form-panel">
          <button className="auth-close" onClick={closeAuth} aria-label="Close dialog">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <div className="auth-form-scroll">
            {authTab === 'login' ? <LoginForm /> : <RegisterForm />}
          </div>
        </div>
      </div>
    </div>
  );

  return portalEl ? createPortal(modal, portalEl) : modal;
}
