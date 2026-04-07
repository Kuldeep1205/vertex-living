import React, { useState, useRef, useEffect, useMemo } from 'react';
import './PriceTimeline.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const PROPERTIES = [
  {
    id: 1, name: 'DLF The Camellias', sector: 'Sector 42',
    data: [7.2, 7.4, 7.1, 7.6, 7.9, 8.0, 7.8, 8.2, 8.5, 8.3, 8.1, 8.5],
    unit: 'Cr',
  },
  {
    id: 2, name: 'M3M Golf Estate', sector: 'Sector 65',
    data: [3.8, 3.9, 4.1, 4.0, 3.8, 3.6, 3.5, 3.7, 4.0, 4.2, 4.1, 4.2],
    unit: 'Cr',
  },
  {
    id: 3, name: 'Signature Global 37D', sector: 'Sector 37D',
    data: [0.42, 0.44, 0.47, 0.46, 0.44, 0.43, 0.41, 0.40, 0.42, 0.45, 0.44, 0.48],
    unit: 'Cr',
  },
  {
    id: 4, name: 'Vatika Seven Lamps', sector: 'Sector 49',
    data: [1.65, 1.70, 1.68, 1.75, 1.80, 1.78, 1.72, 1.69, 1.74, 1.80, 1.75, 1.80],
    unit: 'Cr',
  },
  {
    id: 5, name: 'Godrej Infinity', sector: 'Sector 82',
    data: [1.15, 1.12, 1.10, 1.08, 1.06, 1.05, 1.08, 1.12, 1.18, 1.25, 1.30, 1.35],
    unit: 'Cr',
  },
];

function getTrend(data) {
  const last3 = data.slice(-3);
  const prev3 = data.slice(-6, -3);
  const lastAvg = last3.reduce((a, b) => a + b, 0) / 3;
  const prevAvg = prev3.reduce((a, b) => a + b, 0) / 3;
  const change = ((lastAvg - prevAvg) / prevAvg) * 100;
  const totalChange = ((data[data.length - 1] - data[0]) / data[0]) * 100;
  const recentDrop = data[data.length - 1] < data[data.length - 2] && data[data.length - 2] < data[data.length - 3];
  const recentRise = data[data.length - 1] > data[data.length - 2] && data[data.length - 2] > data[data.length - 3];
  return { change, totalChange, recentDrop, recentRise };
}

function buildSvgPath(data, w, h, pad = { t: 20, b: 30, l: 10, r: 10 }) {
  const min = Math.min(...data) * 0.98;
  const max = Math.max(...data) * 1.02;
  const pts = data.map((v, i) => {
    const x = pad.l + (i / (data.length - 1)) * (w - pad.l - pad.r);
    const y = pad.t + (1 - (v - min) / (max - min)) * (h - pad.t - pad.b);
    return [x, y];
  });

  // Smooth cubic bezier
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cpx = (x0 + x1) / 2;
    d += ` C ${cpx} ${y0}, ${cpx} ${y1}, ${x1} ${y1}`;
  }

  // Area (close path to bottom)
  const areaD = d + ` L ${pts[pts.length - 1][0]} ${h - pad.b} L ${pts[0][0]} ${h - pad.b} Z`;
  return { linePath: d, areaPath: areaD, points: pts, min, max };
}

function Tooltip({ x, y, month, value, unit, visible }) {
  if (!visible) return null;
  return (
    <g className="pt-tooltip-g">
      <rect x={x - 38} y={y - 42} width={76} height={34} rx={8} className="pt-tooltip-bg" />
      <text x={x} y={y - 26} textAnchor="middle" className="pt-tooltip-month">{month}</text>
      <text x={x} y={y - 14} textAnchor="middle" className="pt-tooltip-val">₹{value} {unit}</text>
      <line x1={x} y1={y - 8} x2={x} y2={y} className="pt-tooltip-line" />
      <circle cx={x} cy={y} r={5} className="pt-tooltip-dot" />
    </g>
  );
}

