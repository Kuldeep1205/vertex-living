import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);

const SESSION_KEY = 'vl_session';
const API = import.meta.env.VITE_API_URL || 'https://vertex-living-server.vercel.app';

function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
}
function saveSession(user) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(user)); } catch {}
}
function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch {}
}

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(() => getSession());
  const [authModal, setAuthModal] = useState(false);
  const [authTab, setAuthTab]     = useState('login');
  const [returnTo, setReturnTo]   = useState(null);

  const isAdmin   = user?.role === 'admin';
  const isBuilder = user?.role === 'builder';
  const isBuyer   = !user || user?.role === 'buyer';

  const openLogin = useCallback((redirectUrl = null) => {
    if (redirectUrl && typeof redirectUrl === 'string') setReturnTo(redirectUrl);
    setAuthTab('login');
    setAuthModal(true);
  }, []);

  const openRegister = useCallback((redirectUrl = null) => {
    if (redirectUrl && typeof redirectUrl === 'string') setReturnTo(redirectUrl);
    setAuthTab('register');
    setAuthModal(true);
  }, []);

  const closeAuth = useCallback(() => {
    setAuthModal(false);
    setReturnTo(null);
  }, []);

  /** Returns null on success, error string on failure */
  const register = useCallback(async (name, email, password, phone, role = 'buyer') => {
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, role }),
      });
      const data = await res.json();
      if (!res.ok) return data.error || 'Registration failed. Please try again.';
      saveSession(data.user);
      setUser(data.user);
      setAuthModal(false);
      return null;
    } catch {
      return 'Server not reachable. Please make sure the server is running.';
    }
  }, []);

  /** Returns null on success, error string on failure */
  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return data.error || 'Invalid email or password.';
      saveSession(data.user);
      setUser(data.user);
      setAuthModal(false);
      return null;
    } catch {
      return 'Server not reachable. Please make sure the server is running.';
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, authModal, authTab, returnTo,
      openLogin, openRegister, closeAuth,
      register, login, logout,
      setAuthTab, setReturnTo,
      isAdmin, isBuilder, isBuyer,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
