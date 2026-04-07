import React, { useState, useEffect } from 'react';
import './SocialProof.css';

// Deterministic seed per property so numbers are consistent (not random each render)
function seeded(id, min, max) {
  const s = ((id * 2654435761) >>> 0) % (max - min + 1);
  return min + s;
}

export default function SocialProof({ propertyId, price }) {
  const base  = seeded(propertyId, 18, 94);
  const saved = seeded(propertyId + 7, 4, 31);
  const [viewing, setViewing] = useState(seeded(propertyId + 3, 3, 12));
  const [pulse, setPulse] = useState(false);

  // Randomly bump "viewing now" count up/down by 1 every few seconds
  useEffect(() => {
    const jitter = 5000 + seeded(propertyId, 0, 4000);
    const t = setInterval(() => {
      setViewing(v => {
        const delta = Math.random() > 0.45 ? 1 : -1;
        return Math.max(1, Math.min(20, v + delta));
      });
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }, jitter);
    return () => clearInterval(t);
  }, [propertyId]);

  const hot = price >= 3 || base > 70;

  return (
    <div className="sp-row">
      {hot && <span className="sp-hot">🔥 Trending</span>}
      <span className={`sp-viewing${pulse ? ' sp-pulse' : ''}`}>
        <span className="sp-dot" />
        <span className="sp-num">{viewing}</span> viewing now
      </span>
      <span className="sp-saved">♥ {saved} saved</span>
      <span className="sp-total">{base} views today</span>
    </div>
  );
}