export default function PriceTimeline() {
  const [selected, setSelected] = useState(0);
  const [hoverIdx, setHoverIdx] = useState(null);
  const [animated, setAnimated] = useState(false);
  const svgRef = useRef(null);
  const [svgW, setSvgW] = useState(600);
  const svgH = 200;

  const prop = PROPERTIES[selected];
  const trend = useMemo(() => getTrend(prop.data), [prop]);
  const year = new Date().getFullYear() - 1;
  const labels = MONTHS.map((m, i) => `${m} ${i > new Date().getMonth() ? year : year + 1}`);

  useEffect(() => {
    setAnimated(false);
    const t = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(t);
  }, [selected]);

  useEffect(() => {
    if (!svgRef.current) return;
    const ro = new ResizeObserver(entries => {
      setSvgW(entries[0].contentRect.width || 600);
    });
    ro.observe(svgRef.current);
    return () => ro.disconnect();
  }, []);

  const pad = { t: 24, b: 36, l: 8, r: 8 };
  const { linePath, areaPath, points, min, max } = useMemo(
    () => buildSvgPath(prop.data, svgW, svgH, pad),
    [prop.data, svgW]
  );

  const isUp = prop.data[prop.data.length - 1] >= prop.data[0];
  const lineColor = isUp ? '#22c55e' : '#ef4444';
  const areaColor = isUp ? 'url(#pt-grad-up)' : 'url(#pt-grad-down)';

  const pctChange = ((prop.data[prop.data.length - 1] - prop.data[0]) / prop.data[0] * 100).toFixed(1);

  return (
    <section className="pt-section">
      <div className="container">
        <div className="pt-header">
          <div>
            <span className="section-badge">📈 Market Insights</span>
            <h2 className="pt-title">Visual Price Timeline</h2>
            <p className="pt-sub">12-month price movement across top Gurgaon properties</p>
          </div>

          {/* Trend badge */}
          <div className={`pt-trend-badge ${trend.recentDrop ? 'pt-trend-down' : trend.recentRise ? 'pt-trend-up' : 'pt-trend-stable'}`}>
            {trend.recentDrop
              ? <><span>📉</span> Price dropped recently</>
              : trend.recentRise
              ? <><span>📈</span> Price rising steadily</>
              : <><span>➡️</span> Price holding steady</>
            }
          </div>
        </div>

        {/* Property selector */}
        <div className="pt-selector">
          {PROPERTIES.map((p, i) => {
            const t = getTrend(p.data);
            return (
              <button
                key={p.id}
                className={`pt-sel-btn${selected === i ? ' pt-sel-btn--active' : ''}`}
                onClick={() => setSelected(i)}
              >
                <span className="pt-sel-name">{p.name}</span>
                <span className={`pt-sel-change ${t.totalChange >= 0 ? 'up' : 'down'}`}>
                  {t.totalChange >= 0 ? '▲' : '▼'} {Math.abs(t.totalChange).toFixed(1)}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Chart */}
        <div className="pt-chart-wrap">
          {/* Y-axis labels */}
          <div className="pt-y-axis">
            {[0, 0.25, 0.5, 0.75, 1].map(f => {
              const val = (min + f * (max - min)).toFixed(2);
              return <span key={f}>₹{val}Cr</span>;
            }).reverse()}
          </div>

          <div className="pt-svg-wrap" ref={svgRef}>
            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              preserveAspectRatio="none"
              className="pt-svg"
              onMouseLeave={() => setHoverIdx(null)}
            >
              <defs>
                <linearGradient id="pt-grad-up" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="pt-grad-down" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
                </linearGradient>
                <filter id="pt-glow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {/* Grid lines */}
              {[0.25, 0.5, 0.75].map(f => {
                const y = pad.t + f * (svgH - pad.t - pad.b);
                return <line key={f} x1={pad.l} y1={y} x2={svgW - pad.r} y2={y} className="pt-grid-line" />;
              })}

              {/* Area fill */}
              <path d={areaPath} fill={areaColor} className={`pt-area${animated ? ' pt-animated' : ''}`} />

              {/* Line */}
              <path
                d={linePath}
                fill="none"
                stroke={lineColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                className={`pt-line${animated ? ' pt-animated' : ''}`}
                filter="url(#pt-glow)"
              />

              {/* Invisible hit areas + dots */}
              {points.map(([x, y], i) => (
                <g key={i}>
                  <rect
                    x={x - (svgW / prop.data.length) / 2}
                    y={pad.t}
                    width={svgW / prop.data.length}
                    height={svgH - pad.t - pad.b}
                    fill="transparent"
                    onMouseEnter={() => setHoverIdx(i)}
                    style={{ cursor: 'crosshair' }}
                  />
                  {hoverIdx === i && (
                    <circle cx={x} cy={y} r={5} fill={lineColor} stroke="#fff" strokeWidth="2" />
                  )}
                </g>
              ))}

              {/* Tooltip */}
              {hoverIdx !== null && (
                <Tooltip
                  x={points[hoverIdx][0]}
                  y={points[hoverIdx][1]}
                  month={labels[hoverIdx]}
                  value={prop.data[hoverIdx]}
                  unit={prop.unit}
                  visible
                />
              )}

              {/* X-axis month labels */}
              {points.map(([x], i) => (
                (i % 2 === 0) && (
                  <text key={i} x={x} y={svgH - 6} textAnchor="middle" className="pt-x-label">
                    {MONTHS[i]}
                  </text>
                )
              ))}
            </svg>
          </div>
        </div>

        {/* Stats row */}
        <div className="pt-stats">
          <div className="pt-stat">
            <span className="pt-stat-label">Current Price</span>
            <span className="pt-stat-val">₹{prop.data[prop.data.length - 1]} Cr</span>
          </div>
          <div className="pt-stat">
            <span className="pt-stat-label">1 Year Ago</span>
            <span className="pt-stat-val">₹{prop.data[0]} Cr</span>
          </div>
          <div className="pt-stat">
            <span className="pt-stat-label">Change (12M)</span>
            <span className={`pt-stat-val ${parseFloat(pctChange) >= 0 ? 'pt-up' : 'pt-down'}`}>
              {parseFloat(pctChange) >= 0 ? '+' : ''}{pctChange}%
            </span>
          </div>
          <div className="pt-stat">
            <span className="pt-stat-label">Peak Price</span>
            <span className="pt-stat-val">₹{Math.max(...prop.data)} Cr</span>
          </div>
          <div className="pt-stat">
            <span className="pt-stat-label">Lowest Price</span>
            <span className="pt-stat-val">₹{Math.min(...prop.data)} Cr</span>
          </div>
          <div className="pt-stat">
            <span className="pt-stat-label">Best Time to Buy</span>
            <span className="pt-stat-val">{trend.recentDrop ? '🟢 Now' : '⏳ Wait'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
