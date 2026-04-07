import React, { useState, useMemo } from 'react';
import './LifeSimulator.css';

const JOB_LOCATIONS = [
  { id: 'cyber_city',  label: 'Cyber City',      icon: '🏢', commute: { s42: 12, s49: 22, s65: 18, s82: 28, s37: 35 } },
  { id: 'mg_road',     label: 'MG Road',          icon: '🛣️', commute: { s42: 18, s49: 25, s65: 22, s82: 35, s37: 40 } },
  { id: 'udyog_vihar', label: 'Udyog Vihar',      icon: '🏭', commute: { s42: 20, s49: 28, s65: 25, s82: 38, s37: 30 } },
  { id: 'delhi_cp',    label: 'Delhi CP',         icon: '🏛️', commute: { s42: 45, s49: 55, s65: 50, s82: 65, s37: 60 } },
  { id: 'noida',       label: 'Noida Sec 62',     icon: '💼', commute: { s42: 70, s49: 80, s65: 75, s82: 85, s37: 90 } },
  { id: 'aerocity',    label: 'Aerocity / IGI',   icon: '✈️', commute: { s42: 35, s49: 40, s65: 38, s82: 30, s37: 25 } },
];

const FAMILY_SIZES = [
  { id: 'single',   label: 'Single',      icon: '🧑', members: 1, foodMult: 1,   schoolMult: 0 },
  { id: 'couple',   label: 'Couple',      icon: '👫', members: 2, foodMult: 1.7, schoolMult: 0 },
  { id: 'family3',  label: 'Family · 3',  icon: '👨‍👩‍👦', members: 3, foodMult: 2.2, schoolMult: 1 },
  { id: 'family4',  label: 'Family · 4',  icon: '👨‍👩‍👧‍👦', members: 4, foodMult: 2.8, schoolMult: 2 },
  { id: 'family5p', label: 'Family · 5+', icon: '👨‍👩‍👧‍👦👶', members: 5, foodMult: 3.5, schoolMult: 2 },
];

const BUDGETS = [
  { id: 'b50',  label: '₹50 Lac',   price: 50,   sector: 's37',  zone: 'Dwarka Expressway' },
  { id: 'b1',   label: '₹1 Cr',     price: 100,  sector: 's82',  zone: 'New Gurgaon' },
  { id: 'b2',   label: '₹2 Cr',     price: 200,  sector: 's49',  zone: 'Sohna Road' },
  { id: 'b5',   label: '₹5 Cr',     price: 500,  sector: 's65',  zone: 'Golf Course Road' },
  { id: 'b10',  label: '₹10 Cr+',   price: 1000, sector: 's42',  zone: 'DLF Phase 5' },
];

