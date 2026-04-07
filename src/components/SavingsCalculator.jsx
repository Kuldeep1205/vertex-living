import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SavingsCalculator.css';

const BROKERAGE_RATES = [
  { label: '1%',   value: 1   },
  { label: '1.5%', value: 1.5 },
  { label: '2%',   value: 2   },
];

function formatCurrency(amount) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
  if (amount >= 100000)   return `₹${(amount / 100000).toFixed(1)} Lakhs`;
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export default function SavingsCalculator() {
  const [priceLakh, setPriceLakh]     = useState(150);  // in Lakhs
  const [brokerRate, setBrokerRate]   = useState(1.5);

  const priceRs      = priceLakh * 100000;
  const brokerFee    = (priceRs * brokerRate) / 100;
  const gstOnBroker  = brokerFee * 0.18;           // 18% GST on brokerage
  const totalSaving  = brokerFee + gstOnBroker;

  const formattedPrice   = formatCurrency(priceRs);
  const formattedBroker  = formatCurrency(brokerFee);
  const formattedGst     = formatCurrency(gstOnBroker);
  const formattedTotal   = formatCurrency(totalSaving);

  return (
    <div className="sc-wrap">
      {/* Left — Inputs */}
      <div className="sc-inputs">
        <div className="sc-input-group">
          <div className="sc-input-label">
            <span>Property Price</span>
            <strong className="sc-price-display">{formattedPrice}</strong>
          </div>
          <input
            type="range"
            className="sc-slider"
            min={20}
            max={2000}
            step={10}
            value={priceLakh}
            onChange={e => setPriceLakh(Number(e.target.value))}
          />
          <div className="sc-slider-marks">
            <span>₹20 Lakh</span>
            <span>₹20 Cr</span>
          </div>
        </div>

        <div className="sc-input-group">
          <div className="sc-input-label">
            <span>Typical Broker Rate</span>
          </div>
          <div className="sc-rate-pills">
            {BROKERAGE_RATES.map(r => (
              <button
                key={r.value}
                className={`sc-rate-pill${brokerRate === r.value ? ' active' : ''}`}
                onClick={() => setBrokerRate(r.value)}
              >
                {r.label}
              </button>
            ))}
          </div>
          <p className="sc-rate-note">
            Brokers in Gurgaon typically charge 1–2% of the property price from the buyer.
          </p>
        </div>

        <div className="sc-what-you-pay">
          <div className="sc-wyp-label">What you pay on Vertex Direct</div>
          <div className="sc-wyp-value">₹0 Brokerage</div>
          <div className="sc-wyp-sub">Builders pay a flat listing fee. You pay nothing.</div>
        </div>
      </div>

      {/* Right — Savings Display */}
      <div className="sc-result">
        <div className="sc-result-label">You Save</div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${priceLakh}-${brokerRate}`}
            className="sc-result-amount"
            initial={{ opacity: 0, scale: 0.82, y: 10 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.9,  y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {formattedTotal}
          </motion.div>
        </AnimatePresence>

        <div className="sc-breakdown">
          <div className="sc-breakdown-row">
            <span>Broker commission ({brokerRate}%)</span>
            <span>{formattedBroker}</span>
          </div>
          <div className="sc-breakdown-row">
            <span>GST on brokerage (18%)</span>
            <span>{formattedGst}</span>
          </div>
          <div className="sc-breakdown-row sc-breakdown-total">
            <span>Total Saving</span>
            <span>{formattedTotal}</span>
          </div>
        </div>

        <div className="sc-disclaimer">
          * Calculation based on buyer-side brokerage only. Actual savings may vary.
        </div>

        <a href="#featured-section" className="sc-cta">
          Start Searching Builder-Direct →
        </a>
      </div>
    </div>
  );
}
