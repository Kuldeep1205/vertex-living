import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { PROPERTY_DATABASE } from '../data/properties';
import { useIntel } from '../hooks/useIntelligence';
import './StickyAssistant.css';

function getSmartProperties(count = 4, prefs) {
  const residential = PROPERTY_DATABASE.filter(p => p.bedrooms > 0);
  if (!prefs) {
    const shuffled = [...residential].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
  // Score properties against inferred prefs
  const scored = residential.map(p => {
    let s = 0;
    if (prefs.preferredBHK && p.bedrooms === prefs.preferredBHK) s += 30;
    if (prefs.preferredSector && p.sector === prefs.preferredSector) s += 20;
    if (prefs.avgPrice) {
      const diff = Math.abs(p.price - prefs.avgPrice) / prefs.avgPrice;
      s += diff < 0.25 ? 25 : diff < 0.5 ? 12 : 0;
    }
    if (prefs.preferredType && p.type === prefs.preferredType) s += 10;
    s += Math.random() * 5; // slight shuffle
    return { ...p, _score: s };
  });
  return scored.sort((a, b) => b._score - a._score).slice(0, count);
}

const SUGGESTIONS = [
  { text: 'Similar property available', emoji: '👀' },
  { text: 'New listing in your range', emoji: '🏠' },
  { text: 'Hot deal just added', emoji: '🔥' },
  { text: 'Price dropped nearby', emoji: '💸' },
];

export default function StickyAssistant() {
  const intel = useIntel();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [suggestionIdx, setSuggestionIdx] = useState(0);
  const [properties, setProperties] = useState([]);

  // Show after scrolling 400px
  useEffect(() => {
    const handleScroll = () => {
      if (!dismissed) setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dismissed]);

  // Rotate suggestions every 4s
  useEffect(() => {
    if (!visible || dismissed) return;
    const t = setInterval(() => {
      setSuggestionIdx(i => (i + 1) % SUGGESTIONS.length);
    }, 4000);
    return () => clearInterval(t);
  }, [visible, dismissed]);

  const openModal = useCallback(() => {
    const prefs = intel?.prefs;
    setProperties(getSmartProperties(4, prefs));
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = () => {
    setModalOpen(false);
    document.body.style.overflow = '';
  };

  const dismiss = (e) => {
    e.stopPropagation();
    setDismissed(true);
    setVisible(false);
  };

  useEffect(() => {
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!visible && !modalOpen) return null;

  const portalEl = typeof document !== 'undefined' ? document.getElementById('portal-fixed') : null;
  const content = (
    <>
      {/* Sticky Banner */}
      {visible && !modalOpen && (
        <div className="sticky-assistant" onClick={openModal}>
          <div className="sa-pulse" />
          <div className="sa-content">
            <span className="sa-emoji">{SUGGESTIONS[suggestionIdx].emoji}</span>
            <span className="sa-text">{SUGGESTIONS[suggestionIdx].text}</span>
            <span className="sa-cta">View →</span>
          </div>
          <button className="sa-dismiss" onClick={dismiss} title="Dismiss">✕</button>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="sa-modal-overlay" onClick={closeModal}>
          <div className="sa-modal" onClick={e => e.stopPropagation()}>
            <div className="sa-modal-header">
              <div>
                <h3 className="sa-modal-title">{intel?.prefs ? '✨ Matched for You' : 'Similar Properties'}</h3>
                <p className="sa-modal-sub">{intel?.prefs ? `Based on your interest in ${intel.prefs.preferredBHK ? intel.prefs.preferredBHK + 'BHK · ' : ''}${intel.prefs.preferredSector || 'Gurgaon'}` : 'Handpicked from current listings'}</p>
              </div>
              <button className="sa-modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="sa-modal-grid">
              {properties.map(p => (
                <div key={p.id} className="sa-prop-card">
                  <div className="sa-prop-badge">{p.status === 'Ready to Move' ? '✅ Ready' : '🔨 Under Construction'}</div>
                  <div className="sa-prop-type">{p.type} · {p.bedrooms} BHK</div>
                  <div className="sa-prop-name">{p.name}</div>
                  <div className="sa-prop-loc">📍 {p.sector}, {p.city}</div>
                  <div className="sa-prop-footer">
                    <span className="sa-prop-price">{p.priceDisplay}</span>
                    <span className="sa-prop-area">{p.area}</span>
                  </div>
                  <a href={`/property/${p.id}`} className="sa-prop-btn">View Details →</a>
                </div>
              ))}
            </div>

            <button className="sa-modal-refresh" onClick={() => setProperties(getRandomProperties(4))}>
              🔄 Show different properties
            </button>
          </div>
        </div>
      )}
    </>
  );
  return portalEl ? createPortal(content, portalEl) : content;
}
