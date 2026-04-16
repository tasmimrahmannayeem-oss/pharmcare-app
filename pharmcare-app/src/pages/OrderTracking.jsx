import { useState, useEffect } from 'react'
import InvoiceModal from '../components/InvoiceModal'

const statusSteps = {
  'Pending': 0,
  'Confirmed': 1,
  'Being Processed': 2,
  'Dispatched': 3,
  'Delivered': 4,
  'Cancelled': 4,
  'Rejected': 4
}

const steps = ['Order Placed', 'Confirmed', 'Processing', 'Out for Delivery', 'Delivered']
const statusBadge = { 'Pending': 'badge-warning', 'Confirmed': 'badge-info', 'Being Processed': 'badge-info', 'Dispatched': 'badge-warning', 'Delivered': 'badge-success', 'Cancelled': 'badge-error', 'Rejected': 'badge-error' }

export default function OrderTracking() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showInvoice, setShowInvoice] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/orders')
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Fetch orders error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async (id) => {
    try {
      const res = await fetch(`/api/orders/${id}/confirm`, { method: 'PATCH' })
      if (res.ok) {
        alert('Payment successful!')
        fetchOrders()
      } else {
        const err = await res.json()
        alert(`Payment failed: ${err.message}`)
      }
    } catch (err) { alert('Error connecting to server') }
  }
  return (
    <div className="fade-up">
      <div className="page-header">
        <h1 className="page-title">Order Tracking</h1>
        <p className="page-subtitle">Track your pharmacy orders in real-time</p>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
        {loading ? (
          <div className="card text-center" style={{ padding:60 }}>Loading your orders...</div>
        ) : items.length === 0 ? (
          <div className="card text-center" style={{ padding:60 }}>No orders found.</div>
        ) : items.map(o => {
          const currentStep = statusSteps[o.status] ?? 0;
          return (
            <div key={o._id} className="card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                    <span style={{ fontFamily:'var(--font-headline)', fontWeight:800, fontSize:'1rem' }}>ORD-{o._id.slice(-6).toUpperCase()}</span>
                    <span className={`badge ${statusBadge[o.status] || 'badge-neutral'}`}>{o.status}</span>
                  </div>
                  <div style={{ fontSize:'0.8125rem', color:'var(--on-surface-variant)' }}>
                    Placed on {new Date(o.createdAt).toLocaleDateString()} · 
                    {o.medicines.map(m => ` ${m.medicine?.name || 'Item'} ×${m.quantity}`).join(', ')} · 
                    Method: {o.paymentMethod || 'N/A'}
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:'var(--font-headline)', fontWeight:800, fontSize:'1.125rem', color:'var(--primary-container)' }}>৳{o.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  <div style={{ marginTop:8, display:'flex', gap:8, justifyContent:'flex-end' }}>
                    {o.status === 'Pending' && (
                      <button className="btn btn-primary btn-sm" onClick={() => handlePay(o._id)}>Pay Now</button>
                    )}
                    {['Confirmed', 'Being Processed', 'Dispatched', 'Delivered'].includes(o.status) && (
                      <button className="btn btn-ghost btn-sm" onClick={() => setShowInvoice(o)}>
                        <span className="material-icons" style={{fontSize:16}}>receipt_long</span>
                        Invoice
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress tracker */}
              <div style={{ display:'flex', alignItems:'center', gap:0 }}>
                {steps.map((s, i) => (
                  <div key={s} style={{ display:'flex', alignItems:'center', flex: i < steps.length-1 ? 1 : 0 }}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                      <div style={{ 
                        width:28, height:28, borderRadius:'50%', 
                        background: i < currentStep ? 'var(--secondary)' : i === currentStep ? 'var(--secondary)' : 'var(--surface-high)', 
                        color: i <= currentStep ? 'white' : 'var(--on-surface-variant)', 
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', fontWeight:700, flexShrink:0 
                      }}>
                        {i < currentStep ? <span className="material-icons" style={{fontSize:14}}>check</span> : i+1}
                      </div>
                      <span style={{ fontSize:'0.65rem', fontWeight: i<=currentStep ? 700 : 400, color: i<=currentStep ? 'var(--secondary)' : 'var(--on-surface-variant)', whiteSpace:'nowrap', textAlign:'center' }}>{s}</span>
                    </div>
                    {i < steps.length-1 && <div style={{ flex:1, height:2, background: i < currentStep ? 'var(--secondary)' : 'var(--outline-variant)', margin:'0 4px', marginBottom:18 }} />}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      
      {showInvoice && (
        <InvoiceModal 
          order={showInvoice} 
          onClose={() => setShowInvoice(null)} 
        />
      )}
    </div>
  )
}
