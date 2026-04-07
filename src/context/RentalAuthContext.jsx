import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const RentalAuthContext = createContext(null);

const SESSION_KEY = 'vl_rental_session';
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

export function RentalAuthProvider({ children }) {
  const [rentalUser, setRentalUser]           = useState(() => getSession());
  const [rentalAuthModal, setRentalAuthModal] = useState(false);
  const [rentalTab, setRentalTab]             = useState('login');

  const isRentalOwner  = rentalUser?.role === 'owner';
  const isRentalTenant = rentalUser?.role === 'tenant';

  const openRentalLogin = useCallback(() => {
    setRentalTab('login');
    setRentalAuthModal(true);
  }, []);

  const openRentalRegister = useCallback(() => {
    setRentalTab('register');
    setRentalAuthModal(true);
  }, []);

  const closeRentalAuth = useCallback(() => {
    setRentalAuthModal(false);
  }, []);

  const rentalLogout = useCallback(() => {
    clearSession();
    setRentalUser(null);
  }, []);

  /** Returns null on success, error string on failure */
  const rentalLogin = useCallback(async (email, password) => {
    try {
      const res = await fetch(`${API}/api/rental/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return data.error || 'Login failed. Please try again.';
      saveSession(data.user);
      setRentalUser(data.user);
      setRentalAuthModal(false);
      return null;
    } catch {
      return 'Server not reachable. Please make sure the server is running.';
    }
  }, []);

  /** Returns null on success, error string on failure */
  const rentalRegister = useCallback(async (name, email, password, phone, role) => {
    try {
      const res = await fetch(`${API}/api/rental/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, role }),
      });
      const data = await res.json();
      if (!res.ok) return data.error || 'Registration failed. Please try again.';
      saveSession(data.user);
      setRentalUser(data.user);
      setRentalAuthModal(false);
      return null;
    } catch {
      return 'Server not reachable. Please make sure the server is running.';
    }
  }, []);

  return (
    <RentalAuthContext.Provider value={{
      rentalUser,
      rentalAuthModal,
      rentalTab,
      openRentalLogin,
      openRentalRegister,
      closeRentalAuth,
      rentalLogin,
      rentalRegister,
      rentalLogout,
      setRentalTab,
      isRentalOwner,
      isRentalTenant,
    }}>
      {children}
    </RentalAuthContext.Provider>
  );
}

export function useRentalAuth() {
  const ctx = useContext(RentalAuthContext);
  if (!ctx) throw new Error('useRentalAuth must be used within RentalAuthProvider');
  return ctx;
}

export default RentalAuthContext;
