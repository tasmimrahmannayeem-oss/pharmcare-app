import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useCart } from '../context/CartContext'

export default function PharmacySelectModal({ isOpen, onClose }) {
  const [pharmacies, setPharmacies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { selectedPharmacy, setSelectedPharmacy, clearCart, cartItems } = useCart()

  useEffect(() => {
    if (isOpen) {
      fetchPharmacies()
    }
  }, [isOpen])

  const fetchPharmacies = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/pharmacies', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      if (res.ok) {
        setPharmacies(Array.isArray(data) ? data : [])
      } else {
        setError(data.message || 'Failed to fetch pharmacies')
      }
    } catch (err) {
      setError('Connection error')
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (p) => {
    if (cartItems.length > 0 && selectedPharmacy?._id !== p._id) {
      if (!window.confirm('Changing your pharmacy branch will clear your current cart. Continue?')) {
        return
      }
      clearCart()
    }
    setSelectedPharmacy(p)
    onClose()
  }

  if (!isOpen) return null

  return createPortal(
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000000 }}>
      <div className="modal-content fade-up" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
        <div className="section-header">
          <h2 className="section-title">Select Pharmacy Branch</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <p style={{ color: 'var(--on-surface-variant)', marginBottom: 20 }}>
          Please choose a branch to see accurate stock availability and delivery options for your area.
        </p>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>Loading pharmacies...</div>
        ) : error ? (
          <div style={{ padding: 20, color: 'var(--error)', textAlign: 'center' }}>{error}</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {pharmacies.map(p => (
              <div 
                key={p._id} 
                className={`card ${selectedPharmacy?._id === p._id ? 'active' : ''}`}
                style={{ 
                  cursor: 'pointer', 
                  border: selectedPharmacy?._id === p._id ? '2px solid var(--primary)' : '1px solid var(--outline-variant)',
                  background: selectedPharmacy?._id === p._id ? 'var(--primary-fixed)' : 'var(--surface)'
                }}
                onClick={() => handleSelect(p)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ 
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: selectedPharmacy?._id === p._id ? 'var(--primary)' : 'var(--surface-high)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center' 
                  }}>
                    <span className="material-icons" style={{ color: selectedPharmacy?._id === p._id ? 'white' : 'var(--primary)', fontSize: 20 }}>local_pharmacy</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{p.name}</div>
                    {/* Location area */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <span className="material-icons" style={{ fontSize: 13, color: 'var(--primary)' }}>location_on</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>{p.location}</span>
                    </div>
                    {/* Full address */}
                    {p.address && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', marginTop: 3, lineHeight: 1.4 }}>
                        {p.address}
                      </div>
                    )}
                    {/* Contact phone */}
                    {p.contactPhone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5 }}>
                        <span className="material-icons" style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>phone</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)' }}>{p.contactPhone}</span>
                      </div>
                    )}
                    {/* Selected badge */}
                    {selectedPharmacy?._id === p._id && (
                      <div style={{ marginTop: 8 }}>
                        <span style={{ fontSize: '0.7rem', background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                          ✓ Selected
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>,
    document.body
  )
}
