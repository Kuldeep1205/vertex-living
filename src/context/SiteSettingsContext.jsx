import React, { createContext, useContext, useState, useEffect } from 'react';

const DEFAULT = {
  luxuryThreshold: 7,
  luxuryLabel: 'Luxury',
  budgetLabel: 'Budget',
  companyName: 'Vertex Living',
  tagline: 'Find Your Dream Property in Gurgaon',
  heroSubtitle: 'Trusted by 10,000+ families across Gurgaon & Delhi NCR',
  phone: '+91 98765 43210',
  email: 'info@vertexliving.in',
  whatsapp: '+91 98765 43210',
  address: 'SCO 120, Sector 44, Gurgaon, Haryana 122003',
  officeHours: 'Mon–Sat: 9 AM – 7 PM',
  // Hero section
  heroTitle: 'Builder to Buyer.',
  heroTitleHighlight: 'Zero Brokerage.',
  heroDescription: 'Buy directly from verified builders in Gurgaon & Delhi NCR. No middlemen, no hidden fees. Save ₹3–20 Lakhs on your next home.',
  trustPill1: '✓ 200+ Builders Registered',
  trustPill2: '✓ ₹47 Cr+ Saved by Buyers',
  trustPill3: '✓ RERA Verified Projects',
  // Stats
  stat1Num: '200+',    stat1Label: 'Builders Registered', stat1Icon: '🏗',
  stat2Num: '₹47 Cr+', stat2Label: 'Saved by Buyers',    stat2Icon: '💰',
  stat3Num: '0%',      stat3Label: 'Brokerage Fee',       stat3Icon: '🚫',
  stat4Num: '2,500+',  stat4Label: 'Direct Listings',     stat4Icon: '🏠',
};

const SiteSettingsContext = createContext({ settings: DEFAULT });

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => setSettings(s => ({ ...s, ...data })))
      .catch(() => {});
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export const useSiteSettings = () => useContext(SiteSettingsContext);
