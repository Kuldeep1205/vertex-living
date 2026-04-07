import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './InteriorPreviewModal.css';

const STYLES = [
  { id: 'modern',  label: 'Modern',  emoji: '🏙️', desc: 'Clean lines & neutral tones' },
  { id: 'minimal', label: 'Minimal', emoji: '🪑', desc: 'Less is more, pure forms' },
  { id: 'luxury',  label: 'Luxury',  emoji: '🛋️', desc: 'Opulent, curated finishes' },
];

const ROOMS = [
  { id: 'living',  label: 'Living Room', icon: '🛋️' },
  { id: 'bedroom', label: 'Bedroom',     icon: '🛏️' },
  { id: 'kitchen', label: 'Kitchen',     icon: '🍳' },
];

const IMAGES = {
  modern: {
    living:  ['1600210492493-0946911123ea', '1555041469-7a45f0e8e36d', '1493809842364-78817add7ffb'],
    bedroom: ['1631049307264-da0ec9d70304', '1560185007-c5ca9d2c014d', '1522771739844-6a9f6d5f14af'],
    kitchen: ['1556909114-f6e7ad7d3136', '1556047765-e293a62a6a5a', '1556044987-eba06db29f8d'],
  },
  minimal: {
    living:  ['1586023492125-27b2c045efd7', '1484101403633-562f891dc89a', '1505693416388-ac5ce068fe85'],
    bedroom: ['1540518614846-7eded433c457', '1558618666-fcd25c85cd64', '1616594039964-ae485021639a'],
    kitchen: ['1556909190-eccf4a8bf97a', '1556909048-4b0d5e85a95f', '1556909114-f6e7ad7d3136'],
  },
  luxury: {
    living:  ['1616486338812-3dadae4b4ace', '1567016432779-094069958ea5', '1549497538-10861e3d3c8d'],
    bedroom: ['1631049552057-403cdb8f0658', '1618221195710-dd6b41faaea6', '1616137422495-1e9e46e2aa1b'],
    kitchen: ['1556047765-e293a62a6a5a', '1556909114-f6e7ad7d3136', '1556909190-eccf4a8bf97a'],
  },
};

const STYLE_META = {
  modern:  { color: '#6366f1', gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', glow: 'rgba(99,102,241,0.2)' },
  minimal: { color: '#64748b', gradient: 'linear-gradient(135deg,#475569,#94a3b8)', glow: 'rgba(100,116,139,0.2)' },
  luxury:  { color: '#d4a853', gradient: 'linear-gradient(135deg,#d4a853,#f0c96e)', glow: 'rgba(212,168,83,0.2)' },
};

const GEN_STEPS = [
  'Analyzing room dimensions...',
  'Applying design language...',
  'Rendering interior preview...',
];

export default function InteriorPreviewModal({ property, onClose }) {
  const [style, setStyle]       = useState('modern');
  const [room, setRoom]         = useState('living');
  const [imgIdx, setImgIdx]     = useState(0);
  const [generating, setGen]    = useState(true);
  const [step, setStep]         = useState(0);
  const [regenKey, setRegenKey] = useState(0);

  // Fake AI generation animation on every change
  useEffect(() => {
    setGen(true);
    setStep(0);
    const t1 = setTimeout(() => setStep(1), 480);
    const t2 = setTimeout(() => setStep(2), 960);
    const t3 = setTimeout(() => setGen(false), 1440);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [style, room, regenKey]);

  const changeStyle = (s) => { if (s !== style) { setStyle(s); setImgIdx(0); } };
  const changeRoom  = (r) => { if (r !== room)  { setRoom(r);  setImgIdx(0); } };
  const regenerate  = () => { setImgIdx(i => (i + 1) % IMAGES[style][room].length); setRegenKey(k => k + 1); };

  const imgId    = IMAGES[style][room][imgIdx];
  const meta     = STYLE_META[style];
  const styleObj = STYLES.find(s => s.id === style);
  const roomObj  = ROOMS.find(r => r.id === room);

  return (
    <div className="ip-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div
        className="ip-modal"
        initial={{ opacity: 0, y: 48, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* ── Header ── */}
        <div className="ip-header">
          <div>
            <div className="ip-ai-badge">
              <span className="ip-ai-pulse" />
              AI Interior Preview
            </div>
            <h3 className="ip-prop-name">{property?.title || property?.name}</h3>
          </div>
          <button className="ip-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* ── Style Selector ── */}
        <div className="ip-styles">
          {STYLES.map(s => (
            <button
              key={s.id}
              className={`ip-style-btn${style === s.id ? ' ip-style-active' : ''}`}
              onClick={() => changeStyle(s.id)}
              style={style === s.id ? { '--sg': STYLE_META[s.id].gradient, '--sc': STYLE_META[s.id].color, '--sglow': STYLE_META[s.id].glow } : {}}
            >
              <span className="ip-style-emoji">{s.emoji}</span>
              <span className="ip-style-label">{s.label}</span>
              <span className="ip-style-desc">{s.desc}</span>
            </button>
          ))}
        </div>

        {/* ── Room Tabs ── */}
        <div className="ip-rooms">
          {ROOMS.map(r => (
            <button
              key={r.id}
              className={`ip-room-btn${room === r.id ? ' ip-room-active' : ''}`}
              style={room === r.id ? { '--sc': meta.color } : {}}
              onClick={() => changeRoom(r.id)}
            >
              {r.icon} {r.label}
            </button>
          ))}
        </div>

        {/* ── Image Area ── */}
        <div className="ip-img-wrap">
          <AnimatePresence mode="wait">
            {generating ? (
              <motion.div key="gen" className="ip-generating"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="ip-spinner-ring" style={{ borderTopColor: meta.color }} />
                <p className="ip-gen-step">{GEN_STEPS[step]}</p>
                <div className="ip-progress-track">
                  <motion.div
                    className="ip-progress-fill"
                    style={{ background: meta.gradient }}
                    initial={{ width: '0%' }}
                    animate={{ width: step === 0 ? '33%' : step === 1 ? '66%' : '92%' }}
                    transition={{ duration: 0.42 }}
                  />
                </div>
                <p className="ip-gen-hint">Visualizing {styleObj.label} {roomObj.label}</p>
              </motion.div>
            ) : (
              <motion.div key={`${style}-${room}-${imgIdx}`} className="ip-image-box"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}>
                <img
                  className="ip-image"
                  src={`https://images.unsplash.com/photo-${imgId}?w=820&h=460&fit=crop&q=85`}
                  alt={`${styleObj.label} ${roomObj.label}`}
                />
                <div className="ip-img-overlays">
                  <span className="ip-ai-stamp" style={{ background: meta.gradient }}>
                    ✨ AI Enhanced
                  </span>
                  <span className="ip-room-tag">
                    {roomObj.icon} {styleObj.label} · {roomObj.label}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Footer ── */}
        <div className="ip-footer">
          <p className="ip-disclaimer">AI-generated visualization · Actual interiors may vary</p>
          <div className="ip-footer-btns">
            <button className="ip-regen-btn" onClick={regenerate} disabled={generating}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>
              </svg>
              Regenerate
            </button>
            <button className="ip-save-btn" style={{ background: meta.gradient }}>
              Save Style
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
