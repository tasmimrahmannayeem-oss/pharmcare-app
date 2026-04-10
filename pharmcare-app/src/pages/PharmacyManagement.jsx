import { useState } from 'react'

const branches = [
  { id: 'PHARM-01', name: 'Aura Pharmacy — Green Valley', address: '123 Medical Ave, Health City', admin: 'Dr. Sarah Chen', phone: '+1 555 0100', staff: 14, status: 'Online', rating: 4.8 },
  { id: 'PHARM-02', name: 'Aura Pharmacy — Westside', address: '450 West Blvd, Uptown', admin: 'Dr. Mark Liu', phone: '+1 555 0200', staff: 8, status: 'Online', rating: 4.6 },
  { id: 'PHARM-03', name: 'MedCenter Pharmacy — North', address: '789 North Hwy, Suburbia', admin: 'Dr. Priya Gupta', phone: '+1 555 0300', staff: 12, status: 'Online', rating: 4.9 },
  { id: 'PHARM-04', name: 'CityPharm — Downtown', address: '101 Central Square', admin: 'Dr. Emma Wu', phone: '+1 555 0400', staff: 10, status: 'Maintenance', rating: 4.5 },
  { id: 'PHARM-05', name: 'HealthPlus Express', address: 'Terminal 2, City Airport', admin: '—', phone: '—', staff: 0, status: 'Setup Pending', rating: 0 },
]

export default function PharmacyManagement() {
  const [search, setSearch] = useState('')
  const filtered = branches.filter(b => b.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 className="page-title">Pharmacy Network Management</h1>
          <p className="page-subtitle">Manage branches, access control, and configurations</p>
        </div>
        <button className="btn btn-primary">
          <span className="material-icons" style={{ fontSize: 18 }}>add_business</span> Add Branch
        </button>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Branches', val: branches.length, icon: 'business', bg: 'var(--primary-fixed)', ic: 'var(--primary-container)' },
          { label: 'Online & Active', val: 3, icon: 'check_circle', bg: 'var(--secondary-fixed)', ic: 'var(--secondary)' },
          { label: 'Maintenance / Setup', val: 2, icon: 'build', bg: 'var(--tertiary-fixed)', ic: 'var(--tertiary-container)' },
          { label: 'Total Network Staff', val: 44, icon: 'groups', bg: 'var(--surface-high)', ic: 'var(--on-surface-variant)' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-icons" style={{ color: s.ic, fontSize: 22 }}>{s.icon}</span>
            </div>
            <div className="stat-value" style={{ fontSize: '1.75rem' }}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="input-icon-wrap">
          <span className="material-icons icon">search</span>
          <input className="input" placeholder="Search by branch name or ID…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Branch Code</th><th>Name & Location</th><th>Admin</th><th>Staff</th><th>Status</th><th>Rating</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.875rem' }}>{b.id}</td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{b.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{b.address}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.admin}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{b.phone}</div>
                  </td>
                  <td>{b.staff} members</td>
                  <td>
                    <span className={`badge ${b.status === 'Online' ? 'badge-success' : b.status === 'Maintenance' ? 'badge-error' : 'badge-warning'}`}>{b.status}</span>
                  </td>
                  <td>
                    {b.rating > 0
                      ? <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ color: '#f59e0b', fontWeight: 700 }}>★</span>
                          <span style={{ fontWeight: 600 }}>{b.rating}</span>
                        </span>
                      : <span style={{ color: 'var(--outline)' }}>—</span>
                    }
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-primary btn-sm">Manage</button>
                      <button className="btn btn-ghost btn-sm">Settings</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
