import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AccessDenied.css';

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="ad-page">
      <div className="ad-card">
        <div className="ad-icon">🔒</div>
        <h1 className="ad-title">Access Restricted</h1>
        <p className="ad-desc">
          The Builder Dashboard is only accessible to the backend team.<br />
          If you believe this is an error, please contact your administrator.
        </p>
        <div className="ad-actions">
          <button className="ad-btn-primary" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
          <a className="ad-btn-secondary" href="mailto:admin@vertexliving.in">
            Contact Admin
          </a>
        </div>
        <p className="ad-note">
          You are logged in as a <strong>Buyer</strong> account. Dashboard access requires an Admin role.
        </p>
      </div>
    </div>
  );
}
