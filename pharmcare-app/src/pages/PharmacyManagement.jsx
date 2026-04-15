import { useState, useEffect } from 'react'

export default function PharmacyManagement() {
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '', location: '', address: '', contactPhone: ''
  })

  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/pharmacies')
      const data = await res.json()
      setBranches(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Fetch branches error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddBranch = async (e) => {
    e.preventDefault()
    try {
      const isEdit = !!formData._id
      const url = isEdit ? `/api/pharmacies/${formData._id}` : '/api/pharmacies'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        setShowModal(false)
        fetchBranches()
        setFormData({ name: '', location: '', address: '', contactPhone: '' })
        alert(`Pharmacy branch ${isEdit ? 'updated' : 'added'} successfully!`)
      } else {
        const error = await res.json()
        alert(`Error: ${error.message}`)
      }
    } catch (err) {
      alert('Error connecting to server')
    }
  }

  const handleEdit = (b) => {
    setFormData({
      _id: b._id,
      name: b.name,
      location: b.location,
      address: b.address,
      contactPhone: b.contactPhone || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this pharmacy branch?')) return
    try {
      const res = await fetch(`/api/pharmacies/${id}`, { method: 'DELETE' })
      if (res.ok) fetchBranches()
      else alert('Failed to delete pharmacy')
    } catch (err) { alert('Connection error') }
  }

  const filtered = branches.filter(b => b.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <>
      <div className="fade-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h1 className="page-title">Pharmacy Network Management</h1>
            <p className="page-subtitle">Manage branches, access control, and configurations</p>
          </div>
          <button className="btn btn-primary" onClick={() => {
            setFormData({ name: '', location: '', address: '', contactPhone: '' })
            setShowModal(true)
          }}>
            <span className="material-icons" style={{ fontSize: 18 }}>add_business</span> Add Branch
          </button>
        </div>

        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total Branches', val: branches.length, icon: 'business', bg: 'var(--primary-fixed)', ic: 'var(--primary-container)' },
            { label: 'Network Cities', val: [...new Set(branches.map(b => b.location))].length, icon: 'map', bg: 'var(--secondary-fixed)', ic: 'var(--secondary)' },
            { label: 'Active Staff', val: '—', icon: 'groups', bg: 'var(--tertiary-fixed)', ic: 'var(--tertiary-container)' },
            { label: 'Support Contacts', val: branches.filter(b => b.contactPhone).length, icon: 'phone', bg: 'var(--surface-high)', ic: 'var(--on-surface-variant)' },
          ].map(s => (
            <div className="stat-card" key={s.label}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-icons" style={{ color: s.ic, fontSize: 22 }}>{s.icon}</span>
              </div>
              <div className="stat-value" style={{ fontSize: '1.25rem' }}>{s.val}</div>
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
                <tr><th>Branch Name</th><th>Location</th><th>Contact</th><th>Staffed By</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center" style={{ padding:40 }}>Loading branches...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="5" className="text-center" style={{ padding:40 }}>No branches found.</td></tr>
                ) : filtered.map(b => (
                  <tr key={b._id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{b.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>ID: {b._id.slice(-6).toUpperCase()}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.location}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{b.address}</div>
                    </td>
                    <td>{b.contactPhone || '—'}</td>
                    <td>{b.owner ? b.owner.name : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(b)}>
                          <span className="material-icons" style={{fontSize:18}}>edit</span>
                        </button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => handleDelete(b._id)}>
                          <span className="material-icons" style={{fontSize:18}}>delete_forever</span>
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
              <h2 className="section-title">Add New Branch</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <form onSubmit={handleAddBranch} className="login-form" style={{ marginTop:20 }}>
              <div className="input-group">
                <label className="input-label">Branch Name</label>
                <input className="input" required placeholder="Aura Pharmacy — North" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid-2" style={{ marginTop:12 }}>
                <div className="input-group">
                  <label className="input-label">City/Location</label>
                  <input className="input" required placeholder="New York" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Contact Phone</label>
                  <input className="input" required placeholder="+1 555-0000" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} />
                </div>
              </div>
              <div className="input-group" style={{ marginTop:12 }}>
                <label className="input-label">Full Address</label>
                <input className="input" required placeholder="Ahmad Plaza, Mirpur, Dhaka" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Branch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
