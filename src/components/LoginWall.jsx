import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const PURPOSES = [
  {
    id: 'buy',
    icon: '🏠',
    title: 'Buy a Property',
    subtitle: 'Browse 2,500+ verified listings. Compare prices, schedule visits, and buy directly from builders.',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    hover: 'rgba(99,102,241,0.12)',
    redirectTo: '/',
  },
  {
    id: 'list',
    icon: '🏗️',
    title: 'List My Property',
    subtitle: 'Register as a builder/developer and list projects for thousands of verified buyers.',
    color: '#0ea5e9',
    gradient: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
    hover: 'rgba(14,165,233,0.12)',
    redirectTo: '/',
  },
  {
    id: 'rent',
    icon: '🔑',
    title: 'Rent a Property',
    subtitle: 'Find rental flats, apartments & villas across Gurgaon. Zero brokerage, direct from owners.',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
    hover: 'rgba(16,185,129,0.12)',
    redirectTo: '/rent',
  },
];

export default function LoginWall({ returnToPath }) {
  const { openLogin, openRegister } = useAuth();
  const [hovered, setHovered] = useState(null);

  const handlePurpose = (p) => {
    const redirect = returnToPath || p.redirectTo;
    const role = p.id === 'list' ? 'builder' : 'buyer';
    openRegister(redirect, role);
  };

  const handleSignIn = () => {
    openLogin(returnToPath || '/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #08090f 0%, #0d1117 60%, #080d1a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* ambient background glows */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 90% 55% at 50% -5%, rgba(99,102,241,0.18) 0%, transparent 70%)' }} />
      <div style={{ position: 'absolute', bottom: '-15%', left: '5%', width: '35%', height: '40%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)' }} />
      <div style={{ position: 'absolute', top: '20%', right: '5%', width: '25%', height: '30%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)' }} />

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 52, zIndex: 1 }}>
        <img src="/logo.png" alt="Vertex Living"
          style={{ height: 50, objectFit: 'contain' }}
          onError={e => { e.target.style.display = 'none'; }} />
        <div>
          <div style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.55rem', letterSpacing: '-0.03em', lineHeight: 1 }}>
            Vertex Living
          </div>
          <div style={{ color: '#475569', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 3 }}>
            Premium Real Estate · Gurgaon
          </div>
        </div>
      </div>

      {/* Headline */}
      <div style={{ textAlign: 'center', marginBottom: 44, zIndex: 1, maxWidth: 560 }}>
        <h1 style={{
          color: '#f1f5f9',
          fontSize: 'clamp(1.7rem, 5vw, 2.5rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          marginBottom: 14,
        }}>
          What brings you to{' '}
          <span style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>Vertex Living?</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.65 }}>
          Choose your goal — we'll personalise your experience and get you started in seconds.
        </p>
      </div>

      {/* Purpose Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        width: '100%',
        maxWidth: 820,
        zIndex: 1,
      }}>
        {PURPOSES.map(p => (
          <button
            key={p.id}
            onClick={() => handlePurpose(p)}
            onMouseEnter={() => setHovered(p.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: hovered === p.id ? p.hover : 'rgba(255,255,255,0.03)',
              border: `1.5px solid ${hovered === p.id ? p.color : 'rgba(255,255,255,0.07)'}`,
              borderRadius: 20,
              padding: '28px 22px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.22s cubic-bezier(0.22,1,0.36,1)',
              transform: hovered === p.id ? 'translateY(-4px)' : 'translateY(0)',
              boxShadow: hovered === p.id ? `0 16px 40px ${p.color}18` : 'none',
            }}
          >
            <div style={{ fontSize: '2.4rem', marginBottom: 16, lineHeight: 1 }}>{p.icon}</div>
            <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.1rem', marginBottom: 10, letterSpacing: '-0.01em' }}>
              {p.title}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.65, marginBottom: 22 }}>
              {p.subtitle}
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: p.gradient,
              color: '#fff',
              padding: '8px 18px',
              borderRadius: 9,
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.01em',
            }}>
              Get Started →
            </div>
          </button>
        ))}
      </div>

      {/* Sign in link */}
      <p style={{ color: '#475569', fontSize: '0.88rem', marginTop: 40, zIndex: 1 }}>
        Already have an account?{' '}
        <button
          onClick={handleSignIn}
          style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700 }}
        >
          Sign in →
        </button>
      </p>

      {/* Trust badges */}
      <div style={{
        display: 'flex', gap: 24, marginTop: 28,
        flexWrap: 'wrap', justifyContent: 'center', zIndex: 1,
      }}>
        {['🔒 256-bit SSL', '✓ RERA Verified', '0% Brokerage', '2,500+ Listings'].map(b => (
          <span key={b} style={{ color: '#334155', fontSize: '0.72rem' }}>{b}</span>
        ))}
      </div>
    </div>
  );
}
