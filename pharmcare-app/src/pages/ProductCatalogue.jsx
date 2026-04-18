import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRole } from '../context/RoleContext'
import { createPortal } from 'react-dom'
import { useCart } from '../context/CartContext'

export default function ProductCatalogue() {
  const navigate = useNavigate()
  const { userData } = useRole()
  const { addToCart, setPrescriptionFile, prescriptionFile, selectedPharmacy } = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [cat, setCat] = useState('All')
  const [showRxModal, setShowRxModal] = useState(false)
  const [pendingItem, setPendingItem] = useState(null)

  useEffect(() => {
    if (selectedPharmacy) {
      fetchProducts()
    } else {
      setProducts([])
      setLoading(false)
    }
  }, [selectedPharmacy])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/medicines?pharmacy=${selectedPharmacy?._id || ''}`, {
        headers: { 'Authorization': `Bearer ${userData?.token}` }
      })
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (p) => {
    if (p.requiresPrescription && !prescriptionFile) {
      setPendingItem(p)
      setShowRxModal(true)
      return
    }
    addToCart(p)
    alert(`${p.name} added to cart!`)
  }

  const completePendingAdd = () => {
    if (pendingItem) {
      addToCart(pendingItem)
      alert(`${pendingItem.name} added to cart!`)
      setPendingItem(null)
    }
    setShowRxModal(false)
  }

  const closeRxModal = () => {
    setShowRxModal(false)
    setPendingItem(null)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPrescriptionFile(file)
      alert(`Prescription "${file.name}" uploaded successfully!`)
    }
  }

  const cats = ['All', 'Antibiotic', 'Pain Relief', 'Diabetes', 'Allergy', 'Cardio', 'Supplements']
  const filtered = products.filter(p => 
    cat === 'All' || (p.genericName && p.genericName.toLowerCase().includes(cat.toLowerCase()))
  )

  return (
    <>
      <div className="fade-up">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <div className="page-header" style={{ marginBottom:0 }}>
            <h1 className="page-title">Product Catalogue</h1>
            <p className="page-subtitle">{products.length} medicines available across all categories</p>
          </div>
          <button className={`btn ${prescriptionFile ? 'btn-secondary' : 'btn-primary'}`} onClick={() => setShowRxModal(true)}>
            <span className="material-icons" style={{fontSize:18}}>{prescriptionFile ? 'check_circle' : 'history_edu'}</span> 
            {prescriptionFile ? 'Rx Uploaded' : 'New Rx'}
          </button>
        </div>

        {/* Category chips */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:24 }}>
          {cats.map(c => (
            <button key={c}
              className={`badge ${cat===c ? 'badge-info' : 'badge-neutral'}`}
              style={{ cursor:'pointer', padding:'7px 16px', fontSize:'0.875rem' }}
              onClick={() => setCat(c)}
            >{c}</button>
          ))}
        </div>

        {loading ? (
          <div className="card text-center" style={{ padding:60 }}>Loading premium catalogue...</div>
        ) : !selectedPharmacy ? (
          <div className="card text-center" style={{ padding: 80 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <span className="material-icons" style={{ fontSize: 64, color: 'var(--outline)' }}>location_on</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>Please select a pharmacy branch to browse medicines</div>
            </div>
          </div>
        ) : (
          <div className="grid-3">
            {filtered.map(p => (
              <div key={p._id} className="card" style={{ padding:0, overflow:'hidden', cursor:'pointer', transition:'transform 0.15s, box-shadow 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,40,142,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='var(--shadow-card)'; }}
              >
                <div style={{ height:140, background:'linear-gradient(135deg, var(--primary-fixed) 0%, var(--primary-fixed-dim) 100%)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                  <span className="material-icons" style={{ fontSize:56, color:'var(--primary-container)', opacity:0.6 }}>medication</span>
                  {p.requiresPrescription && <span className="badge badge-error" style={{ position:'absolute', top:12, right:12 }}>Rx</span>}
                </div>
                <div style={{ padding:'16px 18px', display:'flex', flexDirection:'column', gap:8 }}>
                  <div>
                    <div style={{ fontSize:'0.75rem', color:'var(--on-surface-variant)', fontWeight:500 }}>{p.genericName || 'Medicine'}</div>
                    <div style={{ fontWeight:700, fontSize:'0.9375rem', marginTop:2 }}>{p.name}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontFamily:'var(--font-headline)', fontSize:'1.25rem', fontWeight:800, color:'var(--primary-container)' }}>৳{(p.sellPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    <button className="btn btn-secondary btn-sm" disabled={p.stockQuantity === 0} onClick={() => handleAddToCart(p)}>
                      <span className="material-icons" style={{fontSize:15}}>add_shopping_cart</span>
                      {p.stockQuantity === 0 ? 'Out of Stock' : (p.requiresPrescription ? 'Add Rx' : 'Add to Cart')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Rx Modal */}
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
              <input type="file" id="rx-upload" hidden onChange={handleFileChange} accept="image/*,application/pdf" />
              <label htmlFor="rx-upload" style={{ border: prescriptionFile ? '2px solid #006c49' : '2px dashed #ddd', borderRadius: 12, padding: 40, background: '#f8f9fa', cursor: 'pointer', display: 'block' }}>
                <span className="material-icons" style={{ fontSize: 48, color: prescriptionFile ? '#006c49' : '#00288e' }}>{prescriptionFile ? 'task' : 'upload_file'}</span>
                <p style={{ marginTop: 12, fontWeight: 500, color: '#1a1c1e' }}>{prescriptionFile ? prescriptionFile.name : 'Click to upload prescription'}</p>
                <p style={{ fontSize: '0.75rem', color: '#666' }}>JPG, PNG or PDF (Max 5MB)</p>
              </label>
              
              <button 
                style={{ width: '100%', marginTop: 24, padding: '14px', background: '#00288e', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
                onClick={() => prescriptionFile ? completePendingAdd() : document.getElementById('rx-upload').click()}
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
    </>
  )
}
