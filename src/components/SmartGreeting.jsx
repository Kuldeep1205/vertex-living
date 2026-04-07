import React, { useState, useEffect } from 'react';
import { useIntel } from '../hooks/useIntelligence';
import './SmartGreeting.css';

export default function SmartGreeting({ onCtaClick }) {
  const intel = useIntel();
  const [visible, setVisible] = useState(false);
  const [nudge, setNudge] = useState(null);
  const [showNudge, setShowNudge] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  // Show nudge after interaction builds up
  useEffect(() => {
    if (!intel) return;
    const n = intel.getNudge();
    if (n && n !== nudge) {
      setNudge(n);
      setTimeout(() => setShowNudge(true), 400);
    }
  }, [intel?.viewCount, intel?.intel?.maxScrollPct]);

  if (!intel) return null;
  const msg = intel.getSmartMessage();

  return (
    <>
      {/* Smart greeting strip — appears in hero */}
      <div className={`sg-strip${visible ? ' sg-strip--in' : ''}${msg.type === 'returning' ? ' sg-strip--returning' : ''}`}>
        <div className="sg-dot" />
        <div className="sg-text">
          <span className="sg-headline">{msg.headline}</span>
          <span className="sg-sep">·</span>
          <span className="sg-sub">{msg.sub}</span>
        </div>
        {msg.cta && (
          <button className="sg-cta" onClick={() => onCtaClick?.()}>
            {msg.cta} →
          </button>
        )}
        {/* Session count badge for returning users */}
        {intel.isReturning && (
          <span className="sg-session-badge">Visit #{intel.intel.sessionCount}</span>
        )}
      </div>

      {/* Smart profile inference card — shows after 2+ views */}
      {intel.prefs && intel.viewCount >= 2 && (
        <div className={`sg-profile${visible ? ' sg-profile--in' : ''}`}>
          <span className="sg-profile-label">🧠 Your profile</span>
          <div className="sg-profile-tags">
            {intel.prefs.preferredBHK && (
              <span className="sg-tag">{intel.prefs.preferredBHK} BHK</span>
            )}
            {intel.prefs.preferredSector && (
              <span className="sg-tag">📍 {intel.prefs.preferredSector}</span>
            )}
            {intel.prefs.avgPrice && (
              <span className="sg-tag">₹{intel.prefs.avgPrice.toFixed(1)} Cr range</span>
            )}
            {intel.prefs.preferredType && (
              <span className="sg-tag">{intel.prefs.preferredType}</span>
            )}
          </div>
          <span className="sg-profile-note">inferred from your browsing</span>
        </div>
      )}

      {/* Nudge toast */}
      {nudge && showNudge && (
        <div className="sg-nudge" onClick={() => setShowNudge(false)}>
          <span className="sg-nudge-icon">{nudge.icon}</span>
          <span className="sg-nudge-msg">{nudge.msg}</span>
          <button className="sg-nudge-close" onClick={() => setShowNudge(false)}>✕</button>
        </div>
      )}
    </>
  );
}
