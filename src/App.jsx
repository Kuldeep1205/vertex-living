import React, { lazy, Suspense, useEffect, useState } from 'react'
import { Routes, Route, useLocation, useNavigate, useNavigationType, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { SiteSettingsProvider } from './context/SiteSettingsContext'
import { RentalAuthProvider } from './context/RentalAuthContext'
import { useAuth } from './context/AuthContext'
import AuthModal from './components/AuthModal'
import useScrollReveal from './hooks/useScrollReveal'
import useAnimationEffects from './hooks/useAnimationEffects'
import useGSAPScrollAnimations from './hooks/useGSAPScrollAnimations'
import './components/HomePage.css'
import './components/Navbar.css'
import './components/Footer.css'
import './components/LuxAnimations.css'
import './components/BottomNav.css'

const pageVariants = {
  initial:  { opacity: 0, y: 18 },
  animate:  { opacity: 1, y: 0,  transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
  exit:     { opacity: 0, y: -14, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
};

function PageWrapper({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ minHeight: '100vh' }}
    >
      {children}
    </motion.div>
  );
}

const HomePage          = lazy(() => import('./components/HomePage'))
const Dashboard         = lazy(() => import('./pages/Dashboard'))
const AdminPanel        = lazy(() => import('./pages/AdminPanel'))
const PropertyDetail    = lazy(() => import('./pages/PropertyDetail'))
const CompareProperties = lazy(() => import('./pages/CompareProperties'))
const StoryPage         = lazy(() => import('./pages/StoryPage'))
const AccessDenied      = lazy(() => import('./pages/AccessDenied'))
const PrivacyPolicy     = lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfService    = lazy(() => import('./pages/TermsOfService'))
const RentalPage        = lazy(() => import('./pages/RentalPage'))
const RentalAdminPanel  = lazy(() => import('./pages/RentalAdminPanel'))

function PageLoader() {
  const [fadeOut, setFadeOut] = useState(false);
  const [hidden, setHidden]   = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFadeOut(true), 800);
    const t2 = setTimeout(() => setHidden(true), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (hidden) return null;
  return (
    <div className={`page-loader${fadeOut ? ' fade-out' : ''}`}>
      <div className="loader-logo-text">VERTEX LIVING</div>
      <div className="loader-spinner" />
    </div>
  );
}

/**
 * ProtectedRoute — redirects to home + opens login modal
 * if user is not authenticated.
 */
function ProtectedRoute({ element }) {
  const { user, openLogin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!user) openLogin(location.pathname + location.search);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return <Navigate to="/" replace />;
  return element;
}

/**
 * AdminRoute — only admin-role users can access.
 * Buyers and unauthenticated users are redirected to /access-denied.
 * Unauthenticated users also get the login prompt.
 */
function AdminRoute({ element }) {
  const { user, isAdmin, openLogin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!user) openLogin(location.pathname + location.search);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/access-denied" replace />;
  return element;
}

/**
 * After successful auth, navigate to the saved returnTo URL.
 */
function AuthRedirect() {
  const { user, returnTo, setReturnTo } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && returnTo) {
      setReturnTo(null);
      navigate(returnTo, { replace: true });
    }
  }, [user, returnTo, navigate, setReturnTo]);

  return null;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    window.history.scrollRestoration = 'manual';
  }, []);

  useEffect(() => {
    if (navType === 'POP') {
      const saved = sessionStorage.getItem('scrollPos_' + pathname);
      if (saved) {
        const pos = parseInt(saved);
        setTimeout(() => window.scrollTo({ top: pos, behavior: 'instant' }), 50);
        setTimeout(() => window.scrollTo({ top: pos, behavior: 'instant' }), 300);
        setTimeout(() => window.scrollTo({ top: pos, behavior: 'instant' }), 700);
      }
    } else {
      sessionStorage.setItem('scrollPos_' + pathname, window.scrollY);
      window.scrollTo(0, 0);
    }
  }, [pathname, navType]);

  // Save scroll position continuously while on page
  useEffect(() => {
    const save = () => sessionStorage.setItem('scrollPos_' + pathname, window.scrollY);
    window.addEventListener('scroll', save, { passive: true });
    return () => window.removeEventListener('scroll', save);
  }, [pathname]);

  return null;
}

function AppInner() {
  useScrollReveal();
  useAnimationEffects();
  useGSAPScrollAnimations();
  const location = useLocation();
  return (
    <>
      <AuthRedirect />
      <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0d1117' }} />}>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/"                element={<PageWrapper><HomePage /></PageWrapper>} />
            <Route path="/dashboard/*"     element={<PageWrapper><AdminRoute element={<Dashboard />} /></PageWrapper>} />
            <Route path="/admin-panel"     element={<PageWrapper><AdminRoute element={<AdminPanel />} /></PageWrapper>} />
            <Route path="/property/:id"    element={<PageWrapper><ProtectedRoute element={<PropertyDetail />} /></PageWrapper>} />
            <Route path="/compare"         element={<PageWrapper><CompareProperties /></PageWrapper>} />
            <Route path="/story"           element={<PageWrapper><StoryPage /></PageWrapper>} />
            <Route path="/privacy"         element={<PageWrapper><PrivacyPolicy /></PageWrapper>} />
            <Route path="/terms"           element={<PageWrapper><TermsOfService /></PageWrapper>} />
            <Route path="/access-denied"   element={<PageWrapper><AccessDenied /></PageWrapper>} />
            <Route path="/rent"            element={<PageWrapper><RentalPage /></PageWrapper>} />
            <Route path="/rental-admin"   element={<AdminRoute element={<RentalAdminPanel />} />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <SiteSettingsProvider>
    <ThemeProvider>
      <AuthProvider>
        <RentalAuthProvider>
          <PageLoader />
          <ScrollToTop />
          <AppInner />
          <AuthModal />
        </RentalAuthProvider>
      </AuthProvider>
    </ThemeProvider>
    </SiteSettingsProvider>
  )
}
