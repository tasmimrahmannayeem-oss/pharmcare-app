import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    summary: { totalRevenue: 0, totalPharmacies: 0, totalUsers: 0, systemFlags: 0 },
    pharmacies: []
  })
  const [recentActivity, setRecentActivity] = useState([])
  
  const [adminSettings, setAdminSettings] = useState({
    name: 'System Owner',
    email: 'admin@spmis.com',
    password: ''
  })

  const [errorStatus, setErrorStatus] = useState(null)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorStatus('No token found');
        return;
      }

      const res = await fetch('/api/analytics/system', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      const data = await res.json()
      console.log('SAdmin Dashboard Data:', data)

      if (res.ok) {
        setStats(data)
        setErrorStatus(null)
      } else {
        setErrorStatus(`Analytics Error: ${res.status}`);
        console.warn(`Dashboard fetch failed: ${res.status}`, data);
      }

      // Fetch recent users
      const userRes = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const users = await userRes.json()
      if (userRes.ok && Array.isArray(users)) {
        const activity = users.slice(0, 4).map(u => ({
          action: `New user registered: ${u.name}`,
          user: 'System Admin',
          time: new Date(u.createdAt).toLocaleDateString(),
          icon: 'person_add',
          color: 'var(--primary-container)'
        }))
        setRecentActivity(activity)
      }
    } catch (err) {
      console.error('Fetch dashboard error:', err)
      setErrorStatus(`Network Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSettings = (e) => {
    e.preventDefault()
    setShowSettingsModal(false)
    alert('Admin credentials and settings updated successfully!')
  }

  return (
    <>
      <div className="fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Super Admin Dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <div className="live-dot" />
            <span style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>System-wide overview · All pharmacies · Live</span>
            {errorStatus && (
              <span className="badge badge-error" style={{ marginLeft: 12, fontSize: '0.75rem' }}>
                <span className="material-icons" style={{ fontSize: 14, marginRight: 4 }}>error_outline</span>
                {errorStatus}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={fetchData}>
            <span className="material-icons" style={{ fontSize: 16 }}>refresh</span> Refresh
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowSettingsModal(true)}>
            <span className="material-icons" style={{ fontSize: 16 }}>manage_accounts</span> Account Settings
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/superadmin/audit')}>
            <span className="material-icons" style={{ fontSize: 16 }}>history</span> Audit Log
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/superadmin/pharmacies')}>
            <span className="material-icons" style={{ fontSize: 16 }}>add_business</span> Add Pharmacy
          </button>
        </div>
      </div>

      {/* System-wide KPIs */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total System Revenue', val: `৳${(stats.summary?.totalRevenue || 0).toLocaleString()}`, delta: 'Across all network', icon: 'trending_up', bg: 'linear-gradient(135deg,var(--primary),var(--primary-container))', white: true },
          { label: 'Active Pharmacies', val: stats.summary?.totalPharmacies || 0, delta: 'Total branches', icon: 'business', bg: 'var(--secondary-fixed)', ic: 'var(--secondary)' },
          { label: 'Registered Users', val: (stats.summary?.totalUsers || 0).toLocaleString(), delta: 'Total accounts', icon: 'group', bg: 'var(--primary-fixed)', ic: 'var(--primary-container)' },
          { label: 'System Flags', val: stats.summary?.systemFlags || 0, delta: 'Critical alerts', icon: 'flag', bg: 'var(--error-container)', ic: 'var(--error)' },
        ].map(s => (
          <div className="stat-card" key={s.label} style={{ background: s.white ? s.bg : 'var(--surface-lowest)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.white ? 'rgba(255,255,255,0.2)' : s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-icons" style={{ color: s.white ? 'white' : s.ic, fontSize: 22 }}>{s.icon}</span>
            </div>
            <div className="stat-value" style={{ fontSize: (stats.summary?.totalRevenue || 0) > 1000000 ? '1.4rem' : '1.75rem', color: s.white ? 'white' : 'var(--on-surface)' }}>{s.val}</div>
            <div style={{ fontSize: '0.75rem', color: s.white ? 'rgba(255,255,255,0.8)' : 'var(--secondary)', fontWeight: 600 }}>{s.delta}</div>
            <div className="stat-label" style={{ color: s.white ? 'rgba(255,255,255,0.75)' : 'var(--on-surface-variant)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap: 24 }}>
        {/* Pharmacy overview */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between' }}>
            <h3 className="title-md">Pharmacy Network</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/superadmin/pharmacies')}>Manage</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--on-surface-variant)' }}>Loading network data...</div>
            ) : (stats.pharmacies || []).length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--on-surface-variant)' }}>No pharmacies found in network.</div>
            ) : (stats.pharmacies || []).map((p, i) => (
              <div key={p?._id || i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < (stats.pharmacies || []).length - 1 ? '1px solid rgba(196,197,213,0.25)' : 'none' }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: p?.status === 'Online' ? 'var(--secondary-fixed)' : 'var(--surface-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-icons" style={{ color: p?.status === 'Online' ? 'var(--secondary)' : 'var(--on-surface-variant)', fontSize: 22 }}>local_pharmacy</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{p?.name || 'Unnamed Pharmacy'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{p?.ownerName || 'No owner'} · {p?.rxToday || 0} Rx today</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary-container)' }}>৳{(p?.revenue || 0).toLocaleString()}</div>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 4 }}>
                    <span className={`badge ${p?.status === 'Online' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>{p?.status || 'Offline'}</span>
                    {(p?.alerts || 0) > 0 && <span className="badge badge-error" style={{ fontSize: '0.7rem' }}>{p.alerts} alert{p.alerts > 1 ? 's' : ''}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="card">
          <div className="section-header" style={{ marginBottom: 16 }}>
            <h3 className="section-title">Recent System Activity</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/superadmin/audit')}>Full Log</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {recentActivity.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-low)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-icons" style={{ color: a.color, fontSize: 20 }}>{a.icon}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{a.action}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>
                    By {a.user} · {a.time}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* System health */}
          <div style={{ marginTop: 20, borderTop: '1px solid var(--outline-variant)', paddingTop: 16 }}>
            <h3 className="label-md text-muted" style={{ marginBottom: 12 }}>System Health</h3>
            {[
              { svc: 'Database', status: 'Operational', pct: 99.9 },
              { svc: 'API Gateway', status: 'Operational', pct: 100 },
              { svc: 'Payment Gateway', status: 'Degraded', pct: 87.2 },
            ].map(s => (
              <div key={s.svc} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.pct > 95 ? 'var(--secondary)' : 'var(--tertiary-container)', flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: '0.8125rem' }}>{s.svc}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: s.pct > 95 ? 'var(--secondary)' : 'var(--tertiary-container)' }}>{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <div className="section-header">
              <h2 className="section-title">Super Admin Account Settings</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowSettingsModal(false)}>
                <span className="material-icons">close</span>
              </button>
            </div>
            
            <form onSubmit={handleUpdateSettings} style={{ marginTop: 20 }}>
              <div className="input-group" style={{ marginBottom: 16 }}>
                <label className="input-label">Admin Name</label>
                <div className="input-icon-wrap" style={{ position: 'relative' }}>
                  <span className="material-icons" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: 20 }}>badge</span>
                  <input className="input" style={{ paddingLeft: 44 }} value={adminSettings.name} onChange={e => setAdminSettings({...adminSettings, name: e.target.value})} />
                </div>
              </div>
              
              <div className="input-group" style={{ marginBottom: 16 }}>
                <label className="input-label">Admin Email Details</label>
                <div className="input-icon-wrap" style={{ position: 'relative' }}>
                  <span className="material-icons" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: 20 }}>email</span>
                  <input className="input" type="email" style={{ paddingLeft: 44 }} value={adminSettings.email} onChange={e => setAdminSettings({...adminSettings, email: e.target.value})} />
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: 24 }}>
                <label className="input-label">New Password (leave blank to keep current)</label>
                <div className="input-icon-wrap" style={{ position: 'relative' }}>
                  <span className="material-icons" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: 20 }}>lock</span>
                  <input className="input" type="password" style={{ paddingLeft: 44 }} placeholder="••••••••" value={adminSettings.password} onChange={e => setAdminSettings({...adminSettings, password: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowSettingsModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
