import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || '';

function fmtRent(n) {
  if (!n && n !== 0) return '—';
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const S = {
  page: {
    minHeight: '100vh',
    background: '#0d1117',
    color: '#e6edf3',
    fontFamily: "'Inter', system-ui, sans-serif",
    paddingBottom: 60,
  },
  header: {
    background: 'linear-gradient(135deg, #161b22 0%, #1c2230 100%)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    padding: '18px 32px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    position: 'sticky', top: 0, zIndex: 50,
  },
  title: { fontSize: '1.25rem', fontWeight: 700, color: '#e6edf3', margin: 0 },
  badge: {
    background: 'rgba(99,102,241,0.15)', color: '#818cf8',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: 20, padding: '3px 12px', fontSize: '0.75rem', fontWeight: 600,
  },
  tabs: {
    display: 'flex', gap: 4,
    background: '#161b22', borderBottom: '1px solid rgba(255,255,255,0.06)',
    padding: '0 32px',
  },
  tab: (active) => ({
    padding: '14px 20px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
    background: 'transparent', color: active ? '#818cf8' : '#8b949e',
    borderBottom: active ? '2px solid #6366f1' : '2px solid transparent',
    transition: 'all 0.2s',
  }),
  body: { padding: '28px 32px' },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28,
  },
  statCard: {
    background: '#161b22', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12, padding: '20px 18px',
  },
  statNum: { fontSize: '1.8rem', fontWeight: 800, color: '#818cf8', lineHeight: 1 },
  statLabel: { fontSize: '0.78rem', color: '#8b949e', marginTop: 6 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left', padding: '10px 14px', fontSize: '0.75rem', fontWeight: 600,
    color: '#8b949e', borderBottom: '1px solid rgba(255,255,255,0.06)',
    textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  td: {
    padding: '12px 14px', fontSize: '0.83rem', color: '#e6edf3',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    verticalAlign: 'middle',
  },
  chip: (color) => ({
    display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
    background: color === 'green' ? 'rgba(34,197,94,0.15)' : color === 'red' ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)',
    color: color === 'green' ? '#22c55e' : color === 'red' ? '#ef4444' : '#818cf8',
    border: `1px solid ${color === 'green' ? 'rgba(34,197,94,0.3)' : color === 'red' ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.3)'}`,
  }),
  btnDanger: {
    padding: '5px 12px', borderRadius: 7, border: '1px solid rgba(239,68,68,0.3)',
    background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
  },
  btnGreen: {
    padding: '5px 12px', borderRadius: 7, border: '1px solid rgba(34,197,94,0.3)',
    background: 'rgba(34,197,94,0.1)', color: '#22c55e', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
  },
  btnBlue: {
    padding: '5px 12px', borderRadius: 7, border: '1px solid rgba(99,102,241,0.3)',
    background: 'rgba(99,102,241,0.1)', color: '#818cf8', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
  },
  searchBox: {
    padding: '9px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
    background: '#161b22', color: '#e6edf3', fontSize: '0.85rem', width: 260, outline: 'none',
  },
  empty: {
    textAlign: 'center', padding: '60px 0', color: '#8b949e', fontSize: '0.9rem',
  },
};

