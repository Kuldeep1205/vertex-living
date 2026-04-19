import React, { useState, useEffect, useCallback } from 'react'
import './Dashboard.css'

const API = import.meta.env.VITE_API_URL || 'https://vertex-living-server.onrender.com'

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const Icon = {
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 11.5 19.79 19.79 0 01.01 2.82 2 2 0 012 .66h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.48a16 16 0 006.29 6.29l1.17-1.17a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
    </svg>
  ),
  history: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
  live: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="2"/>
      <path d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49m11.31-2.82a10 10 0 010 14.14m-14.14 0a10 10 0 010-14.14"/>
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20,6 9,17 4,12"/>
    </svg>
  ),
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '--'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function formatDate(iso) {
  if (!iso) return '--'
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatPhone(num) {
  if (!num || num === 'Unknown') return 'Unknown'
  return num
}

function formatLocation(call) {
  const parts = [call.callerCity, call.callerState, call.callerCountry].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : null
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [calls, setCalls] = useState([])
  const [activeCalls, setActiveCalls] = useState([])
  const [config, setConfig] = useState(null)
  const [selectedCall, setSelectedCall] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [serverOnline, setServerOnline] = useState(false)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/stats`)
      setStats(await res.json())
      setServerOnline(true)
    } catch {
      setServerOnline(false)
    }
  }, [])

  const fetchCalls = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/calls`)
      setCalls(await res.json())
    } catch {}
  }, [])

  const fetchActiveCalls = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/active-calls`)
      setActiveCalls(await res.json())
    } catch {}
  }, [])

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/config`)
      setConfig(await res.json())
    } catch {}
  }, [])

  // Initial load + polling
  useEffect(() => {
    fetchStats()
    fetchCalls()
    fetchConfig()
    fetchActiveCalls()

    const interval = setInterval(() => {
      fetchStats()
      fetchActiveCalls()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (tab === 'history') fetchCalls()
    if (tab === 'live') {
      fetchActiveCalls()
      const interval = setInterval(fetchActiveCalls, 3000)
      return () => clearInterval(interval)
    }
  }, [tab])

  const saveConfig = async () => {
    setSaving(true)
    try {
      await fetch(`${API}/api/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {}
    setSaving(false)
  }

  const TABS = [
    { id: 'overview', label: 'Overview', icon: Icon.chart },
    { id: 'history', label: 'Call History', icon: Icon.history },
    { id: 'live', label: 'Live Calls', icon: Icon.live },
    { id: 'settings', label: 'AI Settings', icon: Icon.settings },
  ]

  return (
    <div className="db-root">
      {/* Sidebar */}
      <aside className="db-sidebar">
        <div className="db-brand">
          <span className="db-brand-icon">{Icon.phone}</span>
          <div>
            <div className="db-brand-name">AI Phone</div>
            <div className="db-brand-sub">System</div>
          </div>
        </div>

        <nav className="db-nav">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`db-nav-item ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <span className="db-nav-icon">{t.icon}</span>
              <span>{t.label}</span>
              {t.id === 'live' && activeCalls.length > 0 && (
                <span className="db-badge">{activeCalls.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="db-status">
          <span className={`db-dot ${serverOnline ? 'online' : 'offline'}`} />
          <span>{serverOnline ? 'Server Online' : 'Server Offline'}</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="db-main">
        <header className="db-header">
          <div>
            <h1 className="db-page-title">{TABS.find(t => t.id === tab)?.label}</h1>
            <p className="db-page-sub">
              {tab === 'overview' && 'Your AI call center at a glance'}
              {tab === 'history' && 'All incoming calls and their transcripts'}
              {tab === 'live' && 'Real-time active calls'}
              {tab === 'settings' && 'Configure your AI agent personality'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <a href="/admin-panel" style={{ padding: '8px 14px', background: 'rgba(212,168,83,0.15)', color: '#d4a853', borderRadius: '8px', border: '1px solid rgba(212,168,83,0.3)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>Site Manager</a>
            <a href="/" className="db-back-btn">← Back to Website</a>
          </div>
        </header>

        <div className="db-content">
          {tab === 'overview' && (
            <OverviewTab stats={stats} calls={calls} onCallClick={setSelectedCall} />
          )}
          {tab === 'history' && (
            <HistoryTab calls={calls} onCallClick={setSelectedCall} onRefresh={fetchCalls} />
          )}
          {tab === 'live' && (
            <LiveTab activeCalls={activeCalls} onRefresh={fetchActiveCalls} />
          )}
          {tab === 'settings' && config && (
            <SettingsTab
              config={config}
              onChange={setConfig}
              onSave={saveConfig}
              saving={saving}
              saved={saved}
            />
          )}
        </div>
      </main>

      {/* Transcript Modal */}
      {selectedCall && (
        <TranscriptModal call={selectedCall} onClose={() => setSelectedCall(null)} />
      )}
    </div>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ stats, calls, onCallClick }) {
  const statCards = [
    { label: 'Total Calls', value: stats?.totalCalls ?? '--', color: 'indigo', icon: Icon.phone },
    { label: "Today's Calls", value: stats?.todayCalls ?? '--', color: 'blue', icon: Icon.chart },
    { label: 'Active Now', value: stats?.activeCalls ?? '--', color: 'green', icon: Icon.live },
    { label: 'Avg Duration', value: stats ? formatDuration(stats.avgDuration) : '--', color: 'purple', icon: Icon.history },
  ]

  const recent = [...calls]
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    .slice(0, 8)

  return (
    <div className="db-overview">
      <div className="db-stats-grid">
        {statCards.map(card => (
          <div key={card.label} className={`db-stat-card db-stat-${card.color}`}>
            <div className="db-stat-icon">{card.icon}</div>
            <div>
              <div className="db-stat-value">{card.value}</div>
              <div className="db-stat-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="db-section">
        <h2 className="db-section-title">Recent Calls</h2>
        {recent.length === 0 ? (
          <div className="db-empty">No calls yet. Waiting for your first call...</div>
        ) : (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Caller</th>
                  <th>Date & Time</th>
                  <th>Duration</th>
                  <th>Messages</th>
                  <th>Status</th>
                  <th>Transcript</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(call => (
                  <CallRow key={call.id} call={call} onView={() => onCallClick(call)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── History Tab ──────────────────────────────────────────────────────────────
function HistoryTab({ calls, onCallClick, onRefresh }) {
  const sorted = [...calls].sort((a, b) => new Date(b.startTime) - new Date(a.startTime))

  return (
    <div className="db-section">
      <div className="db-section-header">
        <h2 className="db-section-title">All Calls ({calls.length})</h2>
        <button className="db-btn-outline" onClick={onRefresh}>Refresh</button>
      </div>
      {sorted.length === 0 ? (
        <div className="db-empty">No calls recorded yet.</div>
      ) : (
        <div className="db-table-wrap">
          <table className="db-table">
            <thead>
              <tr>
                <th>Caller</th>
                <th>Location</th>
                <th>Date & Time</th>
                <th>Duration</th>
                <th>Messages</th>
                <th>Status</th>
                <th>Transcript</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(call => (
                <CallRow key={call.id} call={call} onView={() => onCallClick(call)} showTo />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Live Calls Tab ───────────────────────────────────────────────────────────
function LiveTab({ activeCalls, onRefresh }) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="db-section">
      <div className="db-section-header">
        <h2 className="db-section-title">
          Live Calls
          {activeCalls.length > 0 && (
            <span className="db-live-badge">{activeCalls.length} active</span>
          )}
        </h2>
        <button className="db-btn-outline" onClick={onRefresh}>Refresh</button>
      </div>

      {activeCalls.length === 0 ? (
        <div className="db-empty-live">
          <div className="db-empty-icon">{Icon.phone}</div>
          <p>No active calls right now.</p>
          <p className="db-empty-sub">Calls will appear here when customers ring in.</p>
        </div>
      ) : (
        <div className="db-live-grid">
          {activeCalls.map(call => {
            const elapsed = Math.round((Date.now() - new Date(call.startTime).getTime()) / 1000)
            return (
              <div key={call.id} className="db-live-card">
                <div className="db-live-pulse" />
                <div className="db-live-info">
                  <div className="db-live-caller">{formatPhone(call.from)}</div>
                  <div className="db-live-meta">→ {formatPhone(call.to)}</div>
                </div>
                <div className="db-live-duration">{formatDuration(elapsed)}</div>
                <div className="db-live-status">
                  <span className="db-dot online" /> AI Active
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
const VOICES = [
  { id: 'alloy', label: 'Alloy (Neutral)' },
  { id: 'echo', label: 'Echo (Male)' },
  { id: 'fable', label: 'Fable (British)' },
  { id: 'onyx', label: 'Onyx (Deep Male)' },
  { id: 'nova', label: 'Nova (Female)' },
  { id: 'shimmer', label: 'Shimmer (Soft Female)' },
  { id: 'ash', label: 'Ash (Clear)' },
  { id: 'coral', label: 'Coral (Warm Female)' },
  { id: 'sage', label: 'Sage (Calm)' },
]

function SettingsTab({ config, onChange, onSave, saving, saved }) {
  const set = (key, val) => onChange(prev => ({ ...prev, [key]: val }))

  return (
    <div className="db-settings">
      <div className="db-settings-grid">
        {/* Business Info */}
        <div className="db-card">
          <h3 className="db-card-title">Business Information</h3>
          <div className="db-form-group">
            <label>Business Name</label>
            <input
              className="db-input"
              value={config.businessName || ''}
              onChange={e => set('businessName', e.target.value)}
              placeholder="e.g. Vertex Living"
            />
          </div>
          <div className="db-form-group">
            <label>Business Type</label>
            <input
              className="db-input"
              value={config.businessType || ''}
              onChange={e => set('businessType', e.target.value)}
              placeholder="e.g. Real Estate & Property Management"
            />
          </div>
        </div>

        {/* Agent Identity */}
        <div className="db-card">
          <h3 className="db-card-title">Agent Identity</h3>
          <div className="db-form-group">
            <label>Agent Name</label>
            <input
              className="db-input"
              value={config.agentName || ''}
              onChange={e => set('agentName', e.target.value)}
              placeholder="e.g. Sarah"
            />
          </div>
          <div className="db-form-group">
            <label>Voice</label>
            <select
              className="db-input"
              value={config.voice || 'alloy'}
              onChange={e => set('voice', e.target.value)}
            >
              {VOICES.map(v => (
                <option key={v.id} value={v.id}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Greeting */}
        <div className="db-card db-card-full">
          <h3 className="db-card-title">Greeting Message</h3>
          <p className="db-card-sub">What the AI says when it picks up the call</p>
          <div className="db-form-group">
            <textarea
              className="db-input db-textarea"
              rows={3}
              value={config.greeting || ''}
              onChange={e => set('greeting', e.target.value)}
              placeholder="Thank you for calling! This is Sarah, how may I help you today?"
            />
          </div>
        </div>

        {/* System Prompt */}
        <div className="db-card db-card-full">
          <h3 className="db-card-title">AI Personality & Knowledge</h3>
          <p className="db-card-sub">
            Tell the AI what it knows about your business — services, pricing, FAQs, hours, etc.
          </p>
          <div className="db-form-group">
            <textarea
              className="db-input db-textarea"
              rows={10}
              value={config.systemPrompt || ''}
              onChange={e => set('systemPrompt', e.target.value)}
              placeholder={`Examples of what to include:
- Office hours: Monday-Friday 9am-6pm
- Services: property rentals, viewings, maintenance requests
- Available properties: 2BR apartments from $1,500/month
- To schedule a viewing call back: 555-1234
- Maintenance emergencies: available 24/7`}
            />
          </div>
        </div>
      </div>

      <div className="db-save-bar">
        <button
          className={`db-btn-save ${saving ? 'loading' : ''} ${saved ? 'success' : ''}`}
          onClick={onSave}
          disabled={saving}
        >
          {saved ? (
            <><span className="db-btn-icon">{Icon.check}</span> Saved!</>
          ) : saving ? (
            'Saving...'
          ) : (
            'Save Settings'
          )}
        </button>
        <p className="db-save-note">
          Changes take effect on the next incoming call.
        </p>
      </div>
    </div>
  )
}

// ─── Call Row ─────────────────────────────────────────────────────────────────
function CallRow({ call, onView, showTo }) {
  const location = formatLocation(call)
  const msgCount = call.totalMessages ?? call.transcript?.length ?? 0

  return (
    <tr className="db-tr">
      <td>
        <div className="db-caller">
          <span className="db-caller-icon">{Icon.user}</span>
          <div>
            <div>{formatPhone(call.from)}</div>
            {call.callerName && <div className="db-muted" style={{fontSize:'11px'}}>{call.callerName}</div>}
          </div>
        </div>
      </td>
      {showTo ? (
        <td className="db-muted" style={{fontSize:'13px'}}>{location || <span style={{color:'#334155'}}>—</span>}</td>
      ) : null}
      <td className="db-muted">{formatDate(call.startTime)}</td>
      <td>{formatDuration(call.duration)}</td>
      <td>
        <span className="db-msg-count">{msgCount}</span>
      </td>
      <td>
        <span className={`db-pill ${call.status === 'active' ? 'active' : 'done'}`}>
          {call.status === 'active' ? '● Live' : 'Completed'}
        </span>
      </td>
      <td>
        {msgCount > 0 ? (
          <button className="db-btn-view" onClick={onView}>View</button>
        ) : (
          <span className="db-muted">—</span>
        )}
      </td>
    </tr>
  )
}

// ─── Transcript Modal ─────────────────────────────────────────────────────────
function TranscriptModal({ call, onClose }) {
  return (
    <div className="db-modal-bg" onClick={onClose}>
      <div className="db-modal" onClick={e => e.stopPropagation()}>
        <div className="db-modal-header">
          <div>
            <h2>Call Transcript</h2>
            <p className="db-muted">
              {formatPhone(call.from)} · {formatDate(call.startTime)} · {formatDuration(call.duration)}
            </p>
          </div>
          <button className="db-modal-close" onClick={onClose}>{Icon.close}</button>
        </div>

        <div className="db-transcript">
          {(!call.transcript || call.transcript.length === 0) ? (
            <div className="db-empty">No transcript available for this call.</div>
          ) : (
            call.transcript.map((msg, i) => (
              <div key={i} className={`db-msg ${msg.role}`}>
                <div className="db-msg-role">
                  {msg.role === 'agent' ? '🤖 Agent' : '👤 Customer'}
                </div>
                <div className="db-msg-text">{msg.text}</div>
                <div className="db-msg-time">{formatDate(msg.time)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
