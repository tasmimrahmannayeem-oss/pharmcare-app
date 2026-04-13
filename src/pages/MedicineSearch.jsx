import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function MedicineSearch() {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [sort, setSort] = useState('name-asc')
  const [showRxModal, setShowRxModal] = useState(false)

  useEffect(() => {
    fetchMedicines()
  }, [])

  const fetchMedicines = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/medicines')
      const data = await res.json()
      setMedicines(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (item) => {
    addToCart(item)
    alert(`${item.name} added to cart!`)
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
                    <td style={{ fontWeight:700, color:'var(--primary-container)' }}>${m.sellPrice.toFixed(2)}</td>
                    <td><span className={`badge ${status.class}`}>{status.label}</span></td>
                    <td>{m.requiresPrescription ? <span className="badge badge-error">Required</span> : <span className="badge badge-success">OTC</span>}</td>
                    <td>
                      <div style={{ display:'flex', gap:8 }}>
                        <button className="btn btn-secondary btn-sm" disabled={m.stockQuantity === 0} onClick={() => handleAddToCart(m)}>
                          <span className="material-icons" style={{fontSize:14}}>add_shopping_cart</span> Add
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/checkout')}>Buy Now</button>
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
      {showRxModal && (
        <div className="modal-overlay" onClick={() => setShowRxModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="section-header">
              <h2 className="section-title">Upload New Prescription</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowRxModal(false)}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ border: '2px dashed var(--outline-variant)', borderRadius: 12, padding: 40, background: 'var(--surface-low)', cursor: 'pointer' }}>
                <span className="material-icons" style={{ fontSize: 48, color: 'var(--primary-container)' }}>upload_file</span>
                <p style={{ marginTop: 12, fontWeight: 500 }}>Drag & drop your prescription image here</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Supports JPG, PNG (Max 5MB)</p>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 24 }} onClick={() => setShowRxModal(false)}>
                Continue Ordering
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
