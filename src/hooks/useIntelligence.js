/**
 * useIntelligence — Tracks user behavior and infers preferences
 * Stored in localStorage, no backend needed.
 */
import { useState, useEffect, useCallback, useRef } from 'react';

const KEY = 'vl_intel';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; }
}

function save(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
}

function defaultState() {
  return {
    sessionCount: 0,
    firstVisit: Date.now(),
    lastVisit: null,
    viewedProperties: [],      // [{id, name, price, bedrooms, sector, city, ts}]
    searchHistory: [],
    sectionsVisited: [],
    maxScrollPct: 0,
    lifeSimUsed: false,
    priceTimelineUsed: false,
    cinematicUsed: false,
    inferredPrefs: null,       // computed on demand
  };
}

function inferPrefs(viewed) {
  if (!viewed || viewed.length === 0) return null;
  // Preferred price range
  const prices = viewed.map(p => p.price).filter(Boolean);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  // Preferred BHK
  const bhks = viewed.map(p => p.bedrooms).filter(b => b > 0);
  const bhkCounts = {};
  bhks.forEach(b => { bhkCounts[b] = (bhkCounts[b] || 0) + 1; });
  const preferredBHK = Object.entries(bhkCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  // Preferred sector/zone
  const sectors = viewed.map(p => p.sector).filter(Boolean);
  const sectorCounts = {};
  sectors.forEach(s => { sectorCounts[s] = (sectorCounts[s] || 0) + 1; });
  const preferredSector = Object.entries(sectorCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  // Preferred type
  const types = viewed.map(p => p.type).filter(Boolean);
  const typeCounts = {};
  types.forEach(t => { typeCounts[t] = (typeCounts[t] || 0) + 1; });
  const preferredType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  return { avgPrice, preferredBHK: parseInt(preferredBHK) || null, preferredSector, preferredType };
}

export function useIntelligence() {
  const [intel, setIntel] = useState(() => {
    const saved = load();
    if (!saved) {
      const fresh = defaultState();
      fresh.sessionCount = 1;
      fresh.lastVisit = Date.now();
      save(fresh);
      return fresh;
    }
    // New session
    const updated = { ...saved, sessionCount: saved.sessionCount + 1, lastVisit: Date.now() };
    save(updated);
    return updated;
  });

  const scrollHandled = useRef(false);

  // Track scroll depth
  useEffect(() => {
    const handle = () => {
      const pct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (pct > intel.maxScrollPct) {
        setIntel(prev => {
          const updated = { ...prev, maxScrollPct: pct };
          save(updated);
          return updated;
        });
      }
    };
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, [intel.maxScrollPct]);

  // Track section visibility
  useEffect(() => {
    const sections = ['hero', 'features', 'about', 'contact', 'featured-section'];
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.id;
          setIntel(prev => {
            if (prev.sectionsVisited.includes(id)) return prev;
            const updated = { ...prev, sectionsVisited: [...prev.sectionsVisited, id] };
            save(updated);
            return updated;
          });
        }
      });
    }, { threshold: 0.3 });
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const trackPropertyView = useCallback((property) => {
    setIntel(prev => {
      const already = prev.viewedProperties.find(p => p.id === property.id);
      if (already) return prev;
      const viewed = [
        { id: property.id, name: property.name, price: property.price,
          bedrooms: property.bedrooms, sector: property.sector,
          city: property.city, type: property.type, ts: Date.now() },
        ...prev.viewedProperties,
      ].slice(0, 20);
      const inferredPrefs = inferPrefs(viewed);
      const updated = { ...prev, viewedProperties: viewed, inferredPrefs };
      save(updated);
      return updated;
    });
  }, []);

  const trackSearch = useCallback((query) => {
    setIntel(prev => {
      const history = [query, ...prev.searchHistory.filter(q => q !== query)].slice(0, 8);
      const updated = { ...prev, searchHistory: history };
      save(updated);
      return updated;
    });
  }, []);

  const trackFeature = useCallback((feature) => {
    setIntel(prev => {
      const updated = { ...prev, [feature]: true };
      save(updated);
      return updated;
    });
  }, []);

  // Computed helpers
  const isReturning   = intel.sessionCount > 1;
  const viewCount     = intel.viewedProperties.length;
  const prefs         = intel.inferredPrefs;
  const lastViewed    = intel.viewedProperties[0] || null;
  const deepExplorer  = intel.maxScrollPct > 60;
  const highEngagement = viewCount >= 3 || intel.lifeSimUsed || intel.cinematicUsed;

  function getSmartMessage() {
    const hr = new Date().getHours();
    const tod = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';

    if (isReturning && lastViewed) {
      return {
        type: 'returning',
        headline: `Welcome back! 👋`,
        sub: `You last explored ${lastViewed.name}. Similar properties are waiting.`,
        cta: 'Resume searching',
      };
    }
    if (prefs?.preferredBHK && viewCount >= 2) {
      return {
        type: 'personalized',
        headline: `We know what you like ✨`,
        sub: `${prefs.preferredBHK}BHK · ${prefs.preferredSector} · ₹${prefs.avgPrice?.toFixed(1)}Cr range — we've found more like this.`,
        cta: 'See matches',
      };
    }
    if (deepExplorer && !prefs) {
      return {
        type: 'explorer',
        headline: `You're a thorough researcher 🔍`,
        sub: `Most buyers decide in 3 visits. You're doing it right — take your time.`,
        cta: null,
      };
    }
    return {
      type: 'welcome',
      headline: `${tod} 👋`,
      sub: `Gurgaon's smartest property search — 2,000+ verified listings.`,
      cta: 'Start exploring',
    };
  }

  function getSmartPropertyScore(property) {
    if (!prefs || viewCount < 2) return null;
    let score = 50;
    if (prefs.preferredBHK && property.bedrooms === prefs.preferredBHK) score += 22;
    if (prefs.preferredSector && property.sector === prefs.preferredSector) score += 18;
    if (prefs.avgPrice) {
      const diff = Math.abs(property.price - prefs.avgPrice) / prefs.avgPrice;
      if (diff < 0.2) score += 15;
      else if (diff < 0.4) score += 8;
      else score -= 5;
    }
    if (prefs.preferredType && property.type === prefs.preferredType) score += 10;
    score += (property.id % 5); // deterministic variance
    return Math.min(99, Math.max(30, score));
  }

  function getNudge() {
    if (viewCount === 2) return { msg: "You've explored 2 properties — compare them side by side?", icon: '⚖️', action: 'compare' };
    if (viewCount >= 4) return { msg: `You've viewed ${viewCount} properties. Your taste is clear — want AI to narrow it down?`, icon: '🤖', action: 'ai' };
    if (intel.priceTimelineUsed && !prefs) return { msg: 'Click any property card to expand it instantly — no page load.', icon: '💡', action: null };
    if (intel.maxScrollPct > 80 && viewCount === 0) return { msg: 'Tap any property card to see full details inline.', icon: '👆', action: null };
    return null;
  }

  return {
    intel, trackPropertyView, trackSearch, trackFeature,
    isReturning, viewCount, prefs, lastViewed, deepExplorer, highEngagement,
    getSmartMessage, getSmartPropertyScore, getNudge,
  };
}

// Singleton context so any component can access
import { createContext, useContext } from 'react';
export const IntelligenceContext = createContext(null);
export const useIntel = () => useContext(IntelligenceContext);
