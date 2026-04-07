import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ isDark: false, toggle: () => {}, mood: 'luxury', toggleMood: () => {} });

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('vl_theme');
      if (saved) return saved === 'dark';
    } catch {}
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  const [mood, setMood] = useState(() => {
    try {
      return localStorage.getItem('vl_mood') || 'luxury';
    } catch {}
    return 'luxury';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    try { localStorage.setItem('vl_theme', isDark ? 'dark' : 'light'); } catch {}
  }, [isDark]);

  useEffect(() => {
    document.documentElement.setAttribute('data-mood', mood);
    try { localStorage.setItem('vl_mood', mood); } catch {}
  }, [mood]);

  // Apply on first render instantly (no flash)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-mood', mood);
  }, []);

  const toggleMood = () => setMood(m => m === 'luxury' ? 'budget' : 'luxury');

  return (
    <ThemeContext.Provider value={{ isDark, toggle: () => setIsDark(d => !d), mood, toggleMood }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
