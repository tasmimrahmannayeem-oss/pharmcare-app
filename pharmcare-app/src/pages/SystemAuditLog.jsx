import { useState } from 'react'

const auditLogs = [
  { id: 'LOG-8902', time: '2026-04-10 14:32:11', user: 'System Admin', role: 'Super Admin', action: 'CREATE', resource: 'Pharmacy: HealthPlus Express', ip: '192.168.1.45', status: 'Success' },
  { id: 'LOG-8901', time: '2026-04-10 14:15:05', user: 'Dr. Sarah Chen', role: 'Pharmacy Admin', action: 'UPDATE', resource: 'User Role: James Lee', ip: '10.0.0.12', status: 'Success' },
  { id: 'LOG-8900', time: '2026-04-10 13:45:22', user: 'Audit Bot', role: 'System', action: 'FLAG', resource: 'Prescription: RX-2024-0091 (Controlled Sub)', ip: 'localhost', status: 'Warning' },
  { id: 'LOG-8899', time: '2026-04-10 12:30:00', user: 'System', role: 'System', action: 'BACKUP', resource: 'Database: spmis_prod', ip: 'localhost', status: 'Success' },
  { id: 'LOG-8898', time: '2026-04-10 11:14:05', user: 'Unknown', role: '—', action: 'LOGIN_ATTEMPT', resource: 'Account: admin@spmis.com', ip: '45.22.19.102', status: 'Failed' },
  { id: 'LOG-8897', time: '2026-04-10 10:05:32', user: 'Dr. Mark Liu', role: 'Pharmacy Admin', action: 'DELETE', resource: 'Inventory Item: SKU-9012', ip: '10.0.1.55', status: 'Success' },
  { id: 'LOG-8896', time: '2026-04-10 09:12:18', user: 'Maria Santos', role: 'Pharmacist', action: 'VERIFY', resource: 'Prescription: RX-2024-0038', ip: '10.0.0.14', status: 'Success' },
]

const statusBadge = { Success: 'badge-success', Warning: 'badge-warning', Failed: 'badge-error' }
const actionColor = { CREATE: 'var(--primary-container)', UPDATE: 'var(--secondary)', DELETE: 'var(--error)', FLAG: '#f59e0b', BACKUP: 'var(--on-surface-variant)', LOGIN_ATTEMPT: 'var(--error)', VERIFY: 'var(--secondary)' }

export default function SystemAuditLog() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  
  const filtered = auditLogs.filter(l => 
    (filter === 'All' || l.status === filter) &&
    (l.user.toLowerCase().includes(search.toLowerCase()) || l.resource.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 className="page-title">System Audit Log</h1>
          <p className="page-subtitle">Immutable record of system events, access, and modifications</p>
        </div>
        <button className="btn btn-ghost">
          <span className="material-icons" style={{ fontSize: 18 }}>download</span> Export CSV
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="input-icon-wrap" style={{ flex: 1, minWidth: 200 }}>
          <span className="material-icons icon">search</span>
          <input className="input" placeholder="Search logs by user, action, or resource…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="input-icon-wrap">
            <span className="material-icons icon">date_range</span>
            <input type="date" className="input" defaultValue="2026-04-10" />
          </div>
          {['All', 'Success', 'Warning', 'Failed'].map(f => (
            <button key={f} className={`badge ${filter === f ? 'badge-info' : 'badge-neutral'}`}
              style={{ cursor: 'pointer', padding: '7px 12px', fontSize: '0.8rem' }} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Timestamp / ID</th><th>User / Role</th><th>Action</th><th>Resource / Details</th><th>IP Address</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{l.time.split(' ')[1]}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{l.time.split(' ')[0]} · {l.id}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{l.user}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{l.role}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: actionColor[l.action], padding: '4px 8px', background: 'var(--surface-high)', borderRadius: 4 }}>
                      {l.action}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8125rem' }}>{l.resource}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>{l.ip}</td>
                  <td><span className={`badge ${statusBadge[l.status]}`}>{l.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--outline-variant)', fontSize: '0.8125rem', color: 'var(--on-surface-variant)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Showing {filtered.length} of 4,892 records</span>
          <div style={{ display: 'flex', gap: 16 }}>
            <span style={{ cursor: 'pointer', fontWeight: 600 }}>Previous Page</span>
            <span style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--primary-container)' }}>Next Page</span>
          </div>
        </div>
      </div>
    </div>
  )
}
