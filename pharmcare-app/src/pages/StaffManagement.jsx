import { useState, useEffect } from 'react'
import { useRole } from '../context/RoleContext'
import { exportToCSV } from '../utils/csvExport'

export default function StaffManagement() {
  const { userData } = useRole()
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', role: 'Pharmacist', password: 'temp123'
  })

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${userData?.token || localStorage.getItem('token')}` }
      })
      const data = await res.json()
      const staffOnly = Array.isArray(data) ? data.filter(u => u.role !== 'Customer' && u.role !== 'Supplier') : []
      setTeam(staffOnly)
    } catch (err) {
      console.error('Failed to fetch staff', err)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    const headers = ['Name', 'Role', 'Email', 'Phone', 'Joined']
    const exportData = filtered.map(s => ({
      name: s.name,
      role: s.role,
      email: s.email,
      phone: s.phone || '',
      joined: new Date(s.createdAt).toLocaleDateString()
    }))
    exportToCSV(exportData, 'StaffReport', headers)
  }

  const handleAddStaff = async (e) => {
    e.preventDefault()
    try {
      const isEdit = !!formData._id
      const url = isEdit ? `/api/users/${formData._id}` : '/api/auth/register'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData?.token || localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          ...formData, 
          password: isEdit ? undefined : 'temp123', 
          isApproved: true,
          assignedPharmacy: userData?.assignedPharmacy // Auto-link new staff to current branch
        }) 
      })
      if (res.ok) {
        setShowModal(false)
        setFormData({ name: '', email: '', phone: '', role: 'Pharmacist', password: 'temp123' })
        fetchStaff()
        alert(`Staff ${isEdit ? 'updated' : 'registered'} successfully!`)
      } else {
        const err = await res.json()
        alert(err.message || 'Error saving staff')
      }
    } catch (err) {
      alert('Error connecting to server')
    }
  }

  const handleEdit = (staff) => {
    setFormData({
      _id: staff._id,
      name: staff.name,
      email: staff.email,
      phone: staff.phone || '',
      role: staff.role
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this staff member?')) return
    try {
      const res = await fetch(`/api/users/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${userData?.token || localStorage.getItem('token')}` }
      })
      if (res.ok) fetchStaff()
      else alert('Failed to delete staff member')
    } catch (err) { alert('Connection error') }
  }

  const filtered = team.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'All' || s.role === roleFilter
    return matchesSearch && matchesRole
  }).sort((a,b) => a.name.localeCompare(b.name))

  const statusBadge = (s) => s.isApproved ? 'badge-success' : 'badge-warning'

  return (
    <>
      <div className="fade-up">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <div className="page-header" style={{ marginBottom:0 }}>
            <h1 className="page-title">Staff Management</h1>
            <p className="page-subtitle">Team Overview · {team.length} members</p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-ghost" onClick={handleExport}>
              <span className="material-icons" style={{fontSize:18}}>download</span> Export CSV
            </button>
            <button className="btn btn-primary" onClick={() => {
              setFormData({ name: '', email: '', phone: '', role: 'Pharmacist', password: 'temp123' })
              setShowModal(true)
            }}>
              <span className="material-icons" style={{fontSize:18}}>person_add</span> Add Staff
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:12, marginBottom:20 }}>
          <div className="input-icon-wrap" style={{ flex: 1 }}>
            <span className="material-icons icon">search</span>
            <input className="input" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input" style={{ width: 180 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="All">All Roles</option>
            <option value="Pharmacist">Pharmacists</option>
            <option value="Store Assistant">Assistants</option>
            <option value="Pharmacy Owner">Owners</option>
          </select>
        </div>

        {loading ? (
          <div className="card text-center" style={{ padding: 40 }}>Loading team details...</div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:16 }}>
            {filtered.map(s => (
              <div key={s._id} className="card" style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:48, height:48, borderRadius:'50%', background:'linear-gradient(135deg,var(--primary),var(--primary-container))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span className="material-icons" style={{ color:'white', fontSize:26 }}>person</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700 }}>{s.name}</div>
                    <div style={{ fontSize:'0.8125rem', color:'var(--on-surface-variant)' }}>{s.role}</div>
                  </div>
                  <span className={`badge ${statusBadge(s)}`}>{s.isApproved ? 'Active' : 'Pending'}</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {[
                    ['Email', s.email, 'email'],
                    ['Phone', s.phone || '—', 'phone'],
                    ['Joined', new Date(s.createdAt).toLocaleDateString(), 'calendar_today'],
                    ['ID', s._id.slice(-6).toUpperCase(), 'badge']
                  ].map(([l,v,icon]) => (
                    <div key={l} style={{ background:'var(--surface-low)', borderRadius:8, padding:'8px 10px' }}>
                      <div style={{ fontSize:'0.7rem', color:'var(--on-surface-variant)', fontWeight:500, display:'flex', alignItems:'center', gap:4 }}>
                        <span className="material-icons" style={{fontSize:12}}>{icon}</span>{l}
                      </div>
                      <div style={{ fontWeight:600, fontSize:'0.8125rem', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-ghost btn-sm" style={{ flex:1 }} onClick={() => handleEdit(s)}>
                    <span className="material-icons" style={{fontSize:16, marginRight:6}}>edit</span>
                    Edit
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ flex:1, color:'var(--error)' }} onClick={() => handleDelete(s._id)}>
                    <span className="material-icons" style={{fontSize:16, marginRight:6}}>person_remove</span>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="section-header">
              <h2 className="section-title">Register New Staff</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <form onSubmit={handleAddStaff} className="login-form" style={{ marginTop: 20 }}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input className="input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="input-group" style={{ marginTop: 12 }}>
                <label className="input-label">Email Address</label>
                <input className="input" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="input-group" style={{ marginTop: 12 }}>
                <label className="input-label">Phone Number</label>
                <input className="input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="input-group" style={{ marginTop: 12 }}>
                <label className="input-label">Role</label>
                <select className="input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="Pharmacist">Pharmacist</option>
                  <option value="Store Assistant">Store Assistant</option>
                  <option value="Pharmacy Owner">Pharmacy Owner</option>
                </select>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: 16 }}>
                * A temporary password (temp123) will be generated.
              </p>
              <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Confirm & Register</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
