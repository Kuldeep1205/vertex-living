import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './BottomNav.css';

const SECTION_PILLS = [
  { id: 'pre-launch',         label: '🚀 Pre-Launch' },
  { id: 'ready-to-move',      label: '✅ Ready to Move' },
  { id: 'under-construction', label: '🏗️ Under Construction' },
  { id: 'apartments',         label: '🏢 Apartments' },
  { id: 'villas',             label: '🏡 Villas' },
  { id: 'commercial',         label: '🏬 Commercial' },
  { id: 'plots',              label: '🌍 Plots' },
  { id: 'penthouses',         label: '🏙️ Penthouses' },
  { id: 'studios',            label: '🛋️ Studios' },
  { id: 'townships',          label: '🌆 Townships' },
];

const NAV_ITEMS = [
  {
    id: 'hero',
    label: 'Home',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    iconActive: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22" fill="white" stroke="white" strokeWidth="0.5"/>
      </svg>
    ),
  },
  {
    id: 'featured-section',
    label: 'Properties',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="7" height="9" rx="1"/>
        <rect x="15" y="3" width="7" height="5" rx="1"/>
        <rect x="15" y="12" width="7" height="9" rx="1"/>
        <rect x="2" y="16" width="7" height="5" rx="1"/>
      </svg>
    ),
    iconActive: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <rect x="2" y="3" width="7" height="9" rx="1"/>
        <rect x="15" y="3" width="7" height="5" rx="1"/>
        <rect x="15" y="12" width="7" height="9" rx="1"/>
        <rect x="2" y="16" width="7" height="5" rx="1"/>
      </svg>
    ),
  },
  {
    id: 'rent',
    label: 'Rent',
    isRoute: '/rent',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <path d="M9 22V12h6v10"/>
        <circle cx="18" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="2"/>
        <path d="M16 8h4M18 6v4" strokeWidth="2"/>
      </svg>
    ),
    iconActive: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <path d="M9 22V12h6v10" fill="white" stroke="white" strokeWidth="0.5"/>
        <circle cx="18" cy="8" r="4" fill="#22c55e" stroke="none"/>
        <path d="M16 8h4M18 6v4" stroke="white" strokeWidth="2" fill="none"/>
      </svg>
    ),
  },
  {
    id: 'agent-showcase-section',
    label: 'Agents',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    iconActive: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" fill="none" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    id: 'contact',
    label: 'Contact',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6 19.79 19.79 0 0 1 1.61 5 2 2 0 0 1 3.6 2.82h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.4a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 17.72z"/>
      </svg>
    ),
    iconActive: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6 19.79 19.79 0 0 1 1.61 5 2 2 0 0 1 3.6 2.82h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.4a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 17.72z"/>
      </svg>
    ),
  },
];

const BottomNav = ({ scrollToSection }) => {
  const [active, setActive]       = useState('hero');
  const [showPills, setShowPills] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, isBuilder } = useAuth();

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    if (!isHomePage) return;
    const ids = NAV_ITEMS.filter(n => !n.isRoute).map(n => n.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          const found = NAV_ITEMS.find(n => n.id === visible[0].target.id);
          if (found) setActive(found.id);
        }
      },
      { threshold: [0.15, 0.4], rootMargin: '-5% 0px -45% 0px' }
    );
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [isHomePage]);

  const handleClick = (item) => {
    if (item.isRoute) {
      navigate(item.isRoute);
      setActive(item.id);
      return;
    }
    // Properties tap — toggle pills drawer
    if (item.id === 'featured-section') {
      setShowPills(v => !v);
      return;
    }
    setShowPills(false);
    setActive(item.id);
    if (isHomePage) {
      scrollToSection(item.id);
    } else {
      navigate('/');
      setTimeout(() => scrollToSection(item.id), 400);
    }
  };

  const handlePillClick = (sectionId) => {
    setShowPills(false);
    setActive('featured-section');
    if (isHomePage) {
      scrollToSection(sectionId);
    } else {
      navigate('/');
      setTimeout(() => scrollToSection(sectionId), 400);
    }
  };

  // Hide Rent button for builders
  const visibleItems = NAV_ITEMS.filter(item =>
    item.id === 'rent' ? !isBuilder : true
  );

  const portalEl = typeof document !== 'undefined' ? document.getElementById('portal-fixed') : null;

  const content = (
    <>
      {/* Property section pills drawer */}
      {showPills && (
        <div className="bnav-pills-drawer">
          <div className="bnav-pills-scroll">
            {SECTION_PILLS.map(pill => (
              <button
                key={pill.id}
                className="bnav-pill"
                onClick={() => handlePillClick(pill.id)}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <nav className="bottom-nav" role="navigation" aria-label="App navigation">
        {visibleItems.map(item => {
          const isActive = location.pathname === '/rent'
            ? item.id === 'rent'
            : active === item.id;
          const isPropertiesOpen = item.id === 'featured-section' && showPills;
          return (
            <button
              key={item.id}
              className={`bnav-item${isActive || isPropertiesOpen ? ' bnav-item--active' : ''}`}
              onClick={() => handleClick(item)}
              aria-label={item.label}
            >
              <span className="bnav-icon">
                {isActive || isPropertiesOpen ? item.iconActive : item.icon}
              </span>
              <span className="bnav-label">{item.label}</span>
              {item.id === 'featured-section' && (
                <span style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 6, height: 6, borderRadius: '50%',
                  background: showPills ? '#6366f1' : 'transparent',
                  transition: 'background 0.2s',
                }} />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );

  return portalEl ? createPortal(content, portalEl) : content;
};

export default BottomNav;
