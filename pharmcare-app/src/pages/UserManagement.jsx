import { useState } from 'react'

const users = [
  { name: 'Dr. Sarah Chen', email: 's.chen@aurahealth.com', role: 'Pharmacy Admin', pharmacy: 'Green Valley', status: 'Active', joined: 'Jan 2020', lastLogin: '2 min ago' },
  { name: 'Maria Santos', email: 'm.santos@aurahealth.com', role: 'Pharmacist', pharmacy: 'Green Valley', status: 'Active', joined: 'Mar 2021', lastLogin: '1 hr ago' },
  { name: 'James Lee', email: 'j.lee@aurahealth.com', role: 'Pharmacy Technician', pharmacy: 'Green Valley', status: 'Inactive', joined: 'Jun 2022', lastLogin: '3 days ago' },
  { name: 'John Smith', email: 'john.s@email.com', role: 'Customer', pharmacy: '—', status: 'Active', joined: 'Feb 2024', lastLogin: '10 min ago' },
  { name: 'MediSupply Ltd.', email: 'orders@medisupply.com', role: 'Supplier', pharmacy: '—', status: 'Active', joined: 'Nov 2023', lastLogin: '4 hr ago' },
  { name: 'Dr. Mark Liu', email: 'm.liu@aurahealth.com', role: 'Pharmacy Admin', pharmacy: 'Westside', status: 'Active', joined: 'May 2021', lastLogin: '30 min ago' },
  { name: 'Anna Kwak', email: 'a.kwak@aurahealth.com', role: 'Cashier', pharmacy: 'Green Valley', status: 'Active', joined: 'Sep 2022', lastLogin: 'Just now' },
  { name: 'System Admin', email: 'admin@spmis.com', role: 'Super Admin', pharmacy: 'All', status: 'Active', joined: 'Jan 2020', lastLogin: 'Just now' },
]

const roleBadge = {
  'Super Admin': 'badge-error',
  'Pharmacy Admin': 'badge-info',
  'Pharmacist': 'badge-success',
  'Pharmacy Technician': 'badge-neutral',
  'Cashier': 'badge-neutral',
  'Supplier': 'badge-warning',
  'Customer': 'badge-neutral',
}

export default function UserManagement() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const roles = ['All', 'Super Admin', 'Pharmacy Admin', 'Pharmacist', 'Pharmacy Technician', 'Cashier', 'Supplier', 'Customer']

  const filtered = users.filter(u =>
    (roleFilter === 'All' || u.role === roleFilter) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">System-wide user administration · {users.length} total users</p>
        </div>
        <button className="btn btn-primary">
          <span className="material-icons" style={{ fontSize: 18 }}>person_add</span> Add User
        </button>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Users', val: users.length, icon: 'group', bg: 'var(--primary-fixed)', ic: 'var(--primary-container)' },
          { label: 'Active Users', val: users.filter(u => u.status === 'Active').length, icon: 'check_circle', bg: 'var(--secondary-fixed)', ic: 'var(--secondary)' },
          { label: 'Inactive/Suspended', val: users.filter(u => u.status !== 'Active').length, icon: 'block', bg: 'var(--error-container)', ic: 'var(--error)' },
          { label: 'Admins', val: users.filter(u => u.role.includes('Admin')).length, icon: 'admin_panel_settings', bg: 'var(--tertiary-fixed)', ic: 'var(--tertiary-container)' },
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

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="input-icon-wrap" style={{ flex: 1, minWidth: 200 }}>
          <span className="material-icons icon">search</span>
          <input className="input" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['All', 'Pharmacy Admin', 'Pharmacist', 'Supplier', 'Customer'].map(r => (
            <button key={r} className={`badge ${roleFilter === r ? 'badge-info' : 'badge-neutral'}`}
              style={{ cursor: 'pointer', padding: '7px 12px', fontSize: '0.8rem' }} onClick={() => setRoleFilter(r)}>{r}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>User</th><th>Role</th><th>Pharmacy</th><th>Status</th><th>Last Login</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.email}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--primary-container))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className="material-icons" style={{ color: 'white', fontSize: 18 }}>person</span>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{u.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge ${roleBadge[u.role]}`}>{u.role}</span></td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>{u.pharmacy}</td>
                  <td>
                    <span className={`badge ${u.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>{u.status}</span>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>{u.lastLogin}</td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>{u.joined}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm">Edit</button>
                      <button className="btn btn-danger btn-sm">{u.status === 'Active' ? 'Suspend' : 'Activate'}</button>
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
