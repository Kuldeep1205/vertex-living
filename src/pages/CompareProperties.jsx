import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPropertyDetail, PROPERTY_DATABASE } from '../data/properties';
import './CompareProperties.css';

function calcEMI(price) {
  const p = price * 1e7 * 0.8;
  const r = 8.5 / 12 / 100;
  const n = 240;
  return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}
function fmtEMI(v) {
  if (v >= 1e5) return '₹' + (v / 1e5).toFixed(1) + 'L/mo';
  return '₹' + Math.round(v / 1000) + 'K/mo';
}

const ROWS = [
  { key: 'price',      label: 'Price',           icon: '💰', best: 'min', fmt: p => p.priceDisplay },
  { key: 'psf',        label: 'Price / sq.ft',   icon: '📐', best: 'min', fmt: p => '₹' + Math.round((p.price * 1e7) / parseInt(p.area)).toLocaleString('en-IN') },
  { key: 'area',       label: 'Area',             icon: '🏠', best: 'max', fmt: p => p.area },
  { key: 'bedrooms',   label: 'BHK',              icon: '🛏', best: 'max', fmt: p => p.bedrooms > 0 ? p.bedrooms + ' BHK' : 'Commercial' },
  { key: 'type',       label: 'Property Type',    icon: '🏗️', best: null,  fmt: p => p.type },
  { key: 'location',   label: 'Location',         icon: '📍', best: null,  fmt: p => p.sector },
  { key: 'status',     label: 'Possession',       icon: '🔑', best: null,  fmt: p => p.status },
  { key: 'emi',        label: 'EMI (80% loan)',   icon: '🧮', best: 'min', fmt: p => fmtEMI(calcEMI(p.price)) },
  { key: 'score',      label: 'Investment Score', icon: '🧠', best: 'max', fmt: p => {
    const s = Math.min(99, Math.round(55 + p.price * 3 + (p.status === 'Ready to Move' ? 10 : 5)));
    return s + '/100';
  }},
];

const AMENITY_LIST = ['Swimming Pool','Gymnasium','Clubhouse','Kids Play Area','24/7 Security','Power Backup','Jogging Track','Landscaped Gardens'];

function getNumeric(row, p) {
  if (row.key === 'price')    return p.price;
  if (row.key === 'psf')      return Math.round((p.price * 1e7) / parseInt(p.area));
  if (row.key === 'area')     return parseInt(p.area);
  if (row.key === 'bedrooms') return p.bedrooms;
  if (row.key === 'emi')      return calcEMI(p.price);
  if (row.key === 'score')    return Math.min(99, Math.round(55 + p.price * 3 + (p.status === 'Ready to Move' ? 10 : 5)));
  return null;
}

const IMAGES = [
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=340&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=340&fit=crop&q=80',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=340&fit=crop&q=80',
];

