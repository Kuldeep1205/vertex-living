import React, { useState, useRef, useEffect, useCallback } from 'react';
import './PropertyReels.css';

const PropertyReels = ({ properties, onViewDetails }) => {
  const [liked, setLiked]       = useState(new Set());
  const [saved, setSaved]       = useState(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shareToast, setShareToast]     = useState('');
  const [likeAnimate, setLikeAnimate]   = useState(null);
  const [likeCounts] = useState(() =>
    Object.fromEntries(properties.map((_, i) => [i, 100 + Math.floor(Math.random() * 900)]))
  );
  const [localCounts, setLocalCounts] = useState(() => ({ ...likeCounts }));

  const containerRef = useRef(null);
  const cardRefs     = useRef([]);

  // Track active reel via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = cardRefs.current.findIndex((r) => r === entry.target);
            if (idx !== -1) setCurrentIndex(idx);
          }
        });
      },
      { root: containerRef.current, threshold: 0.55 }
    );
    const refs = cardRefs.current;
    refs.forEach((r) => r && observer.observe(r));
    return () => refs.forEach((r) => r && observer.unobserve(r));
  }, [properties]);

  const scrollToIndex = useCallback((idx) => {
    cardRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const toggleLike = (idx) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
        setLocalCounts((c) => ({ ...c, [idx]: c[idx] - 1 }));
      } else {
        next.add(idx);
        setLocalCounts((c) => ({ ...c, [idx]: c[idx] + 1 }));
        setLikeAnimate(idx);
        setTimeout(() => setLikeAnimate(null), 600);
      }
      return next;
    });
  };

  const toggleSave = (idx) => {
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const handleShare = async (property, idx) => {
    const text = `${property.name} — ${property.price}\n📍 ${property.location}\nVertex Living: ${window.location.href}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: property.name, text, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(text);
        setShareToast('Link copied!');
        setTimeout(() => setShareToast(''), 2500);
      }
    } catch {}
  };

  // Keyboard arrow navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowDown') scrollToIndex(Math.min(properties.length - 1, currentIndex + 1));
      if (e.key === 'ArrowUp')   scrollToIndex(Math.max(0, currentIndex - 1));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentIndex, properties.length, scrollToIndex]);

  return (
    <section className="reels-section" id="reels">
      {/* Section header */}
      <div className="reels-outer-header">
        <div className="reels-badge-row">
          <span className="reels-live-dot" />
          <span className="reels-badge-text">NEW</span>
        </div>
        <h2 className="reels-outer-title">
          Property <span className="reels-title-accent">Reels</span>
        </h2>
        <p className="reels-outer-sub">
          Scroll through premium properties just like Instagram Reels
        </p>
      </div>

      <div className="reels-layout">
        {/* ── Left: marketing panel (desktop) ── */}
        <div className="reels-marketing">
          <div className="reels-marketing-inner">
            <h3 className="reels-marketing-title">
              Browse Properties<br />
              <span>Like Never Before</span>
            </h3>
            <p className="reels-marketing-desc">
              India ka pehla real-estate platform jahan aap properties ko reel
              ki tarah explore kar sakte ho.
            </p>
            <ul className="reels-feature-list">
              <li><span className="rfl-icon">❤️</span><span>Like properties you love instantly</span></li>
              <li><span className="rfl-icon">📌</span><span>Save favorites for later</span></li>
              <li><span className="rfl-icon">📤</span><span>Share with family &amp; friends</span></li>
              <li><span className="rfl-icon">💬</span><span>Direct WhatsApp enquiry</span></li>
              <li><span className="rfl-icon">⬆️</span><span>Swipe up for next property</span></li>
            </ul>

            {/* Nav controls */}
            <div className="reels-desktop-nav">
              <button
                className="reels-nav-btn"
                onClick={() => scrollToIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
              >
                ↑
              </button>
              <span className="reels-nav-count">
                {String(currentIndex + 1).padStart(2, '0')} / {String(properties.length).padStart(2, '0')}
              </span>
              <button
                className="reels-nav-btn"
                onClick={() => scrollToIndex(Math.min(properties.length - 1, currentIndex + 1))}
                disabled={currentIndex === properties.length - 1}
              >
                ↓
              </button>
            </div>
          </div>
        </div>

        {/* ── Center: phone frame + reels ── */}
        <div className="reels-phone-wrapper">
          {/* Phone chrome */}
          <div className="reels-phone-chrome">
            <div className="phone-side-btn phone-vol-up" />
            <div className="phone-side-btn phone-vol-down" />
            <div className="phone-side-btn phone-power" />
            <div className="phone-notch-bar">
              <div className="phone-speaker" />
              <div className="phone-front-cam" />
            </div>

            {/* Scroll container */}
            <div className="reels-container" ref={containerRef}>
              {properties.map((property, idx) => (
                <div
                  key={idx}
                  className={`reel-card${idx === currentIndex ? ' reel-active' : ''}`}
                  ref={(el) => (cardRefs.current[idx] = el)}
                >
                  {/* BG image — Ken Burns when active */}
                  <div
                    className={`reel-bg${idx === currentIndex ? ' reel-bg-active' : ''}`}
                    style={{ backgroundImage: `url(${property.image})` }}
                  />

                  {/* Overlays */}
                  <div className="reel-grad-top" />
                  <div className="reel-grad-bottom" />

                  {/* Like heart pop animation */}
                  {likeAnimate === idx && <div className="reel-heart-pop">❤️</div>}

                  {/* Top bar: tag + status */}
                  <div className="reel-top-bar">
                    <span className={`reel-tag reel-tag-${property.tagColor || 'gold'}`}>
                      {property.tag}
                    </span>
                    <span className={`reel-status-badge ${property.status === 'Ready to Move' ? 'status-ready' : 'status-uc'}`}>
                      {property.status === 'Ready to Move' ? '🔑 Ready' : '🏗️ UC'}
                    </span>
                  </div>

                  {/* Right: action buttons */}
                  <div className="reel-actions">
                    {/* Like */}
                    <button
                      className={`reel-action${liked.has(idx) ? ' reel-liked' : ''}`}
                      onClick={() => toggleLike(idx)}
                    >
                      <span className="reel-action-emoji">
                        {liked.has(idx) ? '❤️' : '🤍'}
                      </span>
                      <span className="reel-action-label">
                        {localCounts[idx]?.toLocaleString('en-IN')}
                      </span>
                    </button>

                    {/* Save */}
                    <button
                      className={`reel-action${saved.has(idx) ? ' reel-saved' : ''}`}
                      onClick={() => toggleSave(idx)}
                    >
                      <span className="reel-action-emoji">
                        {saved.has(idx) ? '📌' : '🔖'}
                      </span>
                      <span className="reel-action-label">
                        {saved.has(idx) ? 'Saved' : 'Save'}
                      </span>
                    </button>

                    {/* Share */}
                    <button className="reel-action" onClick={() => handleShare(property, idx)}>
                      <span className="reel-action-emoji">📤</span>
                      <span className="reel-action-label">Share</span>
                    </button>

                    {/* Details */}
                    <button className="reel-action" onClick={() => onViewDetails(property)}>
                      <span className="reel-action-emoji">🏢</span>
                      <span className="reel-action-label">Info</span>
                    </button>
                  </div>

                  {/* Bottom: property info */}
                  <div className="reel-info">
                    <div className="reel-developer">{property.developer}</div>
                    <h3 className="reel-name">{property.name}</h3>
                    <div className="reel-location">📍 {property.location}</div>

                    <div className="reel-price-row">
                      <span className="reel-price">{property.price}</span>
                      <span className="reel-psf">{property.pricePerSqft}</span>
                    </div>

                    {/* Amenities chips */}
                    {property.amenities && (
                      <div className="reel-chips">
                        {property.amenities.slice(0, 3).map((a, i) => (
                          <span key={i} className="reel-chip">{a}</span>
                        ))}
                      </div>
                    )}

                    {/* AI note */}
                    {property.aiNote && (
                      <div className="reel-ai-note">
                        <span className="reel-ai-icon">🤖</span>
                        {property.aiNote}
                      </div>
                    )}

                    {/* CTA row */}
                    <div className="reel-cta-row">
                      <button className="reel-cta-primary" onClick={() => onViewDetails(property)}>
                        View Details
                      </button>
                      <a
                        href="https://wa.me/919671009931"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="reel-cta-wa"
                      >
                        💬 WhatsApp
                      </a>
                    </div>
                  </div>

                  {/* Side progress dots */}
                  <div className="reel-progress-track">
                    {properties.map((_, i) => (
                      <button
                        key={i}
                        className={`reel-progress-dot${i === idx ? ' reel-dot-active' : ''}`}
                        onClick={() => scrollToIndex(i)}
                        aria-label={`Go to property ${i + 1}`}
                      />
                    ))}
                  </div>

                  {/* Swipe hint — only first card */}
                  {idx === 0 && currentIndex === 0 && (
                    <div className="reel-swipe-hint">
                      <div className="swipe-arrow">↑</div>
                      <span>Swipe up</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="phone-home-bar" />
          </div>

          {/* Decorative glow behind phone */}
          <div className="phone-glow" />
        </div>

        {/* ── Right: stats panel (desktop) ── */}
        <div className="reels-stats-panel">
          <div className="reels-stat-card">
            <div className="rsc-number">
              {properties.reduce((s, _, i) => s + (localCounts[i] || 0), 0).toLocaleString('en-IN')}
            </div>
            <div className="rsc-label">Total Likes</div>
          </div>
          <div className="reels-stat-card">
            <div className="rsc-number">{properties.length}</div>
            <div className="rsc-label">Premium Properties</div>
          </div>
          <div className="reels-stat-card rsc-highlight">
            <div className="rsc-number">{saved.size}</div>
            <div className="rsc-label">Saved by You</div>
          </div>

          <div className="reels-keyboard-hint">
            <div className="kbd-hint-title">Keyboard Shortcuts</div>
            <div className="kbd-row"><kbd>↑</kbd><span>Previous</span></div>
            <div className="kbd-row"><kbd>↓</kbd><span>Next</span></div>
          </div>
        </div>
      </div>

      {/* Share toast */}
      {shareToast && (
        <div className="reel-share-toast">✓ {shareToast}</div>
      )}
    </section>
  );
};

export default PropertyReels;
