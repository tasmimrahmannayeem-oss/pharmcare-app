import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { useRole } from '../context/RoleContext'
import { useCart } from '../context/CartContext'

export default function MedicineSearch() {
  const navigate = useNavigate()
  const { userData } = useRole()
  const { addToCart, setPrescriptionFile, prescriptionFile } = useCart()
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [sort, setSort] = useState('name-asc')
  const [showRxModal, setShowRxModal] = useState(false)
  const [pendingItem, setPendingItem] = useState(null)

  useEffect(() => {
    fetchMedicines()
  }, [])

  const fetchMedicines = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/medicines', {
        headers: { 'Authorization': `Bearer ${userData?.token}` }
      })
      const data = await res.json()
      setMedicines(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (item, isBuyNow = false) => {
    if (item.requiresPrescription && !prescriptionFile) {
      setPendingItem({ ...item, isBuyNow })
      setShowRxModal(true)
      return
    }
    addToCart(item)
    if (isBuyNow) {
      navigate('/checkout')
    } else {
      alert(`${item.name} added to cart!`)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPrescriptionFile(file)
      alert(`Prescription "${file.name}" uploaded successfully!`)
    }
  }

  const completePendingAdd = () => {
    if (pendingItem) {
      addToCart(pendingItem)
      if (pendingItem.isBuyNow) {
        navigate('/checkout')
      } else {
        alert(`${pendingItem.name} added to cart!`)
      }
      setPendingItem(null)
    }
    setShowRxModal(false)
  }

  const closeRxModal = () => {
    setShowRxModal(false)
    setPendingItem(null)
  }

  const filtered = medicines.filter(m =>
    (filter === 'All' || (m.genericName && m.genericName.toLowerCase().includes(filter.toLowerCase()))) &&
    (m.name.toLowerCase().includes(query.toLowerCase()) || (m.genericName && m.genericName.toLowerCase().includes(query.toLowerCase())))
  ).sort((a,b) => {
    if (sort === 'name-asc') return a.name.localeCompare(b.name)
    if (sort === 'price-asc') return a.sellPrice - b.sellPrice
    if (sort === 'price-desc') return b.sellPrice - a.sellPrice
    return 0
  })

  const stockStatus = (qty) => {
    if (qty === 0) return { label: 'Out of Stock', class: 'badge-error' }
    if (qty < 20) return { label: 'Low Stock', class: 'badge-warning' }
    return { label: 'In Stock', class: 'badge-success' }
  }

  return (
    <div className="fade-up">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div className="page-header" style={{ marginBottom:0 }}>
          <h1 className="page-title">Medicine Search</h1>
          <p className="page-subtitle">Search verified medicines or upload a new prescription</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowRxModal(true)}>
          <span className="material-icons" style={{fontSize:18}}>history_edu</span> New Rx
        </button>
      </div>

      <div className="card" style={{ marginBottom: 24, padding: 20 }}>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <div className="input-icon-wrap" style={{ flex:1 }}>
            <span className="material-icons icon">search</span>
            <input className="input" placeholder="Search by name or generic name…" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <select className="input" style={{ width: 160 }} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="name-asc">Sort: A-Z</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ padding:0 }}>
        <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--outline-variant)', display:'flex', justifyContent:'space-between' }}>
          <span className="label-md text-muted">{filtered.length} products available</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Medicine</th><th>Generic Name</th><th>Price</th><th>Availability</th><th>Rx</th><th>Action</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign:'center', padding:40 }}>Loading catalogue...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign:'center', padding:40 }}>No results found.</td></tr>
              ) : filtered.map(m => {
                const status = stockStatus(m.stockQuantity)
                return (
                  <tr key={m._id}>
                    <td style={{ fontWeight:600 }}>{m.name}</td>
                    <td style={{ fontSize:'0.8125rem', color:'var(--on-surface-variant)' }}>{m.genericName || '—'}</td>
                    <td style={{ fontWeight:700, color:'var(--primary-container)' }}>৳{(m.sellPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td><span className={`badge ${status.class}`}>{status.label}</span></td>
                    <td>{m.requiresPrescription ? <span className="badge badge-error">Required</span> : <span className="badge badge-success">OTC</span>}</td>
                    <td>
                      <div style={{ display:'flex', gap:8 }}>
                        <button className="btn btn-secondary btn-sm" disabled={m.stockQuantity === 0} onClick={() => handleAddToCart(m)}>
                          <span className="material-icons" style={{fontSize:14}}>add_shopping_cart</span> 
                          {m.requiresPrescription ? 'Add Rx' : 'Add'}
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleAddToCart(m, true)}>Buy Now</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Prescription Modal */}
      {showRxModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div 
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)' }} 
            onClick={closeRxModal} 
          />
          <div style={{ 
            position: 'relative', background: 'white', borderRadius: 12, padding: 32, 
            width: '90%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', 
            zIndex: 100000, color: '#1a1c1e', boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Upload Prescription</h2>
              <button 
                onClick={closeRxModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <div style={{ textAlign: 'center' }}>
              <input type="file" id="rx-upload-search" hidden onChange={handleFileChange} accept="image/*,application/pdf" />
              <label htmlFor="rx-upload-search" style={{ border: prescriptionFile ? '2px solid #006c49' : '2px dashed #ddd', borderRadius: 12, padding: 40, background: '#f8f9fa', cursor: 'pointer', display: 'block' }}>
                <span className="material-icons" style={{ fontSize: 48, color: prescriptionFile ? '#006c49' : '#00288e' }}>{prescriptionFile ? 'task' : 'upload_file'}</span>
                <p style={{ marginTop: 12, fontWeight: 500, color: '#1a1c1e' }}>{prescriptionFile ? prescriptionFile.name : 'Click to upload prescription'}</p>
                <p style={{ fontSize: '0.75rem', color: '#666' }}>JPG, PNG or PDF (Max 5MB)</p>
              </label>
              
              <button 
                style={{ width: '100%', marginTop: 24, padding: '14px', background: '#00288e', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
                onClick={() => prescriptionFile ? completePendingAdd() : document.getElementById('rx-upload-search').click()}
              >
                {prescriptionFile 
                  ? (pendingItem ? `Add ${pendingItem.name} & Continue` : 'Continue Shopping')
                  : 'Browse Files'}
              </button>
              
              <button 
                style={{ width: '100%', marginTop: 8, padding: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontWeight: 500 }}
                onClick={closeRxModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
