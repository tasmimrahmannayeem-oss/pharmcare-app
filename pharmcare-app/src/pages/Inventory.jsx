import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRole } from '../context/RoleContext'
import { exportToCSV } from '../utils/csvExport'

export default function Inventory() {
  const { role, userData } = useRole()
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '', genericName: '', batchNumber: '', stockQuantity: 0,
    purchasePrice: 0, sellPrice: 0, manufacturer: '',
    mfgDate: '', expiryDate: '', requiresPrescription: false
  })

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/medicines', {
        headers: { 'Authorization': `Bearer ${userData?.token}` }
      })
      const data = await res.json()
      setInventory(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch inventory', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item) => {
    setFormData({
      ...item,
      mfgDate: item.mfgDate ? item.mfgDate.split('T')[0] : '',
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this medicine?')) return
    try {
      const res = await fetch(`/api/medicines/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${userData?.token}` }
      })
      if (res.ok) fetchInventory()
    } catch (err) { alert('Failed to delete') }
  }

  const handleStockUpdate = async (id, newQty) => {
    try {
      const res = await fetch(`/api/medicines/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData?.token}`
        },
        body: JSON.stringify({ stockQuantity: Math.max(0, newQty) })
      })
      if (res.ok) fetchInventory()
    } catch (err) { alert('Failed to update stock') }
  }

  const handleExport = () => {
    const headers = ['Name', 'Generic Name', 'Batch Number', 'Stock Quantity', 'Sell Price', 'Expiry Date']
    const exportData = filtered.map(i => ({
      name: i.name,
      genericname: i.genericName,
      batchnumber: i.batchNumber,
      stockquantity: i.stockQuantity,
      sellprice: i.sellPrice,
      expirydate: new Date(i.expiryDate).toLocaleDateString()
    }))
    exportToCSV(exportData, 'InventoryReport', headers)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const isEdit = !!formData._id
      const url = isEdit ? `/api/medicines/${formData._id}` : '/api/medicines'
      const method = isEdit ? 'PATCH' : 'POST'
      
      if (!userData?.assignedPharmacy && role !== 'superadmin') {
        alert('You must be assigned to a pharmacy branch to manage inventory.')
        return
      }

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData?.token}`
        },
        body: JSON.stringify({
          ...formData,
          pharmacy: userData?.assignedPharmacy
        })
      })
      if (res.ok) {
        setShowModal(false)
        setFormData({
          name: '', genericName: '', batchNumber: '', stockQuantity: 0,
          purchasePrice: 0, sellPrice: 0, manufacturer: '',
          mfgDate: '', expiryDate: '', requiresPrescription: false
        })
        fetchInventory()
        alert(`Medicine ${isEdit ? 'updated' : 'added'} successfully!`)
      }
    } catch (err) {
      alert('Error saving medicine')
    }
  }

  const filtered = inventory.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    (i.genericName && i.genericName.toLowerCase().includes(search.toLowerCase()))
  )

  const getStatusBadge = (item) => {
    const expiryDate = new Date(item.expiryDate)
    const today = new Date()
    const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
    
    if (item.stockQuantity === 0) return 'badge-error'
    if (item.stockQuantity < 20) return 'badge-warning'
    if (diffDays < 30) return 'badge-warning'
    return 'badge-success'
  }

  const getStatusText = (item) => {
    const expiryDate = new Date(item.expiryDate)
    const today = new Date()
    const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))

    if (item.stockQuantity === 0) return 'Out of Stock'
    if (item.stockQuantity < 20) return 'Low Stock'
    if (diffDays < 30) return 'Near Expiry'
    return 'In Stock'
  }

  return (
    <>
      <div className="fade-up">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <div className="page-header" style={{ marginBottom:0 }}>
            <h1 className="page-title">Inventory Management</h1>
            <p className="page-subtitle">
              Branch: {userData?.assignedPharmacy ? 'Dhanmondi (Assigned)' : 'Not Assigned'} · {inventory.length} SKUs tracked
            </p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-ghost btn-sm" onClick={handleExport}><span className="material-icons" style={{fontSize:16}}>download</span> Export CSV</button>
            <button className="btn btn-primary btn-sm" onClick={() => {
              setFormData({
                name: '', genericName: '', batchNumber: '', stockQuantity: 0,
                purchasePrice: 0, sellPrice: 0, manufacturer: '',
                mfgDate: '', expiryDate: '', requiresPrescription: false
              })
              setShowModal(true)
            }}><span className="material-icons" style={{fontSize:16}}>add</span> Add Item</button>
          </div>
        </div>

        <div className="grid-4" style={{ marginBottom:24 }}>
          {[
            { label:'Total SKUs', val: inventory.length, icon:'inventory_2', bg:'var(--primary-fixed)', ic:'var(--primary-container)' },
            { label:'Low Stock', val: inventory.filter(i => i.stockQuantity < 10).length, icon:'warning', bg:'var(--error-container)', ic:'var(--error)' },
            { label:'Near Expiry', val: inventory.filter(i => {
               const d = (new Date(i.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
               return d < 30 && d > 0
            }).length, icon:'schedule', bg:'var(--tertiary-fixed)', ic:'var(--tertiary-container)' },
            { label:'Total Stock', val: inventory.reduce((a,b)=>a+b.stockQuantity, 0), icon:'analytics', bg:'var(--secondary-fixed)', ic:'var(--secondary)' },
          ].map(s => (
            <div className="stat-card" key={s.label}>
              <div style={{ width:40, height:40, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span className="material-icons" style={{ color:s.ic, fontSize:22 }}>{s.icon}</span>
              </div>
              <div className="stat-value" style={{ fontSize:'1.75rem' }}>{s.val}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom:16 }}>
          <div className="input-icon-wrap">
            <span className="material-icons icon">search</span>
            <input className="input" placeholder="Search by name, generic name or SKU…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="card" style={{ padding:0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Medicine</th><th>Batch #</th><th>Quantity</th><th>Price (Sell)</th><th>Expiry</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" style={{ textAlign:'center', padding: 40 }}>Loading inventory...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign:'center', padding: 40 }}>No medicines found.</td></tr>
                ) : filtered.map(item => (
                  <tr key={item._id}>
                    <td>
                      <div style={{ fontWeight:600 }}>{item.name}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--on-surface-variant)' }}>{item.genericName}</div>
                    </td>
                    <td><code style={{ fontSize:'0.8rem' }}>{item.batchNumber}</code></td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <button className="btn btn-ghost btn-sm" style={{padding:'2px 6px', height:'auto'}} onClick={() => handleStockUpdate(item._id, item.stockQuantity - 1)}>−</button>
                        <span style={{ fontWeight:700, minWidth:24, textAlign:'center' }}>{item.stockQuantity}</span>
                        <button className="btn btn-ghost btn-sm" style={{padding:'2px 6px', height:'auto'}} onClick={() => handleStockUpdate(item._id, item.stockQuantity + 1)}>+</button>
                      </div>
                    </td>
                    <td style={{ fontWeight:600 }}>৳{item.sellPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td style={{ fontSize:'0.875rem' }}>{new Date(item.expiryDate).toLocaleDateString()}</td>
                    <td><span className={`badge ${getStatusBadge(item)}`}>{getStatusText(item)}</span></td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(item)}>
                          <span className="material-icons" style={{fontSize:18}}>edit</span>
                        </button>
                        <button className="btn btn-ghost btn-sm" style={{ color:'var(--error)' }} onClick={() => handleDelete(item._id)}>
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

      {showModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div 
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)' }} 
            onClick={() => setShowModal(false)} 
          />
          <div style={{ 
            position: 'relative', background: 'white', borderRadius: 12, padding: 32, 
            width: '90%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', 
            zIndex: 100000, color: '#1a1c1e', boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{formData?._id ? 'Edit Medicine' : 'Add New Medicine'}</h2>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Medicine Name</label>
                  <input 
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 6 }}
                    required 
                    placeholder="e.g. Napa" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Generic Name</label>
                  <input 
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 6 }}
                    placeholder="e.g. Paracetamol" 
                    value={formData.genericName} 
                    onChange={e => setFormData({...formData, genericName: e.target.value})} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Batch #</label>
                  <input 
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 6 }}
                    required 
                    value={formData.batchNumber} 
                    onChange={e => setFormData({...formData, batchNumber: e.target.value})} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Stock Quantity</label>
                  <input 
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 6 }}
                    type="number" 
                    required 
                    value={formData.stockQuantity} 
                    onChange={e => setFormData({...formData, stockQuantity: Number(e.target.value)})} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Purchase Price (৳)</label>
                  <input 
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 6 }}
                    type="number" 
                    required 
                    value={formData.purchasePrice} 
                    onChange={e => setFormData({...formData, purchasePrice: Number(e.target.value)})} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Sell Price (৳)</label>
                  <input 
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 6 }}
                    type="number" 
                    required 
                    value={formData.sellPrice} 
                    onChange={e => setFormData({...formData, sellPrice: Number(e.target.value)})} 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Manufacturer</label>
                <input 
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 6 }}
                  value={formData.manufacturer} 
                  onChange={e => setFormData({...formData, manufacturer: e.target.value})} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Mfg Date</label>
                  <input 
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 6 }}
                    type="date" 
                    value={formData.mfgDate} 
                    onChange={e => setFormData({...formData, mfgDate: e.target.value})} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Expiry Date</label>
                  <input 
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 6 }}
                    type="date" 
                    required 
                    value={formData.expiryDate} 
                    onChange={e => setFormData({...formData, expiryDate: e.target.value})} 
                  />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={formData.requiresPrescription} 
                  onChange={e => setFormData({...formData, requiresPrescription: e.target.checked})} 
                />
                <span style={{ fontSize: '0.9rem' }}>Requires Prescription</span>
              </label>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  style={{ flex: 1, padding: '12px', background: '#f5f5f5', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ flex: 1, padding: '12px', background: '#00288e', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
                >
                  Save Medicine
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
