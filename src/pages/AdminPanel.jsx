import React, { useState, useEffect, useRef, useCallback } from 'react'
import './AdminPanel.css'

const API = (import.meta.env.VITE_API_URL || 'https://vertex-living.onrender.com') + '/api/admin'
const RENTAL_API = '/api/rental'

// ─── Icons ───────────────────────────────────────────────────────────────────
const Ico = {
  home:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  prop:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
  agent:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  inq:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  pay:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  stg:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  plus:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  edit:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  del:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  save:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>,
  close:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  eye:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  back:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6"/></svg>,
  check:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>,
  warn:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
}

const EMPTY_PROP = { name:'', sector:'', location:'', city:'Gurgaon', type:'Apartment', bedrooms:3, price:'', area:'', status:'Ready to Move', developer:'', photos:[], amenities:[] }

const ALL_AMENITIES = [
  'Swimming Pool','Gymnasium','Club House','24×7 Security','Power Backup',
  'Lift / Elevator','Parking','Children Play Area','Jogging Track','Garden / Park',
  'CCTV Surveillance','Intercom','Fire Safety','Rainwater Harvesting',
  'Rooftop Terrace','Co-working Space','EV Charging','Concierge Service',
  'Spa & Sauna','Basketball Court','Tennis Court','Badminton Court',
]
const EMPTY_AGENT = { name:'', photo:'', experience:'', specialization:'', deals:'', rating:'4.9', topAgent:false, phone:'', email:'' }

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [tab, setTab]             = useState('overview')
  const [properties, setProperties] = useState([])
  const [pendingProps, setPendingProps] = useState([])
  const [agents, setAgents]       = useState([])
  const [inquiries, setInquiries] = useState([])
  const [users, setUsers]         = useState([])
  const [bookings, setBookings]   = useState([])
  const [builderRegs, setBuilderRegs] = useState([])
  const [builderLeads, setBuilderLeads] = useState([])
  const [settings, setSettings]   = useState({})
  const [loading, setLoading]     = useState(true)
  const [toast, setToast]         = useState(null)

  // Modal states
  const [propModal, setPropModal]   = useState(null)   // null | 'add' | {id,...}
  const [agentModal, setAgentModal] = useState(null)
  const propImgRef = useRef(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null) // { type, id, name }
  const [viewInquiry, setViewInquiry] = useState(null)

  // Form states
  const [propForm, setPropForm]   = useState(EMPTY_PROP)
  const [agentForm, setAgentForm] = useState(EMPTY_AGENT)
  const [settingsForm, setSettingsForm] = useState({})
  const [propSearch, setPropSearch] = useState('')
  const [propTypeFilter, setPropTypeFilter] = useState('All')
  const [saving, setSaving] = useState(false)

  // Rental state
  const [rentalProps,     setRentalProps]     = useState([])
  const [rentalUsers,     setRentalUsers]     = useState([])
  const [rentalInquiries, setRentalInquiries] = useState([])
  const [rentalStats,     setRentalStats]     = useState({})
  const [rentalSearch,    setRentalSearch]    = useState('')
  const [rentalTab,       setRentalTab]       = useState('properties') // sub-tab

  useEffect(() => {
    loadAll()
  }, [])

  function loadAll() {
    setLoading(true)
    Promise.all([
      fetch(`${API}/properties`).then(r => r.json()).catch(() => []),
      fetch(`${API}/agents`).then(r => r.json()).catch(() => []),
      fetch(`${API}/inquiries`).then(r => r.json()).catch(() => []),
      fetch(`${API}/settings`).then(r => r.json()).catch(() => ({})),
      fetch(`${API}/users`).then(r => r.json()).catch(() => []),
      fetch(`${API}/pending-properties`).then(r => r.json()).catch(() => []),
      fetch('/api/admin/bookings').then(r => r.json()).catch(() => []),
      fetch('/api/admin/builder-registrations').then(r => r.json()).catch(() => []),
      fetch('/api/admin/builder-leads').then(r => r.json()).catch(() => []),
    ]).then(([props, agts, inqs, stgs, usrs, pending, bkgs, bregs, bleads]) => {
      setProperties(props)
      setAgents(agts)
      setInquiries(inqs)
      setSettings(stgs)
      setSettingsForm(stgs)
      setUsers(usrs)
      setPendingProps(Array.isArray(pending) ? pending : [])
      setBookings(Array.isArray(bkgs) ? bkgs : [])
      setBuilderRegs(Array.isArray(bregs) ? bregs : [])
      setBuilderLeads(Array.isArray(bleads) ? bleads : [])
      setLoading(false)
    })
    // Rental data
    Promise.all([
      fetch(`${RENTAL_API}/admin/stats`).then(r => r.json()).catch(() => ({})),
      fetch(`${RENTAL_API}/admin/properties`).then(r => r.json()).catch(() => []),
      fetch(`${RENTAL_API}/admin/users`).then(r => r.json()).catch(() => []),
      fetch(`${RENTAL_API}/admin/inquiries`).then(r => r.json()).catch(() => []),
    ]).then(([stats, rProps, rUsers, rInqs]) => {
      setRentalStats(stats)
      if (Array.isArray(rProps)) setRentalProps(rProps)
      if (Array.isArray(rUsers)) setRentalUsers(rUsers)
      if (Array.isArray(rInqs)) setRentalInquiries(rInqs)
    })
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }

  // ─── Property CRUD ────────────────────────────────────────────────────────
  function openAddProp() {
    setPropForm(EMPTY_PROP)
    setPropModal('add')
  }
  function openEditProp(p) {
    setPropForm({ ...p, photos: p.photos || [], amenities: p.amenities || [] })
    setPropModal(p)
  }

  async function handlePropImageUpload(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return
    const fd = new FormData()
    files.forEach(f => fd.append('files', f))
    try {
      const res = await fetch('/api/builder/upload-files', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.urls) {
        setPropForm(s => ({ ...s, photos: [...(s.photos || []), ...data.urls] }))
        showToast(`${data.urls.length} image(s) uploaded`)
      }
    } catch { showToast('Image upload failed', 'error') }
  }

  function toggleAmenity(a) {
    setPropForm(s => {
      const list = s.amenities || []
      return { ...s, amenities: list.includes(a) ? list.filter(x => x !== a) : [...list, a] }
    })
  }

  async function saveProp() {
    if (!propForm.name || !propForm.price) { showToast('Property name & price required', 'error'); return }
    setSaving(true)
    const isEdit = propModal !== 'add'
    const url = isEdit ? `${API}/properties/${propModal.id}` : `${API}/properties`
    const method = isEdit ? 'PUT' : 'POST'
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(propForm) })
      const saved = await res.json()
      if (isEdit) setProperties(prev => prev.map(p => p.id === saved.id ? saved : p))
      else setProperties(prev => [...prev, saved])
      setPropModal(null)
      showToast(isEdit ? 'Property updated!' : 'Property added!')
    } catch { showToast('Save failed. Is the server running?', 'error') }
    setSaving(false)
  }
  function confirmDeleteProp(p) {
    setDeleteConfirm({ type: 'property', id: p.id, name: p.name })
  }
  async function deleteProp(id) {
    try {
      await fetch(`${API}/properties/${id}`, { method: 'DELETE' })
      setProperties(prev => prev.filter(p => p.id !== id))
      showToast('Property deleted')
    } catch { showToast('Delete failed', 'error') }
    setDeleteConfirm(null)
  }

  // ─── Pending Properties ──────────────────────────────────────────────────
  async function approvePending(id) {
    try {
      const res = await fetch(`${API}/pending-properties/${id}/approve`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Approve failed', 'error'); return }
      setPendingProps(prev => prev.filter(p => p.id !== id))
      setProperties(prev => [...prev, data.property])
      showToast('Property approved and now live!')
      // Notify homepage to refresh (same tab)
      window.dispatchEvent(new Event('focus'))
    } catch { showToast('Server error', 'error') }
  }
  async function rejectPending(id, name) {
    try {
      await fetch(`${API}/pending-properties/${id}`, { method: 'DELETE' })
      setPendingProps(prev => prev.filter(p => p.id !== id))
      showToast(`"${name}" rejected and removed`)
    } catch { showToast('Server error', 'error') }
  }

  // ─── Agent CRUD ───────────────────────────────────────────────────────────
  function openAddAgent() {
    setAgentForm(EMPTY_AGENT)
    setAgentModal('add')
  }
  function openEditAgent(a) {
    setAgentForm({ ...a })
    setAgentModal(a)
  }
  async function saveAgent() {
    if (!agentForm.name) { showToast('Agent name required', 'error'); return }
    setSaving(true)
    const isEdit = agentModal !== 'add'
    const url = isEdit ? `${API}/agents/${agentModal.id}` : `${API}/agents`
    const method = isEdit ? 'PUT' : 'POST'
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(agentForm) })
      const saved = await res.json()
      if (isEdit) setAgents(prev => prev.map(a => a.id === saved.id ? saved : a))
      else setAgents(prev => [...prev, saved])
      setAgentModal(null)
      showToast(isEdit ? 'Agent updated!' : 'Agent added!')
    } catch { showToast('Save failed. Is the server running?', 'error') }
    setSaving(false)
  }
  function confirmDeleteAgent(a) {
    setDeleteConfirm({ type: 'agent', id: a.id, name: a.name })
  }
  async function deleteAgent(id) {
    try {
      await fetch(`${API}/agents/${id}`, { method: 'DELETE' })
      setAgents(prev => prev.filter(a => a.id !== id))
      showToast('Agent deleted')
    } catch { showToast('Delete failed', 'error') }
    setDeleteConfirm(null)
  }

  // ─── Settings save ────────────────────────────────────────────────────────
  async function saveSettings() {
    setSaving(true)
    try {
      const res = await fetch(`${API}/settings`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settingsForm) })
      const saved = await res.json()
      setSettings(saved)
      showToast('Settings saved!')
    } catch { showToast('Save failed. Is the server running?', 'error') }
    setSaving(false)
  }

  // ─── Inquiry actions ──────────────────────────────────────────────────────
  async function markRead(id) {
    await fetch(`${API}/inquiries/${id}/read`, { method: 'PATCH' }).catch(() => {})
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, read: true } : i))
  }
  async function deleteInquiry(id) {
    try {
      await fetch(`${API}/inquiries/${id}`, { method: 'DELETE' })
      setInquiries(prev => prev.filter(i => i.id !== id))
      setViewInquiry(null)
      showToast('Inquiry deleted')
    } catch { showToast('Delete failed', 'error') }
    setDeleteConfirm(null)
  }

  // ─── User actions ─────────────────────────────────────────────────────────
  async function deleteUser(id) {
    try {
      await fetch(`${API}/users/${id}`, { method: 'DELETE' })
      setUsers(prev => prev.filter(u => u.id !== id))
      showToast('User deleted')
    } catch { showToast('Delete failed', 'error') }
    setDeleteConfirm(null)
  }

  // ─── Filtered properties ──────────────────────────────────────────────────
  const filteredProps = properties.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(propSearch.toLowerCase()) ||
                        p.location.toLowerCase().includes(propSearch.toLowerCase()) ||
                        p.sector.toLowerCase().includes(propSearch.toLowerCase())
    const matchType   = propTypeFilter === 'All' || p.type === propTypeFilter
    return matchSearch && matchType
  })

  const unreadCount = inquiries.filter(i => !i.read).length

  // ─── Stats ────────────────────────────────────────────────────────────────
  const stats = {
    totalProps: properties.length,
    readyProps: properties.filter(p => p.status === 'Ready to Move').length,
    underConst: properties.filter(p => p.status === 'Under Construction').length,
    totalAgents: agents.length,
    topAgents:   agents.filter(a => a.topAgent).length,
    inquiries:   inquiries.length,
    unread:      unreadCount,
  }

  if (loading) return (
    <div className="ap-loading">
      <div className="ap-spinner"/>
      <p>Loading admin panel...</p>
    </div>
  )

  return (
    <div className="ap-root">
      {/* ── Sidebar ── */}
      <aside className="ap-sidebar">
        <div className="ap-brand">
          <span className="ap-brand-icon">V</span>
          <div>
            <div className="ap-brand-name">Vertex Living</div>
            <div className="ap-brand-sub">Admin Panel</div>
          </div>
        </div>

        <nav className="ap-nav">
          {[
            { key: 'overview',      icon: Ico.home,  label: 'Overview' },
            { key: 'properties',    icon: Ico.prop,  label: 'Properties', badge: stats.totalProps },
            { key: 'pending',       icon: Ico.warn,  label: 'Pending',   badge: pendingProps.length || null, badgeAlert: pendingProps.length > 0 },
            { key: 'builder-regs',  icon: Ico.prop,  label: 'Builder Apps',  badge: builderRegs.filter(r => r.status === 'pending').length || null, badgeAlert: true },
            { key: 'builder-leads', icon: Ico.inq,   label: 'Builder Leads', badge: builderLeads.filter(l => l.status === 'new').length || null, badgeAlert: true },
            { key: 'agents',        icon: Ico.agent, label: 'Agents',    badge: stats.totalAgents },
            { key: 'inquiries',     icon: Ico.inq,   label: 'Inquiries', badge: unreadCount || null, badgeAlert: true },
            { key: 'users',         icon: Ico.agent, label: 'Users',     badge: users.filter(u => u.role === 'buyer').length || null },
            { key: 'payments',      icon: Ico.pay,   label: 'Payments',  badge: bookings.length || null },
            { key: 'rental',        icon: Ico.home,  label: 'Rental', badge: rentalProps.length || null },
            { key: 'settings',      icon: Ico.stg,   label: 'Settings' },
          ].map(item => (
            <button
              key={item.key}
              className={`ap-nav-item ${tab === item.key ? 'active' : ''}`}
              onClick={() => setTab(item.key)}
            >
              <span className="ap-nav-icon">{item.icon}</span>
              <span className="ap-nav-label">{item.label}</span>
              {item.badge ? (
                <span className={`ap-nav-badge ${item.badgeAlert ? 'alert' : ''}`}>{item.badge}</span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="ap-sidebar-footer">
          <a href="/" className="ap-back-link">
            {Ico.back} Back to Site
          </a>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="ap-main">
        {/* Overview */}
        {tab === 'overview' && (
          <div className="ap-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div>
                <h1 className="ap-title" style={{ margin: 0 }}>Dashboard Overview</h1>
                <p className="ap-subtitle" style={{ marginBottom: 0 }}>Manage your website content from here</p>
              </div>
              <button
                className="ap-btn ap-btn-outline"
                onClick={() => loadAll()}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                Refresh
              </button>
            </div>

            <div className="ap-stat-grid">
              <StatCard label="Total Properties" value={stats.totalProps} sub="in database" color="blue" onClick={() => setTab('properties')} />
              <StatCard label="Ready to Move" value={stats.readyProps} sub="properties" color="green" onClick={() => setTab('properties')} />
              <StatCard label="Under Construction" value={stats.underConst} sub="properties" color="orange" onClick={() => setTab('properties')} />
              <StatCard label="Total Agents" value={stats.totalAgents} sub={`${stats.topAgents} top agents`} color="purple" onClick={() => setTab('agents')} />
              <StatCard label="New Inquiries" value={stats.unread} sub="unread messages" color={stats.unread > 0 ? 'red' : 'gray'} onClick={() => setTab('inquiries')} />
              <StatCard label="Total Inquiries" value={stats.inquiries} sub="all time" color="teal" onClick={() => setTab('inquiries')} />
              <StatCard label="Registered Users" value={users.filter(u => u.role === 'buyer').length} sub="buyers on platform" color="blue" onClick={() => setTab('users')} />
              <StatCard label="Total Bookings" value={bookings.length} sub={`₹${(bookings.reduce((s, b) => s + (b.tokenAmount || 0), 0) / 1e5).toFixed(1)}L collected`} color="green" onClick={() => setTab('payments')} />
            </div>

            <div className="ap-quick-actions">
              <h2 className="ap-section-title">Quick Actions</h2>
              <div className="ap-qa-grid">
                <QuickAction icon={Ico.plus} label="Add New Property" onClick={() => { setTab('properties'); openAddProp() }} color="blue" />
                <QuickAction icon={Ico.plus} label="Add New Agent" onClick={() => { setTab('agents'); openAddAgent() }} color="purple" />
                <QuickAction icon={Ico.inq} label={`View Inquiries ${unreadCount > 0 ? `(${unreadCount} new)` : ''}`} onClick={() => setTab('inquiries')} color="orange" />
                <QuickAction icon={Ico.stg} label="Edit Site Settings" onClick={() => setTab('settings')} color="teal" />
              </div>
            </div>
          </div>
        )}

        {/* Properties */}
        {tab === 'properties' && (
          <div className="ap-section">
            <div className="ap-section-header">
              <div>
                <h1 className="ap-title">Properties</h1>
                <p className="ap-subtitle">{properties.length} properties total</p>
              </div>
              <button className="ap-btn ap-btn-primary" onClick={openAddProp}>
                {Ico.plus} Add Property
              </button>
            </div>

            {/* Filters */}
            <div className="ap-filters">
              <div className="ap-search-box">
                {Ico.search}
                <input
                  type="text"
                  placeholder="Search by name, location, sector..."
                  value={propSearch}
                  onChange={e => setPropSearch(e.target.value)}
                />
              </div>
              <select className="ap-select" value={propTypeFilter} onChange={e => setPropTypeFilter(e.target.value)}>
                <option value="All">All Types</option>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            {/* Date-grouped table */}
            {filteredProps.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>No properties found</div>
            ) : (() => {
              const sorted = [...filteredProps].sort((a, b) => new Date(b.listedAt || 0) - new Date(a.listedAt || 0));
              const groups = {};
              sorted.forEach(p => {
                const day = p.listedAt
                  ? new Date(p.listedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
                  : 'No Date';
                if (!groups[day]) groups[day] = [];
                groups[day].push(p);
              });
              return Object.entries(groups).map(([day, dayProps]) => (
                <div key={day} style={{ marginBottom: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 8, padding: '5px 14px', fontSize: 13, fontWeight: 700, color: '#a5b4fc', whiteSpace: 'nowrap' }}>
                      📅 {day}
                    </div>
                    <div style={{ flex: 1, height: 1, background: 'rgba(99,102,241,0.1)' }} />
                    <div style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
                      {dayProps.length} propert{dayProps.length > 1 ? 'ies' : 'y'}
                    </div>
                  </div>
                  <div className="ap-table-wrap">
                    <table className="ap-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Property Name</th>
                          <th>Type</th>
                          <th>Sector</th>
                          <th>BHK</th>
                          <th>Price</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dayProps.map((p, i) => (
                          <tr key={p.id}>
                            <td className="ap-td-num">{i + 1}</td>
                            <td className="ap-td-name">
                              <span className="ap-prop-name">{p.name}</span>
                              <span className="ap-prop-loc">{p.location}</span>
                            </td>
                            <td><TypeBadge type={p.type} /></td>
                            <td>{p.sector}</td>
                            <td>{p.bedrooms > 0 ? `${p.bedrooms} BHK` : '—'}</td>
                            <td className="ap-td-price">{p.priceDisplay}</td>
                            <td><StatusBadge status={p.status} /></td>
                            <td>
                              <div className="ap-actions">
                                <button className="ap-icon-btn edit" title="Edit" onClick={() => openEditProp(p)}>{Ico.edit}</button>
                                <button className="ap-icon-btn del" title="Delete" onClick={() => confirmDeleteProp(p)}>{Ico.del}</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ));
            })()}
          </div>
        )}

        {/* Agents */}
        {tab === 'agents' && (
          <div className="ap-section">
            <div className="ap-section-header">
              <div>
                <h1 className="ap-title">Agents</h1>
                <p className="ap-subtitle">{agents.length} agents listed on site</p>
              </div>
              <button className="ap-btn ap-btn-primary" onClick={openAddAgent}>
                {Ico.plus} Add Agent
              </button>
            </div>

            <div className="ap-agent-grid">
              {agents.map(a => (
                <div key={a.id} className={`ap-agent-card ${a.topAgent ? 'top' : ''}`}>
                  {a.topAgent && <div className="ap-top-badge">Top Agent</div>}
                  <img
                    src={a.photo || 'https://via.placeholder.com/80'}
                    alt={a.name}
                    className="ap-agent-photo"
                    onError={e => { e.target.src = 'https://via.placeholder.com/80' }}
                  />
                  <div className="ap-agent-info">
                    <h3 className="ap-agent-name">{a.name}</h3>
                    <p className="ap-agent-spec">{a.specialization}</p>
                    <div className="ap-agent-stats">
                      <span>{a.experience} yrs exp</span>
                      <span>{a.deals} deals</span>
                      <span>★ {a.rating}</span>
                    </div>
                    {a.phone && <p className="ap-agent-contact">{a.phone}</p>}
                  </div>
                  <div className="ap-agent-actions">
                    <button className="ap-btn ap-btn-sm ap-btn-outline" onClick={() => openEditAgent(a)}>{Ico.edit} Edit</button>
                    <button className="ap-btn ap-btn-sm ap-btn-danger"  onClick={() => confirmDeleteAgent(a)}>{Ico.del} Delete</button>
                  </div>
                </div>
              ))}
              {agents.length === 0 && <div className="ap-empty-card">No agents added yet. Click "Add Agent" to start.</div>}
            </div>
          </div>
        )}

        {/* Inquiries */}
        {tab === 'inquiries' && (
          <div className="ap-section">
            <div className="ap-section-header">
              <div>
                <h1 className="ap-title">Inquiries</h1>
                <p className="ap-subtitle">{inquiries.length} total — {unreadCount} unread</p>
              </div>
              <button className="ap-btn ap-btn-outline" onClick={loadAll}>↻ Refresh</button>
            </div>

            {inquiries.length === 0 ? (
              <div className="ap-empty-state">
                <div className="ap-empty-icon">{Ico.inq}</div>
                <h3>No inquiries yet</h3>
                <p>When visitors submit contact forms on your site, they will appear here.</p>
              </div>
            ) : (() => {
              const sorted = [...inquiries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
              const groups = {};
              sorted.forEach(inq => {
                const day = inq.createdAt
                  ? new Date(inq.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
                  : 'Unknown Date';
                if (!groups[day]) groups[day] = [];
                groups[day].push(inq);
              });
              return Object.entries(groups).map(([day, dayInqs]) => (
                <div key={day} style={{ marginBottom: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 8, padding: '5px 14px', fontSize: 13, fontWeight: 700, color: '#a5b4fc', whiteSpace: 'nowrap' }}>
                      📅 {day}
                    </div>
                    <div style={{ flex: 1, height: 1, background: 'rgba(99,102,241,0.1)' }} />
                    <div style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
                      {dayInqs.length} inquiry{dayInqs.length > 1 ? 's' : ''} · {dayInqs.filter(i => !i.read).length} unread
                    </div>
                  </div>
                  <div className="ap-table-wrap">
                    <table className="ap-table">
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>Name</th>
                          <th>Phone</th>
                          <th>Type</th>
                          <th>Budget</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dayInqs.map(inq => (
                          <tr key={inq.id} className={!inq.read ? 'ap-tr-unread' : ''}>
                            <td className="ap-td-date" style={{ fontSize: 12, color: '#64748b' }}>
                              {inq.createdAt ? new Date(inq.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—'}
                            </td>
                            <td className="ap-td-name">
                              <span className="ap-prop-name">{inq.name || inq.company || '—'}</span>
                              <span className="ap-prop-loc">{inq.email || ''}</span>
                            </td>
                            <td>{inq.phone || '—'}</td>
                            <td>{inq.type || inq.enquiry || '—'}</td>
                            <td>{inq.budget || '—'}</td>
                            <td>
                              {inq.read
                                ? <span className="ap-status-badge ready">Read</span>
                                : <span className="ap-status-badge new">New</span>
                              }
                            </td>
                            <td>
                              <div className="ap-actions">
                                <button className="ap-icon-btn view" title="View Details" onClick={() => { setViewInquiry(inq); markRead(inq.id) }}>{Ico.eye}</button>
                                <button className="ap-icon-btn del" title="Delete" onClick={() => setDeleteConfirm({ type: 'inquiry', id: inq.id, name: inq.name || inq.company })}>{Ico.del}</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ));
            })()}
          </div>
        )}

        {/* Pending Builder Listings */}
        {tab === 'pending' && (
          <div className="ap-section">
            <div className="ap-section-header">
              <div>
                <h1 className="ap-title">Pending Builder Listings</h1>
                <p className="ap-subtitle">
                  {pendingProps.length === 0
                    ? 'No pending listings — all caught up!'
                    : `${pendingProps.length} listing${pendingProps.length > 1 ? 's' : ''} awaiting review`}
                </p>
              </div>
            </div>

            {pendingProps.length === 0 ? (
              <div className="ap-empty">
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✅</div>
                <p>No pending listings to review.</p>
              </div>
            ) : (
              <div className="ap-pending-list">
                {pendingProps.map(p => (
                  <div key={p.id} className="ap-pending-card">
                    {p.photos?.[0] && (
                      <img src={p.photos[0]} alt={p.name} className="ap-pending-img" />
                    )}
                    <div className="ap-pending-body">
                      <div className="ap-pending-name">{p.name}</div>
                      <div className="ap-pending-meta">
                        <span>{p.type}</span>
                        <span>{p.bedrooms} BHK</span>
                        <span>{p.priceDisplay || `₹${p.price} Cr`}</span>
                        <span>{p.status}</span>
                      </div>
                      <div className="ap-pending-loc">{p.location}</div>
                      {p.developer && <div className="ap-pending-dev">by {p.developer}</div>}
                      {p.description && <p className="ap-pending-desc">{p.description}</p>}
                      <div className="ap-pending-date">
                        Submitted: {new Date(p.listedAt).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="ap-pending-actions">
                      <button
                        className="ap-approve-btn"
                        onClick={() => approvePending(p.id)}
                      >
                        {Ico.check} Approve &amp; Go Live
                      </button>
                      <button
                        className="ap-reject-btn"
                        onClick={() => rejectPending(p.id, p.name)}
                      >
                        {Ico.del} Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Builder Applications */}
        {tab === 'builder-regs' && (
          <div className="ap-section">
            <div className="ap-section-header">
              <div>
                <h1 className="ap-title">Builder Applications</h1>
                <p className="ap-subtitle">
                  {builderRegs.length === 0
                    ? 'No builder applications yet.'
                    : `${builderRegs.length} application${builderRegs.length !== 1 ? 's' : ''} — ${builderRegs.filter(r => r.status === 'pending').length} pending review`}
                </p>
              </div>
            </div>

            {builderRegs.length === 0 ? (
              <div className="ap-empty">
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🏗</div>
                <p>No builder applications received yet.</p>
              </div>
            ) : (
              <div className="ap-table-wrap">
                <table className="ap-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Contact</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>RERA No.</th>
                      <th>Project</th>
                      <th>City</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {builderRegs.map(r => (
                      <tr key={r.id}>
                        <td><strong>{r.companyName}</strong></td>
                        <td>{r.contactName}</td>
                        <td>{r.phone}</td>
                        <td style={{ fontSize: '0.78rem' }}>{r.email}</td>
                        <td><code style={{ fontSize: '0.78rem', background: 'rgba(99,102,241,0.12)', padding: '2px 6px', borderRadius: 4 }}>{r.reraNumber}</code></td>
                        <td>{r.projectName}</td>
                        <td>{r.city || '—'}</td>
                        <td style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>
                          {new Date(r.submittedAt).toLocaleDateString('en-IN')}
                        </td>
                        <td>
                          <span style={{
                            padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                            background: r.status === 'approved' ? 'rgba(34,197,94,0.15)' : r.status === 'rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                            color: r.status === 'approved' ? '#22c55e' : r.status === 'rejected' ? '#f87171' : '#f59e0b',
                          }}>
                            {r.status === 'approved' ? '✅ Approved' : r.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
                          </span>
                        </td>
                        <td>
                          {r.status === 'pending' && (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="ap-approve-btn" style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                                onClick={async () => {
                                  await fetch(`/api/admin/builder-registrations/${r.id}`, {
                                    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: 'approved' }),
                                  });
                                  setBuilderRegs(prev => prev.map(x => x.id === r.id ? { ...x, status: 'approved' } : x));
                                  showToast(`${r.companyName} approved`);
                                }}>
                                {Ico.check} Approve
                              </button>
                              <button className="ap-reject-btn" style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                                onClick={async () => {
                                  await fetch(`/api/admin/builder-registrations/${r.id}`, {
                                    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: 'rejected' }),
                                  });
                                  setBuilderRegs(prev => prev.map(x => x.id === r.id ? { ...x, status: 'rejected' } : x));
                                  showToast(`${r.companyName} rejected`, 'error');
                                }}>
                                {Ico.del} Reject
                              </button>
                            </div>
                          )}
                          {r.message && (
                            <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)', marginTop: 4, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                              title={r.message}>
                              💬 {r.message}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Builder Leads */}
        {tab === 'builder-leads' && (
          <div className="ap-section">
            <div className="ap-section-header">
              <div>
                <h1 className="ap-title">Builder Leads</h1>
                <p className="ap-subtitle">
                  {builderLeads.length === 0
                    ? 'No leads yet — leads appear when visitors click "Contact Builder".'
                    : `${builderLeads.length} lead${builderLeads.length !== 1 ? 's' : ''} · ${builderLeads.filter(l => l.status === 'new').length} new`}
                </p>
              </div>
            </div>

            {builderLeads.length === 0 ? (
              <div className="ap-empty">
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
                <p>No leads yet. They will appear here when buyers click "Contact Builder".</p>
              </div>
            ) : (
              <div className="ap-table-wrap">
                <table className="ap-table">
                  <thead>
                    <tr>
                      <th>Client Name</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Interested Property</th>
                      <th>Builder</th>
                      <th>Config</th>
                      <th>Price</th>
                      <th>Message</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {builderLeads.map(l => (
                      <tr key={l.id}>
                        <td><strong>{l.clientName}</strong></td>
                        <td>
                          <a href={`tel:${l.clientPhone}`} style={{ color: '#a5b4fc', textDecoration: 'none' }}>
                            {l.clientPhone}
                          </a>
                        </td>
                        <td style={{ fontSize: '0.78rem' }}>{l.clientEmail || '—'}</td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#e2e8f0' }}>{l.propertyName}</div>
                          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>📍 {l.propertyLocation}</div>
                        </td>
                        <td>
                          <span style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', padding: '2px 8px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600 }}>
                            {l.builderName}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>{l.propertyConfig || '—'}</td>
                        <td style={{ fontWeight: 600, color: '#34d399', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{l.propertyPrice || '—'}</td>
                        <td style={{ maxWidth: 160 }}>
                          {l.clientMessage ? (
                            <span style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.45)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {l.clientMessage}
                            </span>
                          ) : <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.76rem' }}>—</span>}
                        </td>
                        <td style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>
                          {new Date(l.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td>
                          <select
                            value={l.status}
                            style={{ background: l.status === 'new' ? 'rgba(99,102,241,0.15)' : l.status === 'contacted' ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)',
                                     color: l.status === 'new' ? '#a5b4fc' : l.status === 'contacted' ? '#f59e0b' : '#22c55e',
                                     border: 'none', borderRadius: 8, padding: '4px 8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                            onChange={async e => {
                              const newStatus = e.target.value;
                              await fetch(`/api/admin/builder-leads/${l.id}`, {
                                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: newStatus }),
                              });
                              setBuilderLeads(prev => prev.map(x => x.id === l.id ? { ...x, status: newStatus } : x));
                            }}
                          >
                            <option value="new">🔵 New</option>
                            <option value="contacted">🟡 Contacted</option>
                            <option value="closed">✅ Closed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (() => {
          const builders = [...users].filter(u => u.role === 'builder').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          const buyers   = [...users].filter(u => u.role === 'buyer').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          const groupByDate = list => {
            const groups = {};
            list.forEach(u => {
              const day = u.createdAt
                ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
                : 'Unknown Date';
              if (!groups[day]) groups[day] = [];
              groups[day].push(u);
            });
            return groups;
          };

          const UserTable = ({ list, accentColor, accentBg }) => {
            const groups = groupByDate(list);
            if (list.length === 0) return (
              <div style={{ textAlign: 'center', padding: '32px', color: '#64748b', fontSize: 13 }}>No users registered yet.</div>
            );
            return Object.entries(groups).map(([day, dayUsers]) => (
              <div key={day} style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 8, padding: '4px 13px', fontSize: 12, fontWeight: 700, color: '#a5b4fc', whiteSpace: 'nowrap' }}>
                    📅 {day}
                  </div>
                  <div style={{ flex: 1, height: 1, background: 'rgba(99,102,241,0.1)' }} />
                  <div style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>{dayUsers.length} user{dayUsers.length > 1 ? 's' : ''}</div>
                </div>
                <div className="ap-table-wrap">
                  <table className="ap-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Time</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayUsers.map(u => (
                        <tr key={u.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 32, height: 32, borderRadius: '50%', background: accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: accentColor, flexShrink: 0 }}>
                                {u.name?.[0]?.toUpperCase()}
                              </div>
                              <span style={{ fontWeight: 500 }}>{u.name}</span>
                            </div>
                          </td>
                          <td>{u.email}</td>
                          <td>{u.phone || '—'}</td>
                          <td style={{ fontSize: 12, color: '#64748b' }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—'}
                          </td>
                          <td>
                            <button className="ap-btn ap-btn-danger" style={{ padding: '4px 10px', fontSize: 12 }}
                              onClick={() => setDeleteConfirm({ type: 'user', id: u.id, name: u.name })}>
                              {Ico.del}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ));
          };

          return (
            <div className="ap-section">
              <div className="ap-section-header">
                <div>
                  <h1 className="ap-title">Registered Users</h1>
                  <p className="ap-subtitle">{builders.length} builders · {buyers.length} buyers</p>
                </div>
                <button className="ap-btn ap-btn-outline" onClick={loadAll}>↻ Refresh</button>
              </div>

              {/* Builders block */}
              <div style={{ marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{ background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.3)', borderRadius: 10, padding: '7px 18px', fontSize: 14, fontWeight: 800, color: '#fb923c' }}>
                    🏗️ Builders
                  </div>
                  <div style={{ flex: 1, height: 1, background: 'rgba(251,146,60,0.15)' }} />
                  <div style={{ fontSize: 13, color: '#fb923c', fontWeight: 600 }}>{builders.length} total</div>
                </div>
                <UserTable list={builders} accentColor="#fb923c" accentBg="rgba(251,146,60,0.15)" />
              </div>

              {/* Buyers block */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, padding: '7px 18px', fontSize: 14, fontWeight: 800, color: '#4ade80' }}>
                    🛒 Buyers
                  </div>
                  <div style={{ flex: 1, height: 1, background: 'rgba(34,197,94,0.12)' }} />
                  <div style={{ fontSize: 13, color: '#4ade80', fontWeight: 600 }}>{buyers.length} total</div>
                </div>
                <UserTable list={buyers} accentColor="#4ade80" accentBg="rgba(34,197,94,0.15)" />
              </div>
            </div>
          );
        })()}

        {/* Payments */}
        {tab === 'payments' && (
          <div className="ap-section">
            <div className="ap-section-header">
              <div>
                <h1 className="ap-title">Payment Bookings</h1>
                <p className="ap-subtitle">
                  {bookings.length} bookings · ₹{(bookings.reduce((s, b) => s + (b.tokenAmount || 0), 0) / 1e5).toFixed(2)}L total collected
                </p>
              </div>
              <button className="ap-btn ap-btn-outline" onClick={loadAll}>↻ Refresh</button>
            </div>

            {/* Summary Cards */}
            <div className="ap-stat-grid" style={{ marginBottom: 24 }}>
              <div className="ap-stat-card green">
                <div className="ap-stat-value">{bookings.filter(b => b.status === 'confirmed').length}</div>
                <div className="ap-stat-label">Confirmed</div>
                <div className="ap-stat-sub">payments</div>
              </div>
              <div className="ap-stat-card blue">
                <div className="ap-stat-value">
                  ₹{(bookings.reduce((s, b) => s + (b.tokenAmount || 0), 0) / 1e5).toFixed(1)}L
                </div>
                <div className="ap-stat-label">Total Collected</div>
                <div className="ap-stat-sub">token amount</div>
              </div>
              <div className="ap-stat-card purple">
                <div className="ap-stat-value">
                  {bookings.length > 0 ? [...new Set(bookings.map(b => b.propertyId))].length : 0}
                </div>
                <div className="ap-stat-label">Properties Booked</div>
                <div className="ap-stat-sub">unique properties</div>
              </div>
              <div className="ap-stat-card orange">
                <div className="ap-stat-value">
                  {bookings.length > 0
                    ? '₹' + ((bookings.reduce((s, b) => s + (b.tokenAmount || 0), 0) / bookings.length) / 1e5).toFixed(1) + 'L'
                    : '—'}
                </div>
                <div className="ap-stat-label">Avg Token</div>
                <div className="ap-stat-sub">per booking</div>
              </div>
            </div>

            {bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                No bookings yet. Payments will appear here after checkout.
              </div>
            ) : (() => {
              // Group bookings by date (newest date first, newest booking first within day)
              const sorted = [...bookings].sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));
              const groups = {};
              sorted.forEach(b => {
                const day = b.bookedAt
                  ? new Date(b.bookedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
                  : 'Unknown Date';
                if (!groups[day]) groups[day] = [];
                groups[day].push(b);
              });
              return Object.entries(groups).map(([day, dayBookings]) => (
                <div key={day} style={{ marginBottom: 32 }}>
                  {/* Date separator */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12,
                  }}>
                    <div style={{
                      background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
                      borderRadius: 8, padding: '5px 14px', fontSize: 13, fontWeight: 700,
                      color: '#a5b4fc', whiteSpace: 'nowrap',
                    }}>
                      📅 {day}
                    </div>
                    <div style={{ flex: 1, height: 1, background: 'rgba(99,102,241,0.12)' }} />
                    <div style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
                      {dayBookings.length} booking{dayBookings.length > 1 ? 's' : ''} · ₹{dayBookings.reduce((s, b) => s + (b.tokenAmount || 0), 0).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="ap-table-wrap">
                    <table className="ap-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Property</th>
                          <th>Buyer</th>
                          <th>Contact</th>
                          <th>Token Paid</th>
                          <th>Property Price</th>
                          <th>Payment ID</th>
                          <th>Time</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dayBookings.map((b, i) => (
                          <tr key={b.id}>
                            <td style={{ color: '#64748b', fontSize: 12 }}>{i + 1}</td>
                            <td>
                              <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{b.propertyName || '—'}</div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>ID: {b.propertyId}</div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 500 }}>{b.userName || '—'}</div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>{b.userEmail || ''}</div>
                            </td>
                            <td style={{ fontSize: 13 }}>{b.userPhone || '—'}</td>
                            <td>
                              <span style={{ color: '#4ade80', fontWeight: 700 }}>
                                ₹{b.tokenAmount ? Number(b.tokenAmount).toLocaleString('en-IN') : '—'}
                              </span>
                            </td>
                            <td style={{ color: '#94a3b8' }}>
                              {b.propertyPrice ? '₹' + b.propertyPrice + ' Cr' : '—'}
                            </td>
                            <td>
                              <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#818cf8' }}>
                                {b.paymentId || '—'}
                              </span>
                            </td>
                            <td style={{ fontSize: 12, color: '#64748b' }}>
                              {b.bookedAt ? new Date(b.bookedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—'}
                            </td>
                            <td>
                              <span style={{
                                padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                                background: b.status === 'confirmed' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                                color: b.status === 'confirmed' ? '#4ade80' : '#f87171',
                                border: `1px solid ${b.status === 'confirmed' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                              }}>
                                {b.status === 'confirmed' ? '✓ Confirmed' : b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ));
            })()}
          </div>
        )}

        {/* Settings */}
        {tab === 'settings' && (
          <div className="ap-section">
            <div className="ap-section-header">
              <div>
                <h1 className="ap-title">Site Settings</h1>
                <p className="ap-subtitle">Edit your company information & contact details</p>
              </div>
              <button className="ap-btn ap-btn-primary" onClick={saveSettings} disabled={saving}>
                {saving ? 'Saving...' : <>{Ico.save} Save Changes</>}
              </button>
            </div>

            <div className="ap-settings-grid">
              <SettingsGroup title="Luxury / Budget Filter">
                <SettingsField
                  label="Luxury Threshold (Crore)"
                  value={settingsForm.luxuryThreshold ?? 7}
                  onChange={v => setSettingsForm(s => ({ ...s, luxuryThreshold: v }))}
                  type="number"
                  placeholder="e.g. 7 means ₹7Cr+ = Luxury, below = Budget"
                />
                <SettingsField
                  label="Luxury Button Label"
                  value={settingsForm.luxuryLabel || ''}
                  onChange={v => setSettingsForm(s => ({ ...s, luxuryLabel: v }))}
                  placeholder="e.g. Luxury / Premium / High-End"
                />
                <SettingsField
                  label="Budget Button Label"
                  value={settingsForm.budgetLabel || ''}
                  onChange={v => setSettingsForm(s => ({ ...s, budgetLabel: v }))}
                  placeholder="e.g. Budget / Affordable / Mid-Range"
                />
              </SettingsGroup>

              <SettingsGroup title="Company Info">
                <SettingsField label="Company Name" value={settingsForm.companyName || ''} onChange={v => setSettingsForm(s => ({ ...s, companyName: v }))} />
                <SettingsField label="Tagline (Hero)" value={settingsForm.tagline || ''} onChange={v => setSettingsForm(s => ({ ...s, tagline: v }))} />
                <SettingsField label="Hero Subtitle" value={settingsForm.heroSubtitle || ''} onChange={v => setSettingsForm(s => ({ ...s, heroSubtitle: v }))} />
                <SettingsField label="About Us Text" value={settingsForm.aboutText || ''} onChange={v => setSettingsForm(s => ({ ...s, aboutText: v }))} type="textarea" />
              </SettingsGroup>

              <SettingsGroup title="Hero Section Text">
                <SettingsField label="Hero Title" value={settingsForm.heroTitle || ''} onChange={v => setSettingsForm(s => ({ ...s, heroTitle: v }))} placeholder="Builder to Buyer." />
                <SettingsField label="Hero Title Highlight" value={settingsForm.heroTitleHighlight || ''} onChange={v => setSettingsForm(s => ({ ...s, heroTitleHighlight: v }))} placeholder="Zero Brokerage." />
                <SettingsField label="Hero Description" value={settingsForm.heroDescription || ''} onChange={v => setSettingsForm(s => ({ ...s, heroDescription: v }))} type="textarea" placeholder="Buy directly from verified builders..." />
                <SettingsField label="Trust Pill 1" value={settingsForm.trustPill1 || ''} onChange={v => setSettingsForm(s => ({ ...s, trustPill1: v }))} placeholder="✓ 200+ Builders Registered" />
                <SettingsField label="Trust Pill 2" value={settingsForm.trustPill2 || ''} onChange={v => setSettingsForm(s => ({ ...s, trustPill2: v }))} placeholder="✓ ₹47 Cr+ Saved by Buyers" />
                <SettingsField label="Trust Pill 3" value={settingsForm.trustPill3 || ''} onChange={v => setSettingsForm(s => ({ ...s, trustPill3: v }))} placeholder="✓ RERA Verified Projects" />
              </SettingsGroup>

              <SettingsGroup title="Stats Section">
                <SettingsField label="Stat 1 Number" value={settingsForm.stat1Num || ''} onChange={v => setSettingsForm(s => ({ ...s, stat1Num: v }))} placeholder="200+" />
                <SettingsField label="Stat 1 Label" value={settingsForm.stat1Label || ''} onChange={v => setSettingsForm(s => ({ ...s, stat1Label: v }))} placeholder="Builders Registered" />
                <SettingsField label="Stat 1 Icon (emoji)" value={settingsForm.stat1Icon || ''} onChange={v => setSettingsForm(s => ({ ...s, stat1Icon: v }))} placeholder="🏗" />
                <SettingsField label="Stat 2 Number" value={settingsForm.stat2Num || ''} onChange={v => setSettingsForm(s => ({ ...s, stat2Num: v }))} placeholder="₹47 Cr+" />
                <SettingsField label="Stat 2 Label" value={settingsForm.stat2Label || ''} onChange={v => setSettingsForm(s => ({ ...s, stat2Label: v }))} placeholder="Saved by Buyers" />
                <SettingsField label="Stat 2 Icon (emoji)" value={settingsForm.stat2Icon || ''} onChange={v => setSettingsForm(s => ({ ...s, stat2Icon: v }))} placeholder="💰" />
                <SettingsField label="Stat 3 Number" value={settingsForm.stat3Num || ''} onChange={v => setSettingsForm(s => ({ ...s, stat3Num: v }))} placeholder="0%" />
                <SettingsField label="Stat 3 Label" value={settingsForm.stat3Label || ''} onChange={v => setSettingsForm(s => ({ ...s, stat3Label: v }))} placeholder="Brokerage Fee" />
                <SettingsField label="Stat 3 Icon (emoji)" value={settingsForm.stat3Icon || ''} onChange={v => setSettingsForm(s => ({ ...s, stat3Icon: v }))} placeholder="🚫" />
                <SettingsField label="Stat 4 Number" value={settingsForm.stat4Num || ''} onChange={v => setSettingsForm(s => ({ ...s, stat4Num: v }))} placeholder="2,500+" />
                <SettingsField label="Stat 4 Label" value={settingsForm.stat4Label || ''} onChange={v => setSettingsForm(s => ({ ...s, stat4Label: v }))} placeholder="Direct Listings" />
                <SettingsField label="Stat 4 Icon (emoji)" value={settingsForm.stat4Icon || ''} onChange={v => setSettingsForm(s => ({ ...s, stat4Icon: v }))} placeholder="🏠" />
              </SettingsGroup>

              <SettingsGroup title="Contact Details">
                <SettingsField label="Phone Number" value={settingsForm.phone || ''} onChange={v => setSettingsForm(s => ({ ...s, phone: v }))} placeholder="+91 98765 43210" />
                <SettingsField label="Email Address" value={settingsForm.email || ''} onChange={v => setSettingsForm(s => ({ ...s, email: v }))} placeholder="info@vertexliving.in" />
                <SettingsField label="WhatsApp Number" value={settingsForm.whatsapp || ''} onChange={v => setSettingsForm(s => ({ ...s, whatsapp: v }))} placeholder="+91 98765 43210" />
                <SettingsField label="Office Address" value={settingsForm.address || ''} onChange={v => setSettingsForm(s => ({ ...s, address: v }))} />
                <SettingsField label="Office Hours" value={settingsForm.officeHours || ''} onChange={v => setSettingsForm(s => ({ ...s, officeHours: v }))} placeholder="Mon–Sat: 9 AM – 7 PM" />
              </SettingsGroup>

              <SettingsGroup title="Social Media Links">
                <SettingsField label="Facebook URL" value={settingsForm.facebookUrl || ''} onChange={v => setSettingsForm(s => ({ ...s, facebookUrl: v }))} placeholder="https://facebook.com/yourpage" />
                <SettingsField label="Instagram URL" value={settingsForm.instagramUrl || ''} onChange={v => setSettingsForm(s => ({ ...s, instagramUrl: v }))} placeholder="https://instagram.com/yourpage" />
                <SettingsField label="YouTube URL" value={settingsForm.youtubeUrl || ''} onChange={v => setSettingsForm(s => ({ ...s, youtubeUrl: v }))} placeholder="https://youtube.com/yourchannel" />
              </SettingsGroup>
            </div>

            <div className="ap-settings-save-bar">
              <button className="ap-btn ap-btn-primary ap-btn-lg" onClick={saveSettings} disabled={saving}>
                {saving ? 'Saving...' : <>{Ico.save} Save All Settings</>}
              </button>
            </div>
          </div>
        )}

        {/* ── Rental Section ── */}
        {tab === 'rental' && (
          <div className="ap-section">
            <div className="ap-section-header">
              <div>
                <h1 className="ap-title">🏠 Rental Dashboard</h1>
                <p className="ap-subtitle">Manage all rental properties, users and inquiries</p>
              </div>
              <button className="ap-btn ap-btn-outline" onClick={() => loadAll()}>↻ Refresh</button>
            </div>

            {/* Stats */}
            <div className="ap-stat-grid" style={{ marginBottom: 28 }}>
              <StatCard label="Total Properties" value={rentalStats.totalProperties ?? rentalProps.length}  sub="listed" color="blue" onClick={() => setRentalTab('properties')} />
              <StatCard label="Active"           value={rentalStats.activeProperties}                       sub="available" color="green" onClick={() => setRentalTab('properties')} />
              <StatCard label="Inactive"         value={rentalStats.inactiveProperties}                     sub="paused" color="orange" onClick={() => setRentalTab('properties')} />
              <StatCard label="Owners"           value={rentalStats.totalOwners}                            sub="registered" color="purple" onClick={() => setRentalTab('users')} />
              <StatCard label="Tenants"          value={rentalStats.totalTenants}                           sub="registered" color="teal" onClick={() => setRentalTab('users')} />
              <StatCard label="Inquiries"        value={rentalStats.totalInquiries ?? rentalInquiries.length} sub="total" color={rentalInquiries.length > 0 ? 'red' : 'gray'} onClick={() => setRentalTab('inquiries')} />
            </div>

            {/* Sub-tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 0 }}>
              {[
                { id: 'properties', label: `Properties (${rentalProps.length})` },
                { id: 'users',      label: `Users (${rentalUsers.length})` },
                { id: 'inquiries',  label: `Inquiries (${rentalInquiries.length})` },
              ].map(t => (
                <button key={t.id}
                  onClick={() => setRentalTab(t.id)}
                  style={{
                    padding: '10px 18px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                    background: 'transparent',
                    color: rentalTab === t.id ? 'var(--ap-accent, #6366f1)' : 'var(--ap-muted, #64748b)',
                    borderBottom: rentalTab === t.id ? '2px solid var(--ap-accent, #6366f1)' : '2px solid transparent',
                  }}
                >{t.label}</button>
              ))}
            </div>

            {/* Search */}
            <div style={{ marginBottom: 16 }}>
              <input
                className="ap-search-input"
                placeholder={rentalTab === 'properties' ? 'Search title, location, owner…' : rentalTab === 'users' ? 'Search name, email, role…' : 'Search tenant, property…'}
                value={rentalSearch}
                onChange={e => setRentalSearch(e.target.value)}
                style={{ width: 300 }}
              />
            </div>

            {/* Properties sub-tab */}
            {rentalTab === 'properties' && (() => {
              const q = rentalSearch.toLowerCase()
              const list = rentalProps.filter(p => !q || `${p.title} ${p.sector} ${p.location} ${p.ownerName}`.toLowerCase().includes(q))
              const fmtRent = n => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(0)}K` : `₹${n}`
              return (
                <div className="ap-table-wrap">
                  <table className="ap-table">
                    <thead><tr>
                      <th>Photo</th><th>Title</th><th>Type</th><th>Location</th><th>Rent</th><th>Owner</th><th>Status</th><th>Actions</th>
                    </tr></thead>
                    <tbody>
                      {list.length === 0 && <tr><td colSpan={8} style={{ textAlign:'center', padding: '40px', color:'var(--ap-muted)' }}>No properties found.</td></tr>}
                      {list.map(p => (
                        <tr key={p.id}>
                          <td>
                            {p.photos?.[0]
                              ? <img src={p.photos[0]} alt="" style={{ width:52, height:40, objectFit:'cover', borderRadius:6 }} onError={e=>e.target.style.display='none'} />
                              : <div style={{ width:52, height:40, background:'rgba(99,102,241,0.1)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}>🏠</div>
                            }
                          </td>
                          <td>
                            <div style={{ fontWeight:600, fontSize:'0.85rem' }}>{p.title}</div>
                            <div style={{ fontSize:'0.75rem', color:'var(--ap-muted)' }}>{p.type} · {p.furnishing}</div>
                          </td>
                          <td><span className="ap-badge">{p.type}</span></td>
                          <td style={{ fontSize:'0.82rem', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.sector}</td>
                          <td style={{ fontWeight:700, color:'var(--ap-accent)' }}>{fmtRent(p.rentPerMonth)}/mo</td>
                          <td>
                            <div style={{ fontSize:'0.83rem' }}>{p.ownerName}</div>
                            <div style={{ fontSize:'0.73rem', color:'var(--ap-muted)' }}>{p.ownerPhone}</div>
                          </td>
                          <td>
                            <span className={`ap-status-badge ${p.status === 'active' ? 'ready' : 'construction'}`}>{p.status}</span>
                          </td>
                          <td>
                            <div style={{ display:'flex', gap:6 }}>
                              <button className="ap-btn ap-btn-sm ap-btn-outline" onClick={async () => {
                                const ns = p.status === 'active' ? 'inactive' : 'active'
                                await fetch(`${RENTAL_API}/admin/properties/${p.id}/status`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status: ns }) })
                                setRentalProps(prev => prev.map(x => String(x.id)===String(p.id) ? {...x, status:ns} : x))
                                showToast(`Property ${ns === 'active' ? 'activated' : 'deactivated'}`)
                              }}>{p.status === 'active' ? 'Deactivate' : 'Activate'}</button>
                              <button className="ap-btn ap-btn-sm ap-btn-danger" onClick={async () => {
                                if (!window.confirm('Delete this rental property?')) return
                                await fetch(`${RENTAL_API}/admin/properties/${p.id}`, { method:'DELETE' })
                                setRentalProps(prev => prev.filter(x => String(x.id) !== String(p.id)))
                                showToast('Property deleted')
                              }}>{Ico.del}</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })()}

            {/* Users sub-tab */}
            {rentalTab === 'users' && (() => {
              const q = rentalSearch.toLowerCase()
              const list = rentalUsers.filter(u => !q || `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(q))
              return (
                <div className="ap-table-wrap">
                  <table className="ap-table">
                    <thead><tr>
                      <th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Actions</th>
                    </tr></thead>
                    <tbody>
                      {list.length === 0 && <tr><td colSpan={6} style={{ textAlign:'center', padding:'40px', color:'var(--ap-muted)' }}>No users found.</td></tr>}
                      {list.map(u => (
                        <tr key={u.id}>
                          <td>
                            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                              <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(99,102,241,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#818cf8' }}>{u.avatar || u.name?.[0]}</div>
                              <span style={{ fontWeight:600 }}>{u.name}</span>
                            </div>
                          </td>
                          <td style={{ color:'var(--ap-muted)', fontSize:'0.83rem' }}>{u.email}</td>
                          <td style={{ color:'var(--ap-muted)', fontSize:'0.83rem' }}>{u.phone || '—'}</td>
                          <td><span className={`ap-badge ${u.role === 'owner' ? '' : 'ap-badge-green'}`}>{u.role}</span></td>
                          <td style={{ color:'var(--ap-muted)', fontSize:'0.8rem' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                          <td>
                            <button className="ap-btn ap-btn-sm ap-btn-danger" onClick={async () => {
                              if (!window.confirm('Delete this rental user?')) return
                              await fetch(`${RENTAL_API}/admin/users/${u.id}`, { method:'DELETE' })
                              setRentalUsers(prev => prev.filter(x => String(x.id) !== String(u.id)))
                              showToast('User deleted')
                            }}>{Ico.del}</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })()}

            {/* Inquiries sub-tab */}
            {rentalTab === 'inquiries' && (() => {
              const q = rentalSearch.toLowerCase()
              const list = rentalInquiries.filter(i => !q || `${i.tenantName} ${i.tenantEmail} ${i.propertyTitle}`.toLowerCase().includes(q))
              return (
                <div className="ap-table-wrap">
                  <table className="ap-table">
                    <thead><tr>
                      <th>Property</th><th>Tenant</th><th>Contact</th><th>Message</th><th>Date</th><th>Actions</th>
                    </tr></thead>
                    <tbody>
                      {list.length === 0 && <tr><td colSpan={6} style={{ textAlign:'center', padding:'40px', color:'var(--ap-muted)' }}>No inquiries found.</td></tr>}
                      {list.map(i => (
                        <tr key={i.id}>
                          <td style={{ fontWeight:600, fontSize:'0.83rem', maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{i.propertyTitle || '—'}</td>
                          <td style={{ fontWeight:600 }}>{i.tenantName}</td>
                          <td>
                            <div style={{ fontSize:'0.8rem' }}>{i.tenantEmail}</div>
                            <div style={{ fontSize:'0.75rem', color:'var(--ap-muted)' }}>{i.tenantPhone || '—'}</div>
                          </td>
                          <td style={{ maxWidth:220, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--ap-muted)', fontSize:'0.8rem' }}>"{i.message}"</td>
                          <td style={{ color:'var(--ap-muted)', fontSize:'0.78rem' }}>{i.createdAt ? new Date(i.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                          <td>
                            <button className="ap-btn ap-btn-sm ap-btn-danger" onClick={async () => {
                              if (!window.confirm('Delete this inquiry?')) return
                              await fetch(`${RENTAL_API}/admin/inquiries/${i.id}`, { method:'DELETE' })
                              setRentalInquiries(prev => prev.filter(x => String(x.id) !== String(i.id)))
                              showToast('Inquiry deleted')
                            }}>{Ico.del}</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })()}
          </div>
        )}
      </main>

      {/* ── Property Modal ── */}
      {propModal !== null && (
        <Modal title={propModal === 'add' ? 'Add New Property' : 'Edit Property'} onClose={() => setPropModal(null)} wide>
          {/* Basic Details */}
          <div className="ap-form-section-label">Basic Details</div>
          <div className="ap-form-grid">
            <FormField label="Property Name *" value={propForm.name} onChange={v => setPropForm(s => ({ ...s, name: v }))} placeholder="e.g. DLF The Camellias" />
            <FormField label="Sector" value={propForm.sector} onChange={v => setPropForm(s => ({ ...s, sector: v }))} placeholder="e.g. Sector 42" />
            <FormField label="Full Location" value={propForm.location} onChange={v => setPropForm(s => ({ ...s, location: v }))} placeholder="e.g. DLF Phase 5, Sector 42, Gurgaon" span={2} />
            <FormField label="City" value={propForm.city} onChange={v => setPropForm(s => ({ ...s, city: v }))} placeholder="Gurgaon" />
            <FormSelect label="Type" value={propForm.type} onChange={v => setPropForm(s => ({ ...s, type: v }))} options={['Apartment','Villa','Commercial']} />
            <FormField label="Bedrooms (BHK)" value={propForm.bedrooms} onChange={v => setPropForm(s => ({ ...s, bedrooms: v }))} type="number" placeholder="e.g. 3" />
            <FormField label="Price (in Crore) *" value={propForm.price} onChange={v => setPropForm(s => ({ ...s, price: v }))} type="number" placeholder="e.g. 4.5 for ₹4.5 Cr, 0.85 for ₹85 Lac" hint="Enter in Crore: 0.85 = ₹85 Lac, 1.5 = ₹1.5 Cr" />
            <FormField label="Area" value={propForm.area} onChange={v => setPropForm(s => ({ ...s, area: v }))} placeholder="e.g. 2200 sqft" />
            <FormSelect label="Status" value={propForm.status} onChange={v => setPropForm(s => ({ ...s, status: v }))} options={['Ready to Move','Under Construction']} />
            <FormField label="Developer" value={propForm.developer} onChange={v => setPropForm(s => ({ ...s, developer: v }))} placeholder="e.g. DLF India" />
          </div>

          {/* Image Upload */}
          <div className="ap-form-section-label" style={{ marginTop: 20 }}>Property Images</div>
          <input ref={propImgRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" multiple style={{ display: 'none' }} onChange={handlePropImageUpload} />
          <div className="ap-img-upload-area" onClick={() => propImgRef.current?.click()}>
            <div className="ap-img-upload-icon">🖼️</div>
            <div className="ap-img-upload-text">Click to upload images</div>
            <div className="ap-img-upload-hint">JPG, PNG, WebP — multiple allowed</div>
          </div>
          {(propForm.photos || []).length > 0 && (
            <div className="ap-img-preview-grid">
              {propForm.photos.map((url, i) => (
                <div key={i} className="ap-img-preview-item">
                  <img src={url.startsWith('/uploads') ? `${url}` : url} alt={`img-${i}`} />
                  <button className="ap-img-remove" onClick={() => setPropForm(s => ({ ...s, photos: s.photos.filter((_, j) => j !== i) }))}>✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Amenities */}
          <div className="ap-form-section-label" style={{ marginTop: 20 }}>Amenities</div>
          <div className="ap-amenities-grid">
            {ALL_AMENITIES.map(a => {
              const checked = (propForm.amenities || []).includes(a)
              return (
                <div key={a} className={`ap-amenity-chip ${checked ? 'active' : ''}`} onClick={() => toggleAmenity(a)}>
                  {checked ? '✓ ' : ''}{a}
                </div>
              )
            })}
          </div>

          <div className="ap-modal-footer">
            <button className="ap-btn ap-btn-outline" onClick={() => setPropModal(null)}>Cancel</button>
            <button className="ap-btn ap-btn-primary" onClick={saveProp} disabled={saving}>
              {saving ? 'Saving...' : <>{Ico.save} {propModal === 'add' ? 'Add Property' : 'Save Changes'}</>}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Agent Modal ── */}
      {agentModal !== null && (
        <Modal title={agentModal === 'add' ? 'Add New Agent' : 'Edit Agent'} onClose={() => setAgentModal(null)}>
          <div className="ap-form-grid">
            <FormField label="Full Name *" value={agentForm.name} onChange={v => setAgentForm(s => ({ ...s, name: v }))} placeholder="e.g. Arjun Sharma" />
            <FormField label="Experience (Years)" value={agentForm.experience} onChange={v => setAgentForm(s => ({ ...s, experience: v }))} type="number" placeholder="e.g. 8" />
            <FormField label="Specialization" value={agentForm.specialization} onChange={v => setAgentForm(s => ({ ...s, specialization: v }))} placeholder="e.g. Luxury Villas & Penthouses" span={2} />
            <FormField label="Deals Closed" value={agentForm.deals} onChange={v => setAgentForm(s => ({ ...s, deals: v }))} type="number" placeholder="e.g. 150" />
            <FormField label="Rating (out of 5)" value={agentForm.rating} onChange={v => setAgentForm(s => ({ ...s, rating: v }))} type="number" placeholder="e.g. 4.9" />
            <FormField label="Phone Number" value={agentForm.phone} onChange={v => setAgentForm(s => ({ ...s, phone: v }))} placeholder="+91 98765 43210" />
            <FormField label="Email Address" value={agentForm.email} onChange={v => setAgentForm(s => ({ ...s, email: v }))} placeholder="agent@vertexliving.in" />
            <FormField label="Photo URL" value={agentForm.photo} onChange={v => setAgentForm(s => ({ ...s, photo: v }))} placeholder="Paste image link here" span={2} hint="You can use Unsplash links or any image URL" />
            <div className="ap-form-check">
              <label className="ap-check-label">
                <input type="checkbox" checked={!!agentForm.topAgent} onChange={e => setAgentForm(s => ({ ...s, topAgent: e.target.checked }))} />
                <span>Mark as Top Agent (shows badge on website)</span>
              </label>
            </div>
          </div>
          {agentForm.photo && (
            <div className="ap-photo-preview">
              <span>Preview:</span>
              <img src={agentForm.photo} alt="Preview" onError={e => { e.target.style.display = 'none' }} />
            </div>
          )}
          <div className="ap-modal-footer">
            <button className="ap-btn ap-btn-outline" onClick={() => setAgentModal(null)}>Cancel</button>
            <button className="ap-btn ap-btn-primary" onClick={saveAgent} disabled={saving}>
              {saving ? 'Saving...' : <>{Ico.save} {agentModal === 'add' ? 'Add Agent' : 'Save Changes'}</>}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Inquiry Detail Modal ── */}
      {viewInquiry && (
        <Modal title="Inquiry Details" onClose={() => setViewInquiry(null)}>
          <div className="ap-inq-detail">
            {Object.entries(viewInquiry)
              .filter(([k]) => !['id', 'read'].includes(k))
              .map(([k, v]) => (
                <div key={k} className="ap-inq-row">
                  <span className="ap-inq-key">{k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1')}:</span>
                  <span className="ap-inq-val">{v || '—'}</span>
                </div>
              ))
            }
          </div>
          <div className="ap-modal-footer">
            <button className="ap-btn ap-btn-danger" onClick={() => setDeleteConfirm({ type: 'inquiry', id: viewInquiry.id, name: viewInquiry.name })}>
              {Ico.del} Delete
            </button>
            <button className="ap-btn ap-btn-outline" onClick={() => setViewInquiry(null)}>Close</button>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirm && (
        <Modal title="Confirm Delete" onClose={() => setDeleteConfirm(null)} small>
          <div className="ap-confirm-body">
            <div className="ap-confirm-icon">{Ico.warn}</div>
            <p>Are you sure you want to delete <strong>"{deleteConfirm.name}"</strong>?</p>
            <p className="ap-confirm-sub">This action cannot be undone.</p>
          </div>
          <div className="ap-modal-footer">
            <button className="ap-btn ap-btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="ap-btn ap-btn-danger" onClick={() => {
              if (deleteConfirm.type === 'property') deleteProp(deleteConfirm.id)
              else if (deleteConfirm.type === 'agent') deleteAgent(deleteConfirm.id)
              else if (deleteConfirm.type === 'inquiry') deleteInquiry(deleteConfirm.id)
              else if (deleteConfirm.type === 'user') deleteUser(deleteConfirm.id)
            }}>
              Yes, Delete
            </button>
          </div>
        </Modal>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`ap-toast ${toast.type}`}>
          <span className="ap-toast-icon">{toast.type === 'success' ? Ico.check : Ico.warn}</span>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color, onClick }) {
  return (
    <div className={`ap-stat-card ${color}`} onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="ap-stat-value">{value}</div>
      <div className="ap-stat-label">{label}</div>
      {sub && <div className="ap-stat-sub">{sub}</div>}
    </div>
  )
}

function QuickAction({ icon, label, onClick, color }) {
  return (
    <button className={`ap-qa-btn ${color}`} onClick={onClick}>
      <span className="ap-qa-icon">{icon}</span>
      <span>{label}</span>
    </button>
  )
}

function TypeBadge({ type }) {
  const cls = { Apartment: 'apt', Villa: 'villa', Commercial: 'com' }[type] || ''
  return <span className={`ap-type-badge ${cls}`}>{type}</span>
}

function StatusBadge({ status }) {
  const cls = status === 'Ready to Move' ? 'ready' : 'uc'
  return <span className={`ap-status-badge ${cls}`}>{status}</span>
}

function Modal({ title, onClose, children, small, wide }) {
  return (
    <div className="ap-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`ap-modal ${small ? 'small' : ''} ${wide ? 'wide' : ''}`}>
        <div className="ap-modal-header">
          <h2>{title}</h2>
          <button className="ap-modal-close" onClick={onClose}>{Ico.close}</button>
        </div>
        <div className="ap-modal-body">{children}</div>
      </div>
    </div>
  )
}

function FormField({ label, value, onChange, type = 'text', placeholder, span, hint }) {
  return (
    <div className="ap-form-field" style={span ? { gridColumn: `span ${span}` } : {}}>
      <label className="ap-field-label">{label}</label>
      {type === 'textarea'
        ? <textarea className="ap-field-input" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} />
        : <input className="ap-field-input" type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      }
      {hint && <span className="ap-field-hint">{hint}</span>}
    </div>
  )
}

function FormSelect({ label, value, onChange, options }) {
  return (
    <div className="ap-form-field">
      <label className="ap-field-label">{label}</label>
      <select className="ap-field-input ap-field-select" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function SettingsGroup({ title, children }) {
  return (
    <div className="ap-settings-group">
      <h3 className="ap-settings-group-title">{title}</h3>
      <div className="ap-settings-fields">{children}</div>
    </div>
  )
}

function SettingsField({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div className="ap-settings-field">
      <label className="ap-field-label">{label}</label>
      {type === 'textarea'
        ? <textarea className="ap-field-input" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} />
        : <input className="ap-field-input" type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      }
    </div>
  )
}