export default function CompareProperties() {
  const { state } = useLocation();
  const navigate  = useNavigate();

  const initialIds = state?.ids || [];
  const [selected, setSelected] = useState(
    initialIds.map(id => getPropertyDetail(id)).filter(Boolean).slice(0, 3)
  );
  const [search, setSearch] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const suggestions = PROPERTY_DATABASE.filter(p =>
    !selected.find(s => s.id === p.id) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) ||
     p.sector.toLowerCase().includes(search.toLowerCase()) ||
     p.type.toLowerCase().includes(search.toLowerCase()))
  ).slice(0, 8);

  const addProp = (p) => {
    if (selected.length >= 3) return;
    setSelected(prev => [...prev, getPropertyDetail(p.id)]);
    setSearch(''); setShowPicker(false);
  };
  const removeProp = (id) => setSelected(prev => prev.filter(p => p.id !== id));

  // Best value highlighting
  const getBest = (row) => {
    if (!row.best || selected.length < 2) return null;
    const nums = selected.map(p => getNumeric(row, p));
    if (nums.some(n => n === null)) return null;
    return row.best === 'min' ? Math.min(...nums) : Math.max(...nums);
  };

  return (
    <div className="cp-root">
      {/* Top Bar */}
      <div className="cp-topbar">
        <button className="cp-back" onClick={() => navigate(-1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M19 12H5m0 0 7 7m-7-7 7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </button>
        <div className="cp-topbar-title">
          <h1>Compare Properties</h1>
          <span>{selected.length} selected</span>
        </div>
      </div>

      <div className="cp-page">

        {/* Property selector cards */}
        <div className="cp-selector-row">
          {selected.map((p, i) => (
            <div key={p.id} className="cp-sel-card">
              <img src={IMAGES[i % IMAGES.length]} alt={p.name} className="cp-sel-img" />
              <button className="cp-sel-remove" onClick={() => removeProp(p.id)}>✕</button>
              <div className="cp-sel-info">
                <div className="cp-sel-name">{p.name}</div>
                <div className="cp-sel-price">{p.priceDisplay}</div>
                <div className="cp-sel-loc">📍 {p.sector}</div>
              </div>
              <button className="cp-view-btn" onClick={() => navigate(`/property/${p.id}`)}>View Details</button>
            </div>
          ))}

          {selected.length < 3 && (
            <div className="cp-add-slot" onClick={() => setShowPicker(true)}>
              <div className="cp-add-icon">+</div>
              <div className="cp-add-label">Add Property</div>
              <div className="cp-add-sub">Compare up to 3</div>
            </div>
          )}

          {/* Search picker */}
          {showPicker && (
            <div className="cp-picker-overlay" onClick={() => setShowPicker(false)}>
              <div className="cp-picker" onClick={e => e.stopPropagation()}>
                <div className="cp-picker-header">
                  <h3>Select a Property</h3>
                  <button onClick={() => setShowPicker(false)}>✕</button>
                </div>
                <input
                  autoFocus
                  className="cp-picker-input"
                  placeholder="Search by name, sector, type…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <div className="cp-picker-list">
                  {suggestions.map(p => (
                    <button key={p.id} className="cp-picker-item" onClick={() => addProp(p)}>
                      <div className="cp-pi-name">{p.name}</div>
                      <div className="cp-pi-meta">{p.sector} · {p.priceDisplay} · {p.type}</div>
                    </button>
                  ))}
                  {suggestions.length === 0 && <div className="cp-picker-empty">No results</div>}
                </div>
              </div>
            </div>
          )}
        </div>

        {selected.length < 2 ? (
          <div className="cp-empty-state">
            <div className="cp-empty-icon">⚖️</div>
            <h2>Select at least 2 properties to compare</h2>
            <p>Use the "+ Add Property" button above</p>
          </div>
        ) : (
          <>
            {/* ── Comparison Table ── */}
            <div className="cp-table-wrap">
              <table className="cp-table">
                <thead>
                  <tr>
                    <th className="cp-th-label">Feature</th>
                    {selected.map((p, i) => (
                      <th key={p.id} className="cp-th-prop">
                        <div className="cp-th-name">{p.name}</div>
                        <div className="cp-th-price">{p.priceDisplay}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row, ri) => {
                    const best = getBest(row);
                    return (
                      <tr key={row.key} className={ri % 2 === 0 ? 'cp-tr-even' : ''}>
                        <td className="cp-td-label">
                          <span className="cp-row-icon">{row.icon}</span>
                          {row.label}
                        </td>
                        {selected.map(p => {
                          const num  = getNumeric(row, p);
                          const isBest = best !== null && num === best;
                          return (
                            <td key={p.id} className={`cp-td-val${isBest ? ' best' : ''}`}>
                              {isBest && <span className="cp-best-tag">✓ Best</span>}
                              {row.fmt(p)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}

                  {/* Amenities rows */}
                  <tr className="cp-tr-section-head">
                    <td colSpan={selected.length + 1}>🏊 Amenities</td>
                  </tr>
                  {AMENITY_LIST.map((a, ai) => (
                    <tr key={a} className={ai % 2 === 0 ? 'cp-tr-even' : ''}>
                      <td className="cp-td-label">
                        <span className="cp-row-icon">•</span>{a}
                      </td>
                      {selected.map(p => (
                        <td key={p.id} className="cp-td-val cp-td-amenity">
                          {(p.amenities || []).some(am => am.toLowerCase().includes(a.toLowerCase().split(' ')[0]))
                            ? <span className="cp-check">✓</span>
                            : <span className="cp-cross">✗</span>
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Winner Banner */}
            {selected.length >= 2 && (() => {
              const scores = selected.map(p => ({
                p,
                score: Math.min(99, Math.round(55 + p.price * 3 + (p.status === 'Ready to Move' ? 10 : 5)))
              }));
              const winner = scores.reduce((a, b) => a.score >= b.score ? a : b);
              return (
                <div className="cp-winner-banner">
                  <div className="cp-winner-trophy">🏆</div>
                  <div className="cp-winner-info">
                    <div className="cp-winner-label">AI Recommendation</div>
                    <div className="cp-winner-name">{winner.p.name}</div>
                    <div className="cp-winner-reason">
                      Best investment score ({winner.score}/100) · {winner.p.priceDisplay} · {winner.p.sector}
                    </div>
                  </div>
                  <button className="cp-winner-btn" onClick={() => navigate(`/property/${winner.p.id}`)}>
                    View Details →
                  </button>
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}
