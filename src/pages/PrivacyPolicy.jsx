import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e2e8f0', padding: '60px 24px', fontFamily: 'inherit' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, marginBottom: 36 }}>
          ← Back
        </button>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8, color: '#f1f5f9' }}>Privacy Policy</h1>
        <p style={{ color: '#64748b', marginBottom: 40, fontSize: 13 }}>Last updated: April 2026</p>

        {[
          { title: '1. Information We Collect', body: 'We collect information you provide directly — such as your name, phone number, email address, and property preferences — when you register, submit an inquiry, or book a property visit. We also collect usage data such as pages visited and search queries to improve our services.' },
          { title: '2. How We Use Your Information', body: 'Your information is used to connect you with verified builders and agents, personalise your property search experience, send booking confirmations and invoices, and communicate service updates. We do not sell your data to third parties.' },
          { title: '3. Data Sharing', body: 'We share your contact details only with the builder or agent whose property you have expressed interest in. All partners on our platform are RERA-verified. We do not share your data with unrelated advertisers.' },
          { title: '4. Data Security', body: 'All data is stored on secured servers. Payments are processed via Razorpay which is PCI-DSS compliant. We use HTTPS encryption across the entire platform.' },
          { title: '5. Cookies', body: 'We use cookies to remember your preferences (theme, search filters) and to analyse platform usage anonymously. You can disable cookies in your browser settings; some features may not work correctly if you do.' },
          { title: '6. Your Rights', body: 'You may request access to, correction of, or deletion of your personal data at any time by contacting us at info@vertexliving.in. We will process your request within 7 business days.' },
          { title: '7. Contact', body: 'For any privacy-related queries, write to us at: info@vertexliving.in or call +91 98765 43210. Address: SCO 120, Sector 44, Gurgaon – 122003.' },
        ].map(({ title, body }) => (
          <div key={title} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#a5b4fc', marginBottom: 10 }}>{title}</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.75, fontSize: '0.92rem' }}>{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
