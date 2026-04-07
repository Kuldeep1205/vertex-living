import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

/**
 * Footer Component
 *
 * Comprehensive footer with links, contact info, and social media
 * Organized into logical sections for easy navigation
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const [nlEmail, setNlEmail] = useState('');
  const [nlStatus, setNlStatus] = useState('idle'); // idle | success | error

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!nlEmail.trim() || !/\S+@\S+\.\S+/.test(nlEmail)) {
      setNlStatus('error'); return;
    }
    try {
      await fetch('/api/admin/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Newsletter', email: nlEmail, enquiry: 'Newsletter Subscription', type: 'Newsletter' }),
      });
      setNlStatus('success');
      setNlEmail('');
    } catch {
      setNlStatus('success'); // still show success — non-critical
    }
  };

  // Scroll to a section on the homepage (navigate first if not already there)
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate('/', { state: { scrollTo: id } });
    }
  };

  const footerLinks = {
    company: [
      { label: 'About Us',  action: () => scrollTo('about') },
      { label: 'Our Team',  action: () => scrollTo('agent-showcase-section') },
      { label: 'Careers',   action: () => scrollTo('contact') },
      { label: 'Blog',      action: () => navigate('/story') },
    ],
    services: [
      { label: 'Buy Property',        action: () => scrollTo('featured-section') },
      { label: 'Rent Property',       action: () => scrollTo('contact') },
      { label: 'Commercial',          action: () => scrollTo('featured-section') },
      { label: 'New Projects',        action: () => scrollTo('builder-cta') },
      { label: 'Investment Advisory', action: () => scrollTo('savings-calculator') },
    ],
    support: [
      { label: 'Help Center',      action: () => scrollTo('how-it-works') },
      { label: 'Contact Us',       action: () => scrollTo('contact') },
      { label: 'Privacy Policy',   action: () => navigate('/privacy') },
      { label: 'Terms of Service', action: () => navigate('/terms') },
      { label: 'FAQ',              action: () => scrollTo('how-it-works') },
    ],
  };

  const socialLinks = [
    {
      name: 'Facebook', href: 'https://facebook.com', bg: '#1877f2',
      svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
    },
    {
      name: 'Instagram', href: 'https://instagram.com', bg: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
      svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeLinecap="round"/></svg>,
    },
    {
      name: 'LinkedIn', href: 'https://linkedin.com', bg: '#0a66c2',
      svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>,
    },
    {
      name: 'Twitter', href: 'https://twitter.com', bg: '#000000',
      svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>,
    },
  ];

  return (
    <footer className="footer">
      <div className="container">
        {/* Main Footer Content */}
        <div className="footer-main">
          {/* Company Info */}
          <div className="footer-brand">
            <div className="footer-logo">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="8" fill="currentColor"/>
                <path d="M12 18l8-8 8 8v10a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V18z" stroke="white" strokeWidth="2"/>
                <path d="M20 12v10M16 22h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>Vertex Living</span>
            </div>

            <p className="footer-description">
              Your trusted partner in finding the perfect property in Gurgaon and Delhi NCR.
              We bring you premium real estate solutions with 15+ years of expertise.
            </p>

            {/* Social Links */}
            <div className="footer-social">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="social-link"
                  aria-label={social.name}
                  style={{ background: social.bg, color: '#fff' }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.svg}
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div className="footer-links">
            {/* Company */}
            <div className="footer-links-column">
              <h4 className="footer-heading">Company</h4>
              <ul className="footer-links-list">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <button className="footer-link" onClick={link.action}>{link.label}</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div className="footer-links-column">
              <h4 className="footer-heading">Services</h4>
              <ul className="footer-links-list">
                {footerLinks.services.map((link, index) => (
                  <li key={index}>
                    <button className="footer-link" onClick={link.action}>{link.label}</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div className="footer-links-column">
              <h4 className="footer-heading">Support</h4>
              <ul className="footer-links-list">
                {footerLinks.support.map((link, index) => (
                  <li key={index}>
                    <button className="footer-link" onClick={link.action}>{link.label}</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="footer-contact">
            <h4 className="footer-heading">Get in Touch</h4>

            <a className="contact-item" href="tel:+919876543210">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>+91 98765 43210</span>
            </a>

            <a className="contact-item" href="https://mail.google.com/mail/?view=cm&to=info@vertexliving.com" target="_blank" rel="noopener noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <path d="M22 6l-10 7L2 6"/>
              </svg>
              <span>info@vertexliving.com</span>
            </a>

            <a className="contact-item" href="https://maps.google.com/?q=DLF+Cyber+City+Gurgaon" target="_blank" rel="noopener noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>DLF Cyber City, Gurgaon 122002</span>
            </a>

            {/* Newsletter */}
            <div className="newsletter">
              <p className="newsletter-label">Subscribe to our newsletter</p>
              {nlStatus === 'success' ? (
                <div style={{ color: '#4ade80', fontSize: 13, fontWeight: 600, padding: '10px 0' }}>
                  ✅ Subscribed! We'll keep you updated.
                </div>
              ) : (
                <form className="newsletter-form" onSubmit={handleNewsletter} noValidate>
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={nlEmail}
                    onChange={e => { setNlEmail(e.target.value); setNlStatus('idle'); }}
                    style={nlStatus === 'error' ? { borderColor: '#f87171' } : {}}
                  />
                  <button type="submit" aria-label="Subscribe">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                    </svg>
                  </button>
                </form>
              )}
              {nlStatus === 'error' && (
                <div style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>Please enter a valid email address.</div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>&copy; {currentYear} Vertex Living. All rights reserved.</p>
          </div>

          <div className="footer-legal">
            <button className="footer-link" onClick={() => navigate('/privacy')}>Privacy Policy</button>
            <span>•</span>
            <button className="footer-link" onClick={() => navigate('/terms')}>Terms of Service</button>
            <span>•</span>
            <button className="footer-link" onClick={() => navigate('/privacy')}>Cookie Policy</button>
          </div>

          <div className="footer-badges">
            <span className="badge">RERA Registered</span>
            <span className="badge">ISO Certified</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
