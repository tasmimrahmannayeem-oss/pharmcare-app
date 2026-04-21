import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const statusMap = {
  'Pending': 'Pending Verification',
  'Confirmed': 'Pending Verification',
  'Being Processed': 'Dispensing',
  'Dispatched': 'Ready for Pickup',
  'Delivered': 'Dispensed',
  'Cancelled': 'Dispensed', // Simplified for queue
  'Rejected': 'Dispensed'    // Simplified for queue
}

const statusBadgeMap = {
  'Pending Verification': 'badge-warning',
  'Dispensing': 'badge-info',
  'Ready for Pickup': 'badge-success',
  'Dispensed': 'badge-neutral'
}

export default function PrescriptionQueue() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      const formatted = Array.isArray(data) ? data
        .filter(o => o.requiresPrescription) // Focus only on Rx orders
        .map(o => ({
          id: o._id,
          displayId: o._id.slice(-6).toUpperCase(),
          patient: o.customer?.name || 'Walk-in',
          drug: o.medicines[0]?.medicine?.name || 'Unknown Item',
          qty: `${o.medicines[0]?.quantity || 0} units`,
          urgency: 'Urgent', // All orders in this queue are now Rx related
          status: statusMap[o.status] || o.status,
          time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          insurance: 'Verified'
        })) : []
      setItems(formatted)
    } catch (err) {
      console.error('Fetch orders error:', err)
    } finally {
      setLoading(false)
    }
  }

  const filters = ['All', 'Pending Verification', 'Dispensing', 'Ready for Pickup', 'Dispensed']
  const filtered = filter === 'All' ? items : items.filter(q => q.status === filter)

  const handleSkip = async (id) => {
    if (window.confirm('Archive this order from the queue?')) {
      // Mock archival by local filtering
      setItems(prev => prev.filter(rx => rx.id !== id))
    }
  }

  return (
    <div className="fade-up">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div className="page-header" style={{ marginBottom:0 }}>
          <h1 className="page-title">Prescription Fulfillment Queue</h1>
          <p className="page-subtitle">
            {items.filter(i => i.urgency === 'Urgent').length} urgent · {items.length} total queue — Updated live
          </p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-ghost btn-sm" onClick={fetchOrders} disabled={loading}>
            <span className="material-icons" style={{fontSize:16}}>refresh</span> Refresh
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid-4" style={{ marginBottom:24 }}>
        {[
          { label:'Pending Verification', val: items.filter(i => i.status === 'Pending Verification').length, icon:'pending', color:'var(--tertiary-fixed)', icolor:'var(--tertiary-container)' },
          { label:'In Dispensing', val: items.filter(i => i.status === 'Dispensing').length, icon:'medication', color:'var(--primary-fixed)', icolor:'var(--primary-container)' },
          { label:'Ready for Pickup', val: items.filter(i => i.status === 'Ready for Pickup').length, icon:'check_circle', color:'var(--secondary-fixed)', icolor:'var(--secondary)' },
          { label:'Total Queue', val: items.length, icon:'list_alt', color:'var(--surface-high)', icolor:'var(--on-surface-variant)' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div style={{ width:40, height:40, borderRadius:10, background:s.color, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span className="material-icons" style={{ color:s.icolor, fontSize:22 }}>{s.icon}</span>
            </div>
            <div className="stat-value" style={{ fontSize:'1.75rem' }}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {filters.map(f => (
          <button key={f} className={`badge ${filter===f?'badge-info':'badge-neutral'}`} style={{ cursor:'pointer', padding:'7px 14px', fontSize:'0.8125rem' }} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      <div className="card" style={{ padding:0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Rx ID</th><th>Patient</th><th>Medication</th><th>Urgency</th><th>Status</th><th>Time</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign:'center', padding:40 }}>Loading queue...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign:'center', padding:40, color:'var(--on-surface-variant)' }}>No prescriptions found in this category.</td></tr>
              ) : filtered.map(rx => (
                <tr key={rx.id}>
                  <td><span style={{ fontFamily:'monospace', fontWeight:600, fontSize:'0.875rem' }}>#{rx.displayId}</span></td>
                  <td><span style={{ fontWeight:600 }}>{rx.patient}</span></td>
                  <td>
                    <div style={{ fontWeight:600 }}>{rx.drug}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--on-surface-variant)' }}>{rx.qty}</div>
                  </td>
                  <td><span className={`badge ${rx.urgency === 'Urgent' ? 'badge-error' : 'badge-neutral'}`}>{rx.urgency}</span></td>
                  <td><span className={`badge ${statusBadgeMap[rx.status] || 'badge-neutral'}`}>{rx.status}</span></td>
                  <td><span style={{ fontSize:'0.8125rem', color:'var(--on-surface-variant)' }}>{rx.time}</span></td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      {rx.status === 'Pending Verification' && (
                        <button className="btn btn-primary btn-sm" onClick={() => navigate(`/prescriptions/${rx.id}`)}>Verify</button>
                      )}
                      <button className="btn btn-ghost btn-sm" onClick={() => handleSkip(rx.id)}>Skip</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
