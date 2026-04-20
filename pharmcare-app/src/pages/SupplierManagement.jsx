import { useState, useEffect } from 'react'
import { exportToCSV } from '../utils/csvExport'
import { useRole } from '../context/RoleContext'

export default function SupplierManagement() {
  const { userData } = useRole()
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', role: 'Supplier', password: 'temp123'
  })

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${userData?.token || localStorage.getItem('token')}` }
      })
      const data = await res.json()
      const suppliersOnly = Array.isArray(data) ? data.filter(u => u.role === 'Supplier') : []
      setSuppliers(suppliersOnly)
    } catch (err) {
      console.error('Failed to fetch suppliers', err)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    const headers = ['Company', 'Email', 'Phone', 'Status']
    const exportData = filtered.map(s => ({
      company: s.name,
      email: s.email,
      phone: s.phone || '',
      status: s.isApproved ? 'Verified' : 'Pending'
    }))
    exportToCSV(exportData, 'SuppliersReport', headers)
  }

  const handleAddSupplier = async (e) => {
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
        body: JSON.stringify({ ...formData, password: isEdit ? undefined : 'temp123', isApproved: true })
      })
      if (res.ok) {
        setShowModal(false)
        fetchSuppliers()
        setFormData({ name: '', email: '', phone: '', role: 'Supplier', password: 'temp123' })
        alert(`Supplier ${isEdit ? 'updated' : 'registered'} successfully!`)
      } else {
        const err = await res.json()
        alert(err.message || 'Error saving supplier')
      }
    } catch (err) {
      alert('Error connecting to server')
    }
  }

  const handleEdit = (s) => {
    setFormData({
      _id: s._id,
      name: s.name,
      email: s.email,
      phone: s.phone || '',
      role: 'Supplier'
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this supplier?')) return
    try {
      const res = await fetch(`/api/users/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${userData?.token || localStorage.getItem('token')}` }
      })
      if (res.ok) fetchSuppliers()
      else alert('Failed to delete supplier')
    } catch (err) { alert('Connection error') }
  }

  const filtered = suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()))

  return (
    <>
      <div className="fade-up">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <div className="page-header" style={{ marginBottom:0 }}>
            <h1 className="page-title">Supplier Management</h1>
            <p className="page-subtitle">{suppliers.length} registered partners</p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-ghost" onClick={handleExport}>
              <span className="material-icons" style={{fontSize:18}}>download</span> Export CSV
            </button>
            <button className="btn btn-primary" onClick={() => {
              setFormData({ name: '', email: '', phone: '', role: 'Supplier', password: 'temp123' })
              setShowModal(true)
            }}>
              <span className="material-icons" style={{fontSize:18}}>add_business</span> Add Supplier
            </button>
          </div>
        </div>

        <div style={{ marginBottom:16 }}>
          <div className="input-icon-wrap">
            <span className="material-icons icon">search</span>
            <input className="input" placeholder="Search suppliers by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="card" style={{ padding:0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Supplier</th><th>Email</th><th>Contact</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? (
                  [1,2,3,4].map(i => (
                    <tr key={i}>
                      <td><div style={{ display:'flex', alignItems:'center', gap:10 }}><div className="skeleton skeleton-avatar" style={{width:36, height:36, borderRadius:8}} /><div className="skeleton skeleton-text short" style={{margin:0}} /></div></td>
                      <td><div className="skeleton skeleton-text" style={{margin:0}} /></td>
                      <td><div className="skeleton skeleton-text short" style={{margin:0}} /></td>
                      <td><div className="skeleton skeleton-text" style={{margin:0, width:60}} /></td>
                      <td><div className="skeleton skeleton-text" style={{margin:0, width:40}} /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign:'center', padding:40 }}>No suppliers found.</td></tr>
                ) : filtered.map(s => (
                  <tr key={s._id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:8, background:'var(--primary-fixed)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <span className="material-icons" style={{ color:'var(--primary-container)', fontSize:20 }}>business</span>
                        </div>
                        <div style={{ fontWeight:700 }}>{s.name}</div>
                      </div>
                    </td>
                    <td>{s.email}</td>
                    <td>{s.phone || '—'}</td>
                    <td><span className={`badge ${s.isApproved ? 'badge-success':'badge-warning'}`}>{s.isApproved ? 'Verified' : 'Pending'}</span></td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(s)}>
                          <span className="material-icons" style={{fontSize:18}}>edit</span>
                        </button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => handleDelete(s._id)}>
                          <span className="material-icons" style={{fontSize:18}}>delete_sweep</span>
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

      {/* Add Supplier Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="section-header">
              <h2 className="section-title">New Supplier Account</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <form onSubmit={handleAddSupplier} className="login-form" style={{ marginTop: 20 }}>
              <div className="input-group">
                <label className="input-label">Company Name</label>
                <input className="input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="input-group" style={{ marginTop: 12 }}>
                <label className="input-label">Email Address</label>
                <input className="input" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="input-group" style={{ marginTop: 12 }}>
                <label className="input-label">Contact Phone</label>
                <input className="input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
