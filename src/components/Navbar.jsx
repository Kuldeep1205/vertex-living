import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import './Navbar.css';
import './AuthModal.css';

const Navbar = ({ scrolled, scrollToSection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection]   = useState('');
  const [userDropdown, setUserDropdown]     = useState(false);
  const dropdownRef = useRef(null);
  const navigate   = useNavigate();
  const location   = useLocation();
  const isRentPage = location.pathname === '/rent';
  const { isDark, toggle, mood, toggleMood } = useTheme();
  const { settings: siteSettings } = useSiteSettings();
  const { user, openLogin, openRegister, logout, isAdmin, isBuilder, isBuyer } = useAuth();

  const navLinks = [
    { id: 'home',    label: 'Home',    section: 'hero' },
    { id: 'about',   label: 'About',   section: 'about' },
    { id: 'contact', label: 'Contact', section: 'contact' },
  ];

  const propertyLinks = [
    { id: 'pre-launch',         label: '🚀 Pre-Launch',            section: 'pre-launch' },
    { id: 'ready-to-move',      label: '✅ Ready to Move',         section: 'ready-to-move' },
    { id: 'under-construction', label: '🏗️ Under Construction',   section: 'under-construction' },
    { id: 'apartments',         label: '🏢 Apartments',            section: 'apartments' },
    { id: 'villas',             label: '🏡 Villas',                section: 'villas' },
    { id: 'commercial',         label: '🏬 Commercial',            section: 'commercial' },
    { id: 'plots',              label: '🌍 Plots & Land',          section: 'plots' },
    { id: 'penthouses',         label: '👑 Penthouses',            section: 'penthouses' },
    { id: 'shops-offices',      label: '💼 Shops & Offices',       section: 'shops-offices' },
  ];

  const [propDropdown, setPropDropdown] = React.useState(false);
  const propDropRef = React.useRef(null);

  React.useEffect(() => {
    if (!propDropdown) return;
    const fn = e => { if (propDropRef.current && !propDropRef.current.contains(e.target)) setPropDropdown(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [propDropdown]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.body.style.overflow = mobileMenuOpen ? 'auto' : 'hidden';
  };

  const handleNavClick = (sectionId) => {
    scrollToSection(sectionId);
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
    document.body.style.overflow = 'auto';
  };

  useEffect(() => {
    const sections = navLinks.map(l => l.section);
    const handleScroll = () => {
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom > 100) {
            setActiveSection(id);
            return;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
        document.body.style.overflow = 'auto';
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  // Close user dropdown on outside click
  useEffect(() => {
    if (!userDropdown) return;
    const fn = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setUserDropdown(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [userDropdown]);

  const ThemeToggle = () => (
    <button
      className={`theme-toggle${isDark ? ' theme-toggle--dark' : ''}`}
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="theme-toggle-thumb">
        {/* Sun */}
        <svg className="tt-sun" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
        </svg>
        {/* Moon */}
        <svg className="tt-moon" width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </span>
    </button>
  );

  const portalEl = typeof document !== 'undefined' ? document.getElementById('portal-fixed') : null;
  const content = (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="navbar-content">
          {/* Logo */}
          <div className="navbar-logo">
            <a href="#hero" onClick={(e) => { e.preventDefault(); handleNavClick('hero'); }}>
              <img src="/logo.png" alt="Vertex Living" />
            </a>
          </div>

          {/* Desktop Navigation */}
          <ul className="navbar-nav">
            {navLinks.slice(0, 1).map((link) => (
              <li key={link.id} className="nav-item">
                <button className={`nav-link ${activeSection === link.section ? 'active' : ''}`} onClick={() => handleNavClick(link.section)}>{link.label}</button>
              </li>
            ))}

            {/* Properties Dropdown */}
            <li className="nav-item" style={{ position: 'relative' }} ref={propDropRef}>
              <button
                className="nav-link"
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setPropDropdown(v => !v)}
              >
                Properties
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0.6, transition: 'transform 0.2s', transform: propDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              {propDropdown && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--surface, #111827)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px', padding: '8px', minWidth: '220px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)', zIndex: 1000,
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px',
                }}>
                  {propertyLinks.map(link => (
                    <button key={link.id}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 10px', borderRadius: '8px', background: 'transparent', border: 'none', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s, color 0.15s', whiteSpace: 'nowrap' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; e.currentTarget.style.color = '#e2e8f0'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#cbd5e1'; }}
                      onClick={() => { handleNavClick(link.section); setPropDropdown(false); }}
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              )}
            </li>

            {navLinks.slice(1).map((link) => (
              <li key={link.id} className="nav-item">
                <button className={`nav-link ${activeSection === link.section ? 'active' : ''}`} onClick={() => handleNavClick(link.section)}>{link.label}</button>
              </li>
            ))}

            {/* Rent Link — only for buyers / logged-out users */}
            {!isBuilder && (
              <li className="nav-item">
                <button
                  className="nav-link"
                  onClick={() => navigate('/rent')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    color: isRentPage ? '#34d399' : undefined,
                    fontWeight: isRentPage ? '700' : undefined,
                  }}
                >
                  🏠 Rent
                </button>
              </li>
            )}
          </ul>

          {/* CTA + Theme Toggle */}
          <div className="navbar-actions">
            <div className="navbar-cta" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div className="mood-toggle-group">
                <button
                  className={`mood-btn${mood === 'luxury' ? ' mood-btn--active' : ''}`}
                  onClick={() => mood !== 'luxury' && toggleMood()}
                  title="Luxury Mode"
                >
                  ✨ {siteSettings.luxuryLabel || 'Luxury'}
                </button>
                <button
                  className={`mood-btn mood-btn--budget${mood === 'budget' ? ' mood-btn--active' : ''}`}
                  onClick={() => mood !== 'budget' && toggleMood()}
                  title="Budget Mode"
                >
                  💰 {siteSettings.budgetLabel || 'Budget'}
                </button>
              </div>
              <ThemeToggle />
              {isAdmin && (
                <a
                  href="/dashboard"
                  style={{
                    padding: '8px 16px', borderRadius: '8px',
                    background: 'rgba(99,102,241,0.15)', color: '#818cf8',
                    border: '1px solid rgba(99,102,241,0.3)', fontSize: '14px',
                    fontWeight: '600', textDecoration: 'none',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}
                >
                  🤖 AI Dashboard
                </a>
              )}

              {/* ── Auth: show user avatar OR login button ── */}
              {user ? (
                <div style={{ position: 'relative' }} ref={dropdownRef}>
                  <button
                    className="nav-user-btn"
                    onClick={() => setUserDropdown(v => !v)}
                    title="Account"
                  >
                    <div className="nav-user-avatar">{user.avatar}</div>
                    <span style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.name.split(' ')[0]}
                    </span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0.5 }}>
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>
                  {userDropdown && (
                    <div className="nav-user-dropdown">
                      <div className="nav-user-info">
                        <div className="nav-user-info-top">
                          <div className="nav-user-avatar-lg">{user.avatar}</div>
                          <div>
                            <div className="nav-user-name">{user.name}</div>
                            <div className="nav-user-email">{user.email}</div>
                          </div>
                        </div>
                        <div className="nav-user-badge">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          Verified Member
                        </div>
                      </div>
                      <button className="nav-dd-item" onClick={() => { setUserDropdown(false); handleNavClick('contact'); }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                        Browse Properties
                      </button>
                      {isAdmin && (
                        <button className="nav-dd-item" onClick={() => { setUserDropdown(false); window.location.href = '/dashboard'; }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                          AI Dashboard
                        </button>
                      )}
                      <div className="nav-dd-sep" />
                      <button className="nav-dd-item danger" onClick={() => { logout(); setUserDropdown(false); }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => openLogin()}
                    style={{
                      padding: '8px 14px', borderRadius: '8px',
                      background: 'transparent', color: '#94a3b8',
                      border: '1px solid rgba(255,255,255,0.1)', fontSize: '13px',
                      fontWeight: '600', cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.color = '#e2e8f0'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#94a3b8'; }}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => openRegister()}
                    className="btn-cta"
                    style={{ padding: '8px 14px', fontSize: '13px' }}
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile: Theme Toggle + Auth button always visible */}
          <div className="navbar-mobile-right" style={{ alignItems: 'center', gap: '8px' }}>
            <ThemeToggle />
            {user ? (
              <button
                className="nav-user-btn"
                onClick={() => setUserDropdown(v => !v)}
                style={{ padding: '4px 8px 4px 4px' }}
              >
                <div className="nav-user-avatar" style={{ width: 26, height: 26, fontSize: '0.7rem' }}>{user.avatar}</div>
              </button>
            ) : (
              <button
                onClick={() => openLogin()}
                style={{
                  padding: '6px 12px', borderRadius: '7px',
                  background: 'rgba(99,102,241,0.15)', color: '#818cf8',
                  border: '1px solid rgba(99,102,241,0.3)', fontSize: '12px',
                  fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="hamburger"></span>
            <span className="hamburger"></span>
            <span className="hamburger"></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-content">
          <ul className="mobile-nav">
            {[...navLinks.slice(0,1), ...propertyLinks, ...navLinks.slice(1)].map((link) => (
              <li key={link.id} className="mobile-nav-item">
                <button
                  className={`mobile-nav-link ${activeSection === link.section ? 'active' : ''}`}
                  onClick={() => handleNavClick(link.section)}
                >
                  {link.label}
                </button>
              </li>
            ))}
            {!isBuilder && (
              <li className="mobile-nav-item">
                <button
                  className={`mobile-nav-link ${isRentPage ? 'active' : ''}`}
                  onClick={() => { navigate('/rent'); setMobileMenuOpen(false); document.body.style.overflow = 'auto'; }}
                  style={{ color: isRentPage ? '#34d399' : undefined }}
                >
                  🏠 Rent
                </button>
              </li>
            )}
          </ul>
          <div className="mobile-actions">
            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 4 }}>
                  <div className="nav-user-avatar">{user.avatar}</div>
                  <div>
                    <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.9rem' }}>{user.name}</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{user.email}</div>
                  </div>
                </div>
                <button className="btn-cta" onClick={() => { logout(); setMobileMenuOpen(false); document.body.style.overflow = 'auto'; }}>
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                <button className="btn-cta" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}
                  onClick={() => { openLogin(); setMobileMenuOpen(false); document.body.style.overflow = 'auto'; }}>
                  Login Karo
                </button>
                <button className="btn-cta"
                  onClick={() => { openRegister(); setMobileMenuOpen(false); document.body.style.overflow = 'auto'; }}>
                  Register Karo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
  return portalEl ? createPortal(content, portalEl) : content;
};

export default Navbar;
