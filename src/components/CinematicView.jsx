import React, { useEffect, useState, useRef } from 'react';
import './CinematicView.css';

export default function CinematicView({ property, imgSrc, onClose, onExplore }) {
  const [phase, setPhase] = useState(0);
  // phase 0 = black intro
  // phase 1 = image zoom-in + title
  // phase 2 = details appear
  // phase 3 = CTA ready

  const timerRef = useRef([]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 1400);
    const t3 = setTimeout(() => setPhase(3), 2400);
    timerRef.current = [t1, t2, t3];
    return () => {
      timerRef.current.forEach(clearTimeout);
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = () => {
    document.body.style.overflow = '';
    onClose();
  };

  const handleExplore = () => {
    document.body.style.overflow = '';
    onExplore();
  };

  return (
    <div className={`cv-overlay cv-phase-${phase}`}>
      {/* Film grain */}
      <div className="cv-grain" />

      {/* Scan lines */}
      <div className="cv-scanlines" />

      {/* Background image — Ken Burns zoom */}
      {imgSrc && (
        <div
          className={`cv-bg${phase >= 1 ? ' cv-bg--zoom' : ''}`}
          style={{ backgroundImage: `url(${imgSrc})` }}
        />
      )}

      {/* Dark cinematic overlay */}
      <div className="cv-vignette" />
      <div className={`cv-overlay-dark${phase >= 1 ? ' cv-overlay-dark--show' : ''}`} />

      {/* Letterbox bars */}
      <div className={`cv-bar cv-bar--top${phase >= 1 ? ' cv-bar--open' : ''}`} />
      <div className={`cv-bar cv-bar--bottom${phase >= 1 ? ' cv-bar--open' : ''}`} />

      {/* Content */}
      <div className="cv-content">
        {/* Studio tag */}
        <div className={`cv-studio${phase >= 1 ? ' cv-show' : ''}`}>
          VERTEX LIVING PRESENTS
        </div>

        {/* Property title — letter split animation */}
        <h1 className={`cv-title${phase >= 1 ? ' cv-show' : ''}`}>
          {property.name}
        </h1>

        {/* Divider line */}
        <div className={`cv-divider${phase >= 2 ? ' cv-show' : ''}`} />

        {/* Details row */}
        <div className={`cv-details${phase >= 2 ? ' cv-show' : ''}`}>
          <div className="cv-detail">
            <span className="cv-detail-label">Price</span>
            <span className="cv-detail-value">{property.priceDisplay}</span>
          </div>
          {property.bedrooms > 0 && (
            <div className="cv-detail">
              <span className="cv-detail-label">Configuration</span>
              <span className="cv-detail-value">{property.bedrooms} BHK</span>
            </div>
          )}
          <div className="cv-detail">
            <span className="cv-detail-label">Area</span>
            <span className="cv-detail-value">{property.area}</span>
          </div>
          <div className="cv-detail">
            <span className="cv-detail-label">Status</span>
            <span className="cv-detail-value">{property.status}</span>
          </div>
        </div>

        {/* Location */}
        <div className={`cv-location${phase >= 2 ? ' cv-show' : ''}`}>
          📍 {property.location}
        </div>

        {/* CTAs */}
        <div className={`cv-actions${phase >= 3 ? ' cv-show' : ''}`}>
          <button className="cv-btn-explore" onClick={handleExplore}>
            Explore Property →
          </button>
          <button className="cv-btn-close" onClick={handleClose}>
            ✕ Close
          </button>
        </div>
      </div>

      {/* Skip button */}
      <button className="cv-skip" onClick={handleClose}>ESC</button>
    </div>
  );
}
