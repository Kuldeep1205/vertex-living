import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TermsOfService() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e2e8f0', padding: '60px 24px', fontFamily: 'inherit' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, marginBottom: 36 }}>
          ← Back
        </button>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8, color: '#f1f5f9' }}>Terms of Service</h1>
        <p style={{ color: '#64748b', marginBottom: 40, fontSize: 13 }}>Last updated: April 2026</p>

        {[
          { title: '1. Acceptance of Terms', body: 'By accessing or using the Vertex Living platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.' },
          { title: '2. Platform Use', body: 'Vertex Living is a real estate listing and discovery platform. We connect buyers with RERA-verified builders and agents. We are not a party to any transaction between buyers and sellers. All listings are subject to availability.' },
          { title: '3. User Accounts', body: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information during registration. Vertex Living reserves the right to suspend accounts that violate these terms.' },
          { title: '4. Builder Listings', body: 'Builders registering projects on the platform confirm that all project details — including RERA registration, pricing, and possession timelines — are accurate. Misrepresentation may result in immediate removal from the platform.' },
          { title: '5. Token Booking', body: 'The refundable token amount paid at the time of booking is ₹25,000. This amount is fully refundable if the buyer decides not to proceed, subject to a written request within 30 days. Vertex Living acts only as a booking facilitator.' },
          { title: '6. Intellectual Property', body: 'All content on this platform — including property images, descriptions, UI design, and branding — is the property of Vertex Living or its licensors. Unauthorised reproduction or commercial use is prohibited.' },
          { title: '7. Limitation of Liability', body: 'Vertex Living is not liable for any direct or indirect loss arising from reliance on listing information, builder representations, or third-party services integrated into the platform (e.g., payment gateways).' },
          { title: '8. Governing Law', body: 'These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Gurgaon, Haryana.' },
          { title: '9. Contact', body: 'For any terms-related queries: info@vertexliving.in | +91 98765 43210 | SCO 120, Sector 44, Gurgaon – 122003.' },
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
