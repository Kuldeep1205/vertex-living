import React, { useState, useEffect, useRef } from 'react';
import './LiveActivity.css';

const NAMES = [
  'Rahul S.','Priya M.','Amit K.','Sneha R.','Vikram T.','Neha G.',
  'Arjun P.','Kavya D.','Rohit B.','Simran J.','Karan L.','Aarti V.',
  'Dev S.','Pooja N.','Ankit W.','Meera C.','Aditya F.','Riya H.',
];
const CITIES = ['Delhi','Noida','Faridabad','Gurgaon','Mumbai','Bangalore','Hyderabad','Pune'];
const PROPERTIES = [
  'DLF The Camellias','M3M Golf Estate','Vatika Seven Lamps',
  'Signature Global 37D','Tata Primanti','Emaar Palm Gardens',
  'Godrej Infinity','DLF Aralias','BPTP Park Generations',
  'Hero Homes','Central Park 2','ROF Ananda',
];
const ACTIONS = [
  { verb: 'is viewing',   icon: '👁️', color: '#6366f1' },
  { verb: 'just saved',   icon: '❤️', color: '#ef4444' },
  { verb: 'requested info on', icon: '📞', color: '#22c55e' },
  { verb: 'compared',     icon: '⚖️', color: '#f59e0b' },
  { verb: 'scheduled a visit to', icon: '📅', color: '#0ea5e9' },
];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function generate() {
  const action = rand(ACTIONS);
  return {
    id: Date.now() + Math.random(),
    name: rand(NAMES),
    city: rand(CITIES),
    property: rand(PROPERTIES),
    action,
    ago: randInt(1, 8),
  };
}

export default function LiveActivity() {
  const [items, setItems] = useState(() => [generate(), generate()]);
  const [visible, setVisible] = useState(null);
  const queueRef = useRef([generate(), generate(), generate()]);
  const timerRef = useRef(null);

  const showNext = () => {
    if (queueRef.current.length === 0) {
      queueRef.current = [generate(), generate(), generate()];
    }
    const next = queueRef.current.shift();
    setVisible(next);
    // Pre-generate replacement
    queueRef.current.push(generate());
    // Auto-hide after 4s
    setTimeout(() => setVisible(null), 4200);
  };

  useEffect(() => {
    // First show after 6s
    const t0 = setTimeout(() => {
      showNext();
      // Then every 8-12s
      timerRef.current = setInterval(() => {
        showNext();
      }, randInt(8000, 13000));
    }, 6000);
    return () => { clearTimeout(t0); clearInterval(timerRef.current); };
  }, []);

  if (!visible) return null;

  return (
    <div className="la-toast" key={visible.id}>
      <div className="la-icon" style={{ background: visible.action.color + '22', color: visible.action.color }}>
        {visible.action.icon}
      </div>
      <div className="la-body">
        <div className="la-main">
          <span className="la-name">{visible.name}</span>
          <span className="la-from"> from {visible.city}</span>
          <span className="la-verb"> {visible.action.verb} </span>
          <span className="la-prop">{visible.property}</span>
        </div>
        <div className="la-meta">
          <span className="la-dot" style={{ background: visible.action.color }} />
          {visible.ago}m ago
        </div>
      </div>
    </div>
  );
}