function calcEMI(priceL, downPct = 0.2, rateAnnual = 8.5, years = 20) {
  const principal = priceL * 100000 * (1 - downPct);
  const r = rateAnnual / 12 / 100;
  const n = years * 12;
  return Math.round(principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
}

function fmt(n) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

function lifestyleScore(commute, budget, family) {
  let score = 100;
  // Commute penalty
  if (commute > 60) score -= 30;
  else if (commute > 40) score -= 18;
  else if (commute > 20) score -= 8;
  // Budget bonus
  if (budget.price >= 500) score += 15;
  else if (budget.price >= 200) score += 8;
  else if (budget.price >= 100) score += 3;
  else score -= 5;
  // Family size — higher budget per person = better
  const budgetPerPerson = budget.price / family.members;
  if (budgetPerPerson >= 200) score += 10;
  else if (budgetPerPerson < 50) score -= 10;
  return Math.min(100, Math.max(10, score));
}

function scoreLabel(s) {
  if (s >= 85) return { label: 'Premium Lifestyle 🌟', color: '#d4a853' };
  if (s >= 70) return { label: 'Comfortable Life 😊', color: '#22c55e' };
  if (s >= 50) return { label: 'Balanced Living 👍', color: '#0ea5e9' };
  return       { label: 'Budget Stretch ⚠️',   color: '#f97316' };
}

export default function LifeSimulator() {
  const [job,    setJob]    = useState(null);
  const [family, setFamily] = useState(null);
  const [budget, setBudget] = useState(null);
  const [simulated, setSimulated] = useState(false);
  const [animating, setAnimating] = useState(false);

  const canSim = job && family && budget;

  const result = useMemo(() => {
    if (!canSim) return null;
    const commute = JOB_LOCATIONS.find(j => j.id === job.id).commute[budget.sector];
    const emi = calcEMI(budget.price);
    const food = Math.round(8000 * family.foodMult);
    const school = family.schoolMult * 12000;
    const transport = Math.round(3000 + commute * 60);
    const utilities = Math.round(2500 + 800 * family.members);
    const misc = Math.round(5000 + 2000 * family.members);
    const total = emi + food + school + transport + utilities + misc;
    const score = lifestyleScore(commute, budget, family);
    const sl = scoreLabel(score);
    return { commute, emi, food, school, transport, utilities, misc, total, score, ...sl };
  }, [job, family, budget, canSim]);

  const simulate = () => {
    if (!canSim) return;
    setAnimating(true);
    setTimeout(() => { setSimulated(true); setAnimating(false); }, 600);
  };

  const reset = () => { setSimulated(false); setJob(null); setFamily(null); setBudget(null); };

  return (
    <section className="ls-section">
      <div className="container">
        <div className="ls-header">
          <span className="section-badge">🔮 Life Simulator</span>
          <h2 className="ls-title">Future Life Simulator</h2>
          <p className="ls-sub">Choose your scenario — see what your life looks like before you buy</p>
        </div>

        <div className={`ls-layout${simulated ? ' ls-layout--result' : ''}`}>
          {/* Inputs */}
          <div className="ls-inputs">
            {/* Job Location */}
            <div className="ls-group">
              <div className="ls-group-label">🏢 Where do you work?</div>
              <div className="ls-chips">
                {JOB_LOCATIONS.map(j => (
                  <button
                    key={j.id}
                    className={`ls-chip${job?.id === j.id ? ' ls-chip--active' : ''}`}
                    onClick={() => { setJob(j); setSimulated(false); }}
                  >
                    {j.icon} {j.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Family Size */}
            <div className="ls-group">
              <div className="ls-group-label">👨‍👩‍👧 Family size?</div>
              <div className="ls-chips">
                {FAMILY_SIZES.map(f => (
                  <button
                    key={f.id}
                    className={`ls-chip${family?.id === f.id ? ' ls-chip--active' : ''}`}
                    onClick={() => { setFamily(f); setSimulated(false); }}
                  >
                    {f.icon} {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="ls-group">
              <div className="ls-group-label">💰 Property budget?</div>
              <div className="ls-chips">
                {BUDGETS.map(b => (
                  <button
                    key={b.id}
                    className={`ls-chip ls-chip--budget${budget?.id === b.id ? ' ls-chip--active' : ''}`}
                    onClick={() => { setBudget(b); setSimulated(false); }}
                  >
                    <span className="ls-chip-price">{b.label}</span>
                    <span className="ls-chip-zone">{b.zone}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              className={`ls-sim-btn${!canSim ? ' ls-sim-btn--disabled' : ''}${animating ? ' ls-sim-btn--loading' : ''}`}
              onClick={simulate}
              disabled={!canSim}
            >
              {animating ? '⏳ Calculating...' : canSim ? '🔮 Simulate My Life →' : 'Fill all fields above'}
            </button>
          </div>

          {/* Result Panel */}
          {simulated && result && (
            <div className="ls-result">
              <div className="ls-result-header">
                <div>
                  <div className="ls-result-title">Your Life Snapshot</div>
                  <div className="ls-result-zone">📍 {budget.zone}</div>
                </div>
                <button className="ls-reset" onClick={reset}>↩ Reset</button>
              </div>

              {/* Commute */}
              <div className="ls-card">
                <div className="ls-card-icon">🚗</div>
                <div className="ls-card-body">
                  <div className="ls-card-label">Daily Commute</div>
                  <div className="ls-card-value">{result.commute} min one way</div>
                  <div className="ls-bar-wrap">
                    <div
                      className={`ls-bar ls-bar--commute`}
                      style={{ '--pct': `${Math.min(100, (result.commute / 90) * 100)}%` }}
                    />
                  </div>
                  <div className="ls-card-note">
                    {result.commute <= 20 ? '✅ Great! Short commute' :
                     result.commute <= 40 ? '👍 Manageable' :
                     result.commute <= 60 ? '⚠️ Long commute' : '❌ Very long — consider WFH'}
                  </div>
                </div>
              </div>

              {/* Monthly Expense */}
              <div className="ls-card">
                <div className="ls-card-icon">💰</div>
                <div className="ls-card-body">
                  <div className="ls-card-label">Monthly Expenses</div>
                  <div className="ls-card-value">{fmt(result.total)} / month</div>
                  <div className="ls-expense-grid">
                    {[
                      { label: 'EMI',        val: result.emi,       icon: '🏠' },
                      { label: 'Food',       val: result.food,      icon: '🛒' },
                      { label: 'Transport',  val: result.transport, icon: '🚌' },
                      { label: 'Utilities',  val: result.utilities, icon: '💡' },
                      ...(result.school > 0 ? [{ label: 'School', val: result.school, icon: '🏫' }] : []),
                      { label: 'Misc',       val: result.misc,      icon: '🎯' },
                    ].map(e => (
                      <div key={e.label} className="ls-exp-row">
                        <span className="ls-exp-icon">{e.icon}</span>
                        <span className="ls-exp-label">{e.label}</span>
                        <div className="ls-exp-bar-wrap">
                          <div className="ls-exp-bar" style={{ width: `${(e.val / result.total) * 100}%` }} />
                        </div>
                        <span className="ls-exp-val">{fmt(e.val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lifestyle Score */}
              <div className="ls-card">
                <div className="ls-card-icon">😎</div>
                <div className="ls-card-body">
                  <div className="ls-card-label">Lifestyle Score</div>
                  <div className="ls-score-row">
                    <div
                      className="ls-score-ring"
                      style={{ '--score': result.score, '--color': result.color }}
                    >
                      <svg viewBox="0 0 80 80" className="ls-ring-svg">
                        <circle cx="40" cy="40" r="34" className="ls-ring-bg" />
                        <circle
                          cx="40" cy="40" r="34"
                          className="ls-ring-fill"
                          style={{
                            stroke: result.color,
                            strokeDasharray: `${(result.score / 100) * 213.6} 213.6`,
                          }}
                        />
                      </svg>
                      <span className="ls-score-num" style={{ color: result.color }}>{result.score}</span>
                    </div>
                    <div className="ls-score-info">
                      <div className="ls-score-label" style={{ color: result.color }}>{result.label}</div>
                      <div className="ls-score-breakdown">
                        <span>Commute {result.commute <= 25 ? '✅' : result.commute <= 45 ? '🟡' : '🔴'}</span>
                        <span>Budget {budget.price >= 200 ? '✅' : budget.price >= 100 ? '🟡' : '🔴'}</span>
                        <span>Space {family.members <= 2 ? '✅' : family.members <= 4 ? '🟡' : '🔴'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
