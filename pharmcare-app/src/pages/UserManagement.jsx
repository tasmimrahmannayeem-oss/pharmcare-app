import { useState, useEffect } from 'react'
import { exportToCSV } from '../utils/csvExport'

const roleBadge = {
  'Super Admin': 'badge-error',
  'Pharmacy Owner': 'badge-info',
  'Pharmacist': 'badge-success',
  'Store Assistant': 'badge-neutral',
  'Supplier': 'badge-warning',
  'Customer': 'badge-neutral',
}

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [pharmacies, setPharmacies] = useState([])
  
  const [formData, setFormData] = useState({
    name: '', email: '', role: 'Pharmacist', assignedPharmacy: ''
  })

  useEffect(() => {
    fetchUsers()
    fetchPharmacies()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/users', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Fetch users error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPharmacies = async () => {
    try {
      const res = await fetch('/api/pharmacies', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      const data = await res.json()
      setPharmacies(Array.isArray(data) ? data : [])
    } catch (err) {}
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    try {
      const isEdit = !!formData._id
      const url = isEdit ? `/api/users/${formData._id}` : '/api/auth/register'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...formData, password: isEdit ? undefined : 'temp123', isApproved: true })
      })
      if (res.ok) {
        setShowModal(false)
        setFormData({ name: '', email: '', role: 'Pharmacist', assignedPharmacy: '' })
        fetchUsers()
        alert(`User ${isEdit ? 'updated' : 'added'} successfully!`)
      } else {
        const error = await res.json()
        alert(`Error: ${error.message}`)
      }
    } catch (err) {
      alert('Error connecting to server')
    }
  }

  const handleEdit = (user) => {
    setFormData({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      assignedPharmacy: user.assignedPharmacy?._id || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    try {
      const res = await fetch(`/api/users/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      if (res.ok) fetchUsers()
      else alert('Failed to delete user')
    } catch (err) { alert('Connection error') }
  }

  const handleResetPassword = async () => {
    const newPassword = prompt('Enter the new password (min. 6 characters):');
    if (!newPassword) return;
    if (newPassword.length < 6) return alert('Password must be at least 6 characters long.');
    
    try {
      const res = await fetch(`/api/users/${formData._id}/password`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ newPassword })
      });
      if (res.ok) alert('Password reset successfully!');
      else {
        const error = await res.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      alert('Error connecting to server');
    }
  }

  const handleExport = () => {
    const headers = ['Name', 'Email', 'Role', 'Status']
    const exportData = filtered.map(u => ({
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.isApproved ? 'Active' : 'Pending'
    }))
    exportToCSV(exportData, 'SystemUsers', headers)
  }

  const filtered = users.filter(u =>
    (roleFilter === 'All' || u.role === roleFilter) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <>
      <div className="fade-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h1 className="page-title">User Management</h1>
            <p className="page-subtitle">System-wide user administration · {users.length} total users</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={handleExport}>
              <span className="material-icons" style={{ fontSize: 18 }}>download</span> Export CSV
            </button>
            <button className="btn btn-primary" onClick={() => {
              setFormData({ name: '', email: '', role: 'Pharmacist', assignedPharmacy: '' })
              setShowModal(true)
            }}>
              <span className="material-icons" style={{ fontSize: 18 }}>person_add</span> Add User
            </button>
          </div>
        </div>

        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total Users', val: users.length, icon: 'group', bg: 'var(--primary-fixed)', ic: 'var(--primary-container)' },
            { label: 'Staff Members', val: users.filter(u => !['Customer','Supplier'].includes(u.role)).length, icon: 'badge', bg: 'var(--secondary-fixed)', ic: 'var(--secondary)' },
            { label: 'Suppliers', val: users.filter(u => u.role === 'Supplier').length, icon: 'local_shipping', bg: 'var(--tertiary-fixed)', ic: 'var(--tertiary-container)' },
            { label: 'Customers', val: users.filter(u => u.role === 'Customer').length, icon: 'person_outline', bg: 'var(--surface-high)', ic: 'var(--on-surface-variant)' },
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
            {['All', 'Pharmacy Owner', 'Pharmacist', 'Store Assistant', 'Supplier', 'Customer'].map(r => (
              <button key={r} className={`badge ${roleFilter === r ? 'badge-info' : 'badge-neutral'}`}
                style={{ cursor: 'pointer', padding: '7px 12px', fontSize: '0.8rem' }} onClick={() => setRoleFilter(r)}>{r}</button>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center" style={{ padding:40 }}>Loading users...</td></tr>
                ) : filtered.map(u => (
                  <tr key={u._id}>
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
                    <td>
                      <span className={`badge ${u.isApproved ? 'badge-success' : 'badge-warning'}`}>{u.isApproved ? 'Active' : 'Pending'}</span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(u)}>
                          <span className="material-icons" style={{fontSize:18}}>edit</span>
                        </button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => handleDelete(u._id)}>
                          <span className="material-icons" style={{fontSize:18}}>delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="section-header">
              <h2 className="section-title">Add System User</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <form onSubmit={handleAddUser} className="login-form" style={{ marginTop:20 }}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input className="input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="input-group" style={{ marginTop:12 }}>
                <label className="input-label">Email Address</label>
                <input className="input" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="grid-2" style={{ marginTop:12 }}>
                <div className="input-group">
                  <label className="input-label">Role</label>
                  <select className="input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="Pharmacy Owner">Pharmacy Owner</option>
                    <option value="Pharmacist">Pharmacist</option>
                    <option value="Store Assistant">Store Assistant</option>
                    <option value="Supplier">Supplier</option>
                    <option value="Customer">Customer</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Assign Branch</label>
                  <select className="input" value={formData.assignedPharmacy} onChange={e => setFormData({...formData, assignedPharmacy: e.target.value})}>
                    <option value="">None (Global)</option>
                    {pharmacies.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end', alignItems: 'center' }}>
                {formData._id && (
                  <button type="button" className="btn btn-ghost" style={{ marginRight: 'auto', color: 'var(--error)' }} onClick={handleResetPassword}>
                    <span className="material-icons" style={{ fontSize: 18 }}>lock_reset</span> Reset Password
                  </button>
                )}
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{formData._id ? 'Save Changes' : 'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
