import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CompareBar.css';

export default function CompareBar({ list, onRemove, onClear }) {
  const navigate = useNavigate();
  if (list.length === 0) return null;

  return (
    <div className="cmp-bar">
      <div className="cmp-bar-slots">
        {[0, 1, 2].map(i => (
          <div key={i} className={`cmp-slot${list[i] ? ' filled' : ''}`}>
            {list[i] ? (
              <>
                <div className="cmp-slot-name">{list[i].name}</div>
                <div className="cmp-slot-price">{list[i].priceDisplay}</div>
                <button className="cmp-slot-remove" onClick={() => onRemove(list[i].id)}>✕</button>
              </>
            ) : (
              <span className="cmp-slot-empty">+ Add Property</span>
            )}
          </div>
        ))}
      </div>
      <div className="cmp-bar-actions">
        <span className="cmp-bar-count">{list.length}/3 selected</span>
        <button
          className="cmp-bar-btn"
          disabled={list.length < 2}
          onClick={() => navigate('/compare', { state: { ids: list.map(p => p.id) } })}
        >
          Compare Now →
        </button>
        <button className="cmp-bar-clear" onClick={onClear}>Clear All</button>
      </div>
    </div>
  );
}
