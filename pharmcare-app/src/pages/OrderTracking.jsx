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
  const [viewRxImage, setViewRxImage] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Fetch orders error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async (orderId) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/confirm`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      if (res.ok) {
        alert('Payment simulated successfully! Status updated.')
        fetchOrders()
      } else {
        alert('Payment failed')
      }
    } catch {
      alert('Connection error')
    }
  }

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1 className="page-title">Order Tracking</h1>
        <p className="page-subtitle">Track fulfillment and verification status of your medicine orders</p>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>Loading your orders...</div>
        ) : items.length === 0 ? (
          <div className="card text-center" style={{ padding: 60 }}>
            <span className="material-icons" style={{ fontSize: 48, color: 'var(--outline)' }}>local_shipping</span>
            <p style={{ marginTop: 12 }}>No active or past orders found.</p>
          </div>
        ) : items.map(o => {
          const currentStep = statusSteps[o.status] ?? 0;
          const rxImg = o.prescriptionImage;
          const rxUrl = rxImg ? (rxImg.startsWith('data:') || rxImg.startsWith('http') ? rxImg : `/api/uploads/${rxImg.replace(/\\/g, '/').replace(/^uploads\//, '')}`) : null;

          return (
            <div key={o._id} className="card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, flexWrap:'wrap', gap:12 }}>
                <div style={{ minWidth:200, flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4, flexWrap:'wrap' }}>
                    <span style={{ fontFamily:'var(--font-headline)', fontWeight:800, fontSize:'1rem' }}>ORD-{o._id.slice(-6).toUpperCase()}</span>
                    <span className={`badge ${statusBadge[o.status] || 'badge-neutral'}`}>{o.status}</span>
                    {rxUrl && (
                      <button 
                        className="badge badge-info" 
                        style={{ cursor:'pointer', border:'none', display:'inline-flex', alignItems:'center', gap:4 }}
                        onClick={() => setViewRxImage(rxUrl)}
                      >
                        <span className="material-icons" style={{ fontSize:13 }}>attach_file</span> Prescription Attached
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize:'0.8125rem', color:'var(--on-surface-variant)', lineHeight:1.4 }}>
                    Placed on {new Date(o.createdAt).toLocaleDateString()} · 
                    {o.medicines.map(m => ` ${m.medicine?.name || 'Item'} ×${m.quantity}`).join(', ')} · 
                    Method: {o.paymentMethod || 'N/A'}
                  </div>
                </div>
                <div style={{ textAlign:'right', display:'flex', flexDirection:'column', alignItems:'flex-end' }}>
                  <div style={{ fontFamily:'var(--font-headline)', fontWeight:800, fontSize:'1.125rem', color:'var(--primary-container)' }}>৳{o.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  <div style={{ marginTop:8, display:'flex', gap:8, justifyContent:'flex-end', flexWrap:'wrap' }}>
                    {rxUrl && (
                      <button className="btn btn-ghost btn-sm" onClick={() => setViewRxImage(rxUrl)}>
                        <span className="material-icons" style={{fontSize:16}}>visibility</span>
                        View Rx
                      </button>
                    )}
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
              <div className="chart-scroll-wrap">
                <div style={{ minWidth: 460, display:'flex', alignItems:'center', gap:0, paddingBottom: 4 }}>
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

      {/* Prescription Image Viewer Modal */}
      {viewRxImage && (
        <div 
          style={{ position:'fixed', inset:0, zIndex:999999, background:'rgba(15, 23, 42, 0.5)', backdropFilter:'blur(6px)', WebkitBackdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={() => setViewRxImage(null)}
        >
          <div 
            style={{ background:'white', borderRadius:16, padding:'20px 24px', maxWidth:460, width:'92%', maxHeight:'85vh', overflowY:'auto', position:'relative', boxShadow:'0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <div style={{ fontWeight:800, fontSize:'1.05rem', color:'var(--on-surface)', display:'flex', alignItems:'center', gap:8 }}>
                <span className="material-icons" style={{ color:'var(--primary)', fontSize:20 }}>receipt_long</span>
                Uploaded Prescription
              </div>
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={() => setViewRxImage(null)}
                style={{ padding:4, borderRadius:8 }}
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <div style={{ borderRadius:10, overflow:'hidden', border:'1px solid var(--outline-variant)', background:'#f8fafc', padding:8, display:'flex', justifyContent:'center' }}>
              <img 
                src={viewRxImage} 
                alt="Prescription Copy" 
                style={{ width:'100%', borderRadius:6, maxHeight:360, objectFit:'contain', display:'block' }} 
              />
            </div>

            <div style={{ marginTop:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:'0.75rem', color:'var(--on-surface-variant)' }}>✓ Verified customer upload</span>
              <button className="btn btn-primary btn-sm" onClick={() => setViewRxImage(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
