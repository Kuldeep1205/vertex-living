import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './RoomPlanner.css';

const GRID = 50;
const snap = (v) => Math.round(v / GRID) * GRID;

const CATALOG = [
  { type: 'sofa',     label: 'Sofa',         icon: '🛋️', w: 200, h: 90,  fill: '#fde68a', stroke: '#d97706' },
  { type: 'bed-d',    label: 'Double Bed',   icon: '🛏️', w: 150, h: 200, fill: '#ddd6fe', stroke: '#7c3aed' },
  { type: 'bed-s',    label: 'Single Bed',   icon: '🛏️', w: 100, h: 200, fill: '#ede9fe', stroke: '#6d28d9' },
  { type: 'dining',   label: 'Dining Table', icon: '🍽️', w: 200, h: 150, fill: '#bbf7d0', stroke: '#059669' },
  { type: 'chair',    label: 'Chair',        icon: '🪑', w: 70,  h: 70,  fill: '#fed7aa', stroke: '#ea580c' },
  { type: 'wardrobe', label: 'Wardrobe',     icon: '👗', w: 200, h: 60,  fill: '#e2e8f0', stroke: '#475569' },
  { type: 'tv',       label: 'TV Unit',      icon: '📺', w: 250, h: 55,  fill: '#bfdbfe', stroke: '#1d4ed8' },
  { type: 'coffee',   label: 'Coffee Table', icon: '☕', w: 120, h: 80,  fill: '#fef3c7', stroke: '#92400e' },
  { type: 'bathtub',  label: 'Bathtub',      icon: '🛁', w: 170, h: 80,  fill: '#a5f3fc', stroke: '#0e7490' },
  { type: 'desk',     label: 'Study Desk',   icon: '💻', w: 150, h: 75,  fill: '#fce7f3', stroke: '#be185d' },
  { type: 'plant',    label: 'Plant',        icon: '🌿', w: 55,  h: 55,  fill: '#bbf7d0', stroke: '#15803d' },
  { type: 'toilet',   label: 'Toilet',       icon: '🚽', w: 60,  h: 80,  fill: '#f1f5f9', stroke: '#64748b' },
];

const F_HEIGHTS = {
  sofa: 38, 'bed-d': 32, 'bed-s': 32, dining: 30,
  chair: 44, wardrobe: 100, tv: 18, coffee: 22,
  bathtub: 36, desk: 30, plant: 60, toilet: 46,
};

const ROOMS = [
  { label: 'Studio', w: 500, h: 400 },
  { label: '1 BHK',  w: 650, h: 500 },
  { label: '2 BHK',  w: 800, h: 600 },
];

let _uid = 0;

// Auto-place: find first non-overlapping spot
function findSpot(cat, existing, room) {
  for (let y = GRID; y <= room.h - cat.h; y += GRID) {
    for (let x = GRID; x <= room.w - cat.w; x += GRID) {
      const overlaps = existing.some(
        it => x < it.x + it.w && x + cat.w > it.x && y < it.y + it.h && y + cat.h > it.y
      );
      if (!overlaps) return { x, y };
    }
  }
  return { x: snap(room.w / 2 - cat.w / 2), y: snap(room.h / 2 - cat.h / 2) };
}