// ─── Stats Row ─────────────────────────────────────────────────────────────────
function StatsRow({ stats }) {
  const cards = [
    { label: 'Total Properties', value: stats.totalProperties, icon: '🏠' },
    { label: 'Active',           value: stats.activeProperties, icon: '✅' },
    { label: 'Inactive',         value: stats.inactiveProperties, icon: '⏸️' },
    { label: 'Owners',           value: stats.totalOwners, icon: '👤' },
    { label: 'Tenants',          value: stats.totalTenants, icon: '🧑‍💼' },
    { label: 'Inquiries',        value: stats.totalInquiries, icon: '📩' },
  ];
  return (
    <div style={S.statsGrid}>
      {cards.map(c => (
        <div key={c.label} style={S.statCard}>
          <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{c.icon}</div>
          <div style={S.statNum}>{c.value ?? '—'}</div>
          <div style={S.statLabel}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Properties Tab ────────────────────────────────────────────────────────────
function PropertiesTab({ properties, onToggleStatus, onDelete, reload }) {
  const [q, setQ] = useState('');
  const filtered = properties.filter(p =>
    !q || `${p.title} ${p.sector} ${p.location} ${p.ownerName}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>All Rental Properties ({properties.length})</h2>
        <input style={S.searchBox} placeholder="Search title, location, owner…" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div style={S.empty}>No properties found.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>
                {['Photo','Title','Type','Location','Rent','Owner','Status','Listed','Actions'].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={{ transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={S.td}>
                    {p.photos?.[0]
                      ? <img src={p.photos[0]} alt="" style={{ width: 52, height: 40, objectFit: 'cover', borderRadius: 6 }} onError={e => e.target.style.display='none'} />
                      : <div style={{ width: 52, height: 40, background: 'rgba(99,102,241,0.1)', borderRadius: 6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>🏠</div>
                    }
                  </td>
                  <td style={{ ...S.td, maxWidth: 200 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.83rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                    <div style={{ color: '#8b949e', fontSize: '0.72rem', marginTop: 2 }}>{p.type} · {p.furnishing}</div>
                  </td>
                  <td style={S.td}><span style={S.chip('blue')}>{p.type}</span></td>
                  <td style={{ ...S.td, maxWidth: 160 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{p.sector}</div>
                  </td>
                  <td style={S.td}><strong style={{ color: '#818cf8' }}>{fmtRent(p.rentPerMonth)}</strong>/mo</td>
                  <td style={{ ...S.td, fontSize: '0.8rem' }}>
                    <div>{p.ownerName}</div>
                    <div style={{ color: '#8b949e', fontSize: '0.72rem' }}>{p.ownerPhone}</div>
                  </td>
                  <td style={S.td}>
                    <span style={S.chip(p.status === 'active' ? 'green' : 'red')}>{p.status}</span>
                  </td>
                  <td style={{ ...S.td, fontSize: '0.78rem', color: '#8b949e' }}>{fmtDate(p.listedAt)}</td>
                  <td style={S.td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        style={p.status === 'active' ? S.btnDanger : S.btnGreen}
                        onClick={() => onToggleStatus(p.id, p.status === 'active' ? 'inactive' : 'active')}
                      >
                        {p.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button style={S.btnDanger} onClick={() => onDelete('properties', p.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Users Tab ─────────────────────────────────────────────────────────────────
function UsersTab({ users, onDelete }) {
  const [q, setQ] = useState('');
  const filtered = users.filter(u => !q || `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Rental Users ({users.length})</h2>
        <input style={S.searchBox} placeholder="Search name, email, role…" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div style={S.empty}>No users found.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>
                {['Avatar','Name','Email','Phone','Role','Joined','Actions'].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={S.td}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: u.role === 'owner' ? 'rgba(99,102,241,0.2)' : 'rgba(34,197,94,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.85rem',
                      color: u.role === 'owner' ? '#818cf8' : '#22c55e',
                    }}>{u.avatar || u.name?.[0]?.toUpperCase()}</div>
                  </td>
                  <td style={{ ...S.td, fontWeight: 600 }}>{u.name}</td>
                  <td style={{ ...S.td, color: '#8b949e' }}>{u.email}</td>
                  <td style={{ ...S.td, color: '#8b949e' }}>{u.phone || '—'}</td>
                  <td style={S.td}><span style={S.chip(u.role === 'owner' ? 'blue' : 'green')}>{u.role}</span></td>
                  <td style={{ ...S.td, color: '#8b949e', fontSize: '0.78rem' }}>{fmtDate(u.createdAt)}</td>
                  <td style={S.td}>
                    <button style={S.btnDanger} onClick={() => onDelete('users', u.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Inquiries Tab ─────────────────────────────────────────────────────────────
function InquiriesTab({ inquiries, onDelete }) {
  const [q, setQ] = useState('');
  const filtered = inquiries.filter(i => !q || `${i.tenantName} ${i.tenantEmail} ${i.propertyTitle}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>All Inquiries ({inquiries.length})</h2>
        <input style={S.searchBox} placeholder="Search tenant, property…" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div style={S.empty}>No inquiries yet.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>
                {['Property','Tenant','Email','Phone','Message','Date','Actions'].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(i => (
                <tr key={i.id}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ ...S.td, maxWidth: 180 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, fontSize: '0.8rem' }}>{i.propertyTitle || '—'}</div>
                  </td>
                  <td style={{ ...S.td, fontWeight: 600 }}>{i.tenantName}</td>
                  <td style={{ ...S.td, color: '#8b949e' }}>{i.tenantEmail}</td>
                  <td style={{ ...S.td, color: '#8b949e' }}>{i.tenantPhone || '—'}</td>
                  <td style={{ ...S.td, maxWidth: 220 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#8b949e', fontSize: '0.8rem' }}>"{i.message}"</div>
                  </td>
                  <td style={{ ...S.td, color: '#8b949e', fontSize: '0.78rem' }}>{fmtDate(i.createdAt)}</td>
                  <td style={S.td}>
                    <button style={S.btnDanger} onClick={() => onDelete('inquiries', i.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function RentalAdminPanel() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats]         = useState({});
  const [properties, setProperties] = useState([]);
  const [users, setUsers]           = useState([]);
  const [inquiries, setInquiries]   = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (!user || !isAdmin) { navigate('/'); }
  }, [user, isAdmin, navigate]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, pRes, uRes, iRes] = await Promise.all([
        fetch(`${API}/api/rental/admin/stats`),
        fetch(`${API}/api/rental/admin/properties`),
        fetch(`${API}/api/rental/admin/users`),
        fetch(`${API}/api/rental/admin/inquiries`),
      ]);
      const [s, p, u, i] = await Promise.all([sRes.json(), pRes.json(), uRes.json(), iRes.json()]);
      setStats(s);
      if (Array.isArray(p)) setProperties(p);
      if (Array.isArray(u)) setUsers(u);
      if (Array.isArray(i)) setInquiries(i);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleToggleStatus = async (id, newStatus) => {
    try {
      await fetch(`${API}/api/rental/admin/properties/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setProperties(prev => prev.map(p => String(p.id) === String(id) ? { ...p, status: newStatus } : p));
      setStats(prev => ({
        ...prev,
        activeProperties: newStatus === 'active' ? (prev.activeProperties || 0) + 1 : (prev.activeProperties || 1) - 1,
        inactiveProperties: newStatus === 'inactive' ? (prev.inactiveProperties || 0) + 1 : (prev.inactiveProperties || 1) - 1,
      }));
    } catch { /* ignore */ }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Delete this ${type === 'properties' ? 'property' : type === 'users' ? 'user' : 'inquiry'}?`)) return;
    try {
      await fetch(`${API}/api/rental/admin/${type}/${id}`, { method: 'DELETE' });
      if (type === 'properties') setProperties(prev => prev.filter(p => String(p.id) !== String(id)));
      if (type === 'users')      setUsers(prev => prev.filter(u => String(u.id) !== String(id)));
      if (type === 'inquiries')  setInquiries(prev => prev.filter(i => String(i.id) !== String(id)));
      loadAll(); // refresh stats
    } catch { /* ignore */ }
  };

  if (!user || !isAdmin) return null;

  const tabs = [
    { id: 'overview',    label: '📊 Overview' },
    { id: 'properties',  label: `🏠 Properties (${properties.length})` },
    { id: 'users',       label: `👤 Users (${users.length})` },
    { id: 'inquiries',   label: `📩 Inquiries (${inquiries.length})` },
  ];

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ background: 'transparent', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '1.2rem' }}
          >←</button>
          <h1 style={S.title}>🏠 Rental Admin Dashboard</h1>
          <span style={S.badge}>Vertex Living</span>
        </div>
        <button
          onClick={loadAll}
          style={{ ...S.btnBlue, fontSize: '0.8rem' }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={S.tabs}>
        {tabs.map(t => (
          <button key={t.id} style={S.tab(activeTab === t.id)} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div style={S.body}>
        {loading ? (
          <div style={{ ...S.empty, paddingTop: 80 }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
            Loading data…
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div>
                <StatsRow stats={stats} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
                    <h3 style={{ margin: '0 0 14px', fontSize: '0.9rem', color: '#8b949e' }}>Recent Properties</h3>
                    {properties.slice(-5).reverse().map(p => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div>
                          <div style={{ fontSize: '0.83rem', fontWeight: 600 }}>{p.title}</div>
                          <div style={{ fontSize: '0.73rem', color: '#8b949e' }}>{p.sector}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.83rem', color: '#818cf8', fontWeight: 700 }}>{fmtRent(p.rentPerMonth)}/mo</div>
                          <span style={S.chip(p.status === 'active' ? 'green' : 'red')}>{p.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
                    <h3 style={{ margin: '0 0 14px', fontSize: '0.9rem', color: '#8b949e' }}>Recent Inquiries</h3>
                    {inquiries.slice(-5).reverse().map(i => (
                      <div key={i.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ fontSize: '0.83rem', fontWeight: 600 }}>{i.tenantName}</div>
                        <div style={{ fontSize: '0.73rem', color: '#8b949e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          "{i.message}"
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#6366f1', marginTop: 2 }}>{i.propertyTitle}</div>
                      </div>
                    ))}
                    {inquiries.length === 0 && <div style={{ color: '#8b949e', fontSize: '0.83rem' }}>No inquiries yet.</div>}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'properties' && (
              <PropertiesTab
                properties={properties}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
                reload={loadAll}
              />
            )}

            {activeTab === 'users' && (
              <UsersTab users={users} onDelete={handleDelete} />
            )}

            {activeTab === 'inquiries' && (
              <InquiriesTab inquiries={inquiries} onDelete={handleDelete} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
