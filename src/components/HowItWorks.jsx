import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './HowItWorks.css';

const BUYER_STEPS = [
  {
    num: '01',
    icon: '🔍',
    title: 'Browse Builder-Direct Listings',
    desc: 'Search 2,500+ verified projects listed directly by developers. Filter by location, budget, type — zero broker involvement.',
  },
  {
    num: '02',
    icon: '📞',
    title: 'Contact the Builder Directly',
    desc: 'One tap connects you to the builder\'s official sales team. No agent relay, no info withheld, no commission pressure.',
  },
  {
    num: '03',
    icon: '🏠',
    title: 'Visit, Verify & Buy',
    desc: 'Schedule a site visit, review RERA documents, negotiate directly, and close at the builder\'s declared price. Save lakhs.',
  },
];

const BUILDER_STEPS = [
  {
    num: '01',
    icon: '📝',
    title: 'Register Your Project',
    desc: 'Submit your RERA number, project details, floor plans, and pricing. We verify against the RERA portal within 48 hours.',
  },
  {
    num: '02',
    icon: '💳',
    title: 'Pay One Flat Listing Fee',
    desc: 'No percentage cut. No per-lead charges. One transparent fee per project — that\'s it. You keep 100% of your margin.',
  },
  {
    num: '03',
    icon: '📊',
    title: 'Receive Qualified Leads',
    desc: 'Serious buyers contact you directly from your listing page. Manage enquiries, call logs, and site visits from your dashboard.',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.55, delay: i * 0.13, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function HowItWorks() {
  const [tab, setTab] = useState('buyer');
  const steps = tab === 'buyer' ? BUYER_STEPS : BUILDER_STEPS;

  return (
    <div className="hiw-wrap">
      {/* Tab Toggle */}
      <div className="hiw-tabs">
        <button
          className={`hiw-tab${tab === 'buyer' ? ' active' : ''}`}
          onClick={() => setTab('buyer')}
        >
          🏡 For Buyers
        </button>
        <button
          className={`hiw-tab${tab === 'builder' ? ' active' : ''}`}
          onClick={() => setTab('builder')}
        >
          🏗 For Builders
        </button>
      </div>

      {/* Steps */}
      <div className="hiw-steps">
        {steps.map((step, i) => (
          <motion.div
            key={`${tab}-${i}`}
            className="hiw-step"
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            variants={cardVariants}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
          >
            <div className="hiw-step-num">{step.num}</div>
            <div className="hiw-step-icon">{step.icon}</div>
            <h3 className="hiw-step-title">{step.title}</h3>
            <p className="hiw-step-desc">{step.desc}</p>

            {/* Connector line (not on last card) */}
            {i < steps.length - 1 && (
              <div className="hiw-connector" aria-hidden="true">
                <svg width="40" height="16" viewBox="0 0 40 16" fill="none">
                  <path d="M0 8 H36 M30 2 L38 8 L30 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Bottom CTA */}
      <motion.div
        className="hiw-bottom"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {tab === 'buyer' ? (
          <>
            <span className="hiw-bottom-text">Ready to buy without a broker?</span>
            <a href="#featured-section" className="hiw-bottom-btn">
              Browse Builder-Direct Homes →
            </a>
          </>
        ) : (
          <>
            <span className="hiw-bottom-text">Ready to reach buyers directly?</span>
            <a href="#builder-cta" className="hiw-bottom-btn">
              Register Your Project →
            </a>
          </>
        )}
      </motion.div>
    </div>
  );
}