export default function RoomPlanner({ onClose }) {
  const [roomIdx, setRoomIdx]   = useState(1);
  const [items, setItems]       = useState([]);
  const [view, setView]         = useState('3d');   // '3d' | '2d'
  const [selected, setSelected] = useState(null);
  const [newId, setNewId]       = useState(null);   // just-added id for animation
  const canvasRef  = useRef(null);
  const dragRef    = useRef(null);
  const resizeRef  = useRef(null);
  const roomRef    = useRef(ROOMS[1]);

  useEffect(() => { roomRef.current = ROOMS[roomIdx]; }, [roomIdx]);

  // ── Lock body scroll while modal open ──
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const room = ROOMS[roomIdx];

  const addItem = useCallback((cat) => {
    const id = ++_uid;
    setItems(prev => {
      const pos = findSpot(cat, prev, roomRef.current);
      return [...prev, { id, ...cat, ...pos, rotation: 0 }];
    });
    setSelected(id);
    setNewId(id);
    setTimeout(() => setNewId(null), 900);
    // Auto-switch to 3D preview
    setView('3d');
  }, []);

  const rotateItem = useCallback((id) => {
    setItems(p => p.map(i => i.id === id ? { ...i, w: i.h, h: i.w } : i));
  }, []);

  const removeItem = useCallback((id) => {
    setItems(p => p.filter(i => i.id !== id));
    setSelected(null);
  }, []);

  // ── Pointer drag (2D only) ──
  const onItemPointerDown = useCallback((e, id) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setSelected(id);
    setItems(prev => {
      const item = prev.find(i => i.id === id);
      if (!item) return prev;
      const rect = canvasRef.current.getBoundingClientRect();
      dragRef.current = { id, offX: e.clientX - rect.left - item.x, offY: e.clientY - rect.top - item.y };
      return prev;
    });
  }, []);

  const onItemPointerMove = useCallback((e, id) => {
    if (!dragRef.current || dragRef.current.id !== id) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const r = roomRef.current;
    const nx = snap(e.clientX - rect.left - dragRef.current.offX);
    const ny = snap(e.clientY - rect.top  - dragRef.current.offY);
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      return { ...i, x: Math.max(0, Math.min(r.w - i.w, nx)), y: Math.max(0, Math.min(r.h - i.h, ny)) };
    }));
  }, []);

  const onItemPointerUp = useCallback(() => { dragRef.current = null; }, []);

  const onResizePointerDown = useCallback((e, id) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setItems(prev => {
      const item = prev.find(i => i.id === id);
      if (!item) return prev;
      resizeRef.current = { id, sx: e.clientX, sy: e.clientY, sw: item.w, sh: item.h };
      return prev;
    });
  }, []);

  const onResizePointerMove = useCallback((e, id) => {
    if (!resizeRef.current || resizeRef.current.id !== id) return;
    const { sx, sy, sw, sh } = resizeRef.current;
    const nw = Math.max(GRID, snap(sw + e.clientX - sx));
    const nh = Math.max(GRID, snap(sh + e.clientY - sy));
    setItems(prev => prev.map(i => i.id === id ? { ...i, w: nw, h: nh } : i));
  }, []);

  const onResizePointerUp = useCallback(() => { resizeRef.current = null; }, []);

  const gridSvg = useMemo(() => (
    <svg className="rp-grid-svg" width={room.w} height={room.h}>
      {Array.from({ length: Math.ceil(room.w / GRID) + 1 }, (_, i) => (
        <line key={`v${i}`} x1={i*GRID} y1={0} x2={i*GRID} y2={room.h} />
      ))}
      {Array.from({ length: Math.ceil(room.h / GRID) + 1 }, (_, i) => (
        <line key={`h${i}`} x1={0} y1={i*GRID} x2={room.w} y2={i*GRID} />
      ))}
    </svg>
  ), [room.w, room.h]);

  const selItem = items.find(i => i.id === selected);

  return (
    <div className="rp-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div
        className="rp-modal"
        initial={{ opacity: 0, scale: 0.93, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* ── Header ── */}
        <div className="rp-header">
          <div className="rp-header-left">
            <h3 className="rp-title">🏠 Room Planner</h3>
            <div className="rp-room-tabs">
              {ROOMS.map((r, i) => (
                <button key={i}
                  className={`rp-rtab${roomIdx === i ? ' active' : ''}`}
                  onClick={() => { setRoomIdx(i); setItems([]); setSelected(null); }}
                >
                  {r.label} <span>{(r.w/GRID*0.5).toFixed(0)}×{(r.h/GRID*0.5).toFixed(0)}m</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rp-header-right">
            {/* View toggle */}
            <div className="rp-view-toggle">
              <button className={`rp-vtab${view==='3d' ? ' active' : ''}`} onClick={() => setView('3d')}>✦ 3D View</button>
              <button className={`rp-vtab${view==='2d' ? ' active' : ''}`} onClick={() => setView('2d')}>⊞ Edit 2D</button>
            </div>

            <AnimatePresence>
              {selItem && view === '2d' && (
                <motion.div className="rp-sel-bar"
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <span>{selItem.icon} {selItem.label}</span>
                  <button className="rp-mini-btn" onClick={() => rotateItem(selected)}>↻</button>
                  <button className="rp-mini-btn rp-mini-del" onClick={() => removeItem(selected)}>✕</button>
                </motion.div>
              )}
            </AnimatePresence>

            <button className="rp-ghost-btn" onClick={() => { setItems([]); setSelected(null); }}>Clear</button>
            <button className="rp-icon-btn" onClick={onClose}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="rp-body">

          {/* Sidebar */}
          <aside className="rp-sidebar">
            <p className="rp-sidebar-hd">Add Furniture</p>
            {CATALOG.map(cat => (
              <button key={cat.type} className="rp-tile"
                style={{ '--fs': cat.stroke, '--ff': cat.fill }}
                onClick={() => addItem(cat)}
              >
                <span className="rp-tile-bar" />
                <span className="rp-tile-ico">{cat.icon}</span>
                <span className="rp-tile-lbl">{cat.label}</span>
                <span className="rp-tile-plus">＋</span>
              </button>
            ))}
          </aside>

          {/* Canvas */}
          <div className="rp-canvas-area">
            <div className="rp-canvas-scroll">

              {/* ── 3D VIEW ── */}
              {view === '3d' && (
                <div className="rp-3d-scene">
                  <div className="rp-3d-stage" style={{ width: room.w, height: room.h, '--rw': `${room.w}px`, '--rh': `${room.h}px` }}>
                    {/* Floor */}
                    <div className="rp-3d-floor" />
                    {/* Floor grid */}
                    <svg className="rp-3d-floorgrid" width={room.w} height={room.h}>
                      {Array.from({ length: Math.ceil(room.w/GRID)+1 }, (_,i) => (
                        <line key={`v${i}`} x1={i*GRID} y1={0} x2={i*GRID} y2={room.h} stroke="rgba(100,116,139,0.12)" strokeWidth="1"/>
                      ))}
                      {Array.from({ length: Math.ceil(room.h/GRID)+1 }, (_,i) => (
                        <line key={`h${i}`} x1={0} y1={i*GRID} x2={room.w} y2={i*GRID} stroke="rgba(100,116,139,0.12)" strokeWidth="1"/>
                      ))}
                    </svg>
                    {/* Left wall */}
                    <div className="rp-3d-wall rp-wall-left" style={{ width: room.w }} />
                    {/* Back wall */}
                    <div className="rp-3d-wall rp-wall-back" style={{ height: room.h }} />

                    {/* Furniture 3D boxes */}
                    <AnimatePresence>
                      {items.map(item => {
                        const fh = F_HEIGHTS[item.type] || 30;
                        return (
                          <motion.div
                            key={item.id}
                            className="rp-3d-box"
                            style={{ left: item.x, top: item.y, width: item.w, height: item.h, '--fh': `${fh}px` }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                            onClick={() => setSelected(item.id === selected ? null : item.id)}
                          >
                            {/* Floor face */}
                            <div className="rp-face rp-f-floor" style={{ background: item.fill, borderColor: item.stroke }} />
                            {/* Top face */}
                            <div className="rp-face rp-f-top" style={{ background: item.fill, borderColor: item.stroke }} />
                            {/* Front face */}
                            <div className="rp-face rp-f-front" style={{ background: item.fill, borderColor: item.stroke }} />
                            {/* Right face */}
                            <div className="rp-face rp-f-right" style={{ background: item.fill, borderColor: item.stroke }} />
                            {/* Emoji on top */}
                            <div className="rp-face rp-f-emoji">{item.icon}</div>
                            {/* Label on top */}
                            <div className="rp-face rp-f-label">{item.label}</div>
                            {/* Selected glow */}
                            {item.id === selected && <div className="rp-3d-sel-ring" />}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {/* Empty state */}
                    {items.length === 0 && (
                      <div className="rp-3d-empty">
                        <div>👈 Select furniture from left panel</div>
                        <div className="rp-3d-empty-sub">Items will appear here in 3D automatically</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── 2D EDIT VIEW ── */}
              {view === '2d' && (
                <div className="rp-2d-wrap">
                  <div className="rp-room"
                    ref={canvasRef}
                    style={{ width: room.w, height: room.h }}
                    onPointerDown={() => setSelected(null)}
                  >
                    {gridSvg}
                    <span className="rp-ruler rp-ruler-w">{(room.w/GRID*0.5).toFixed(1)}m</span>
                    <span className="rp-ruler rp-ruler-h">{(room.h/GRID*0.5).toFixed(1)}m</span>

                    {items.map(item => (
                      <div key={item.id}
                        className={`rp-piece${item.id === selected ? ' rp-piece-sel' : ''}`}
                        style={{ left: item.x, top: item.y, width: item.w, height: item.h, background: item.fill, borderColor: item.stroke, '--stk': item.stroke }}
                        onPointerDown={e => onItemPointerDown(e, item.id)}
                        onPointerMove={e => onItemPointerMove(e, item.id)}
                        onPointerUp={onItemPointerUp}
                      >
                        <span className="rp-piece-emoji">{item.icon}</span>
                        <span className="rp-piece-label">{item.label}</span>
                        <span className="rp-piece-dim">{item.w/GRID*0.5}×{item.h/GRID*0.5}m</span>
                        {item.id === selected && (
                          <div className="rp-resize-corner"
                            onPointerDown={e => onResizePointerDown(e, item.id)}
                            onPointerMove={e => onResizePointerMove(e, item.id)}
                            onPointerUp={onResizePointerUp}
                          />
                        )}
                      </div>
                    ))}
                    {items.length === 0 && (
                      <div className="rp-empty-hint">
                        <div className="rp-empty-ico">🛋️</div>
                        <p>Add furniture from the left panel</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="rp-legend">
              {view === '3d' ? (
                <>
                  <span>✦ Click item to select</span>
                  <span>⊞ Switch to Edit 2D to drag & resize</span>
                </>
              ) : (
                <>
                  <span>🖱 Drag to move</span>
                  <span>◢ Corner to resize</span>
                  <span>↻ Rotate selected</span>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
