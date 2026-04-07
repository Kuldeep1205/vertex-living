import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './MarketPulse.css';

const TICKERS = [
  { label: 'Sector 65',       change: '+4.2%', up: true  },
  { label: 'DLF Phase 5',     change: '+7.1%', up: true  },
  { label: 'Sohna Road',      change: '+2.8%', up: true  },
  { label: 'New Gurgaon',     change: '+1.5%', up: true  },
  { label: 'Dwarka Expy',     change: '+3.9%', up: true  },
  { label: 'Golf Course Rd',  change: '+5.6%', up: true  },
  { label: 'Sector 49',       change: '-0.8%', up: false },
  { label: 'MG Road',         change: '+2.1%', up: true  },
  { label: 'Cyber City',      change: '+6.3%', up: true  },
  { label: 'Sector 82',       change: '-1.2%', up: false },
];

const INSIGHTS = [
  '🔥 High demand in Sector 65 — 3 properties sold this week',
  '📈 DLF properties up 7% YoY — strong appreciation',
  '⚡ 2,847 buyers active on Vertex Living today',
  '🏆 Gurgaon ranked #1 luxury market in NCR 2024',
  '💡 Under-construction prices 18% lower than ready-to-move',
  '🚀 Dwarka Expressway — fastest growing micro-market',
  '🔔 Interest rates expected to drop Q1 2025 — good time to lock',
  '📊 Average price appreciation: 12.4% in premium segments',
  '🏘️ 340+ new listings added this week',
  '⭐ 94% of buyers recommend Vertex Living',
];

export default function MarketPulse() {
  const trackRef = useRef(null);
  const [insightIdx, setInsightIdx] = useState(0);
  const [insightVisible, setInsightVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setInsightVisible(false);
      setTimeout(() => {
        setInsightIdx(i => (i + 1) % INSIGHTS.length);
        setInsightVisible(true);
      }, 400);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  const portalEl = typeof document !== 'undefined' ? document.getElementById('portal-fixed') : null;
  const content = (
    <div className="mp-bar">
      {/* Left label */}
      <div className="mp-label">
        <span className="mp-live-dot" />
        LIVE MARKET
      </div>

      {/* Scrolling ticker */}
      <div className="mp-ticker-wrap">
        <div className="mp-ticker-track" ref={trackRef}>
          {[...TICKERS, ...TICKERS].map((t, i) => (
            <span key={i} className="mp-ticker-item">
              <span className="mp-ticker-sector">{t.label}</span>
              <span className={`mp-ticker-change ${t.up ? 'mp-up' : 'mp-down'}`}>
                {t.up ? '▲' : '▼'} {t.change}
              </span>
              <span className="mp-ticker-sep">|</span>
            </span>
          ))}
        </div>
      </div>

      {/* Rotating insight */}
      <div className={`mp-insight${insightVisible ? ' mp-insight--in' : ' mp-insight--out'}`}>
        {INSIGHTS[insightIdx]}
      </div>
    </div>
  );
  return portalEl ? createPortal(content, portalEl) : content;
}
