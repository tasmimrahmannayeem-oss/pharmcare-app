import { useState, useEffect, useCallback } from 'react'
import { useRole } from '../context/RoleContext'

const statusBadge = {
  'Pending':         'badge-warning',
  'Confirmed':       'badge-info',
  'Being Processed': 'badge-warning',
  'Dispatched':      'badge-info',
  'Delivered':       'badge-success',
  'Cancelled':       'badge-error',
  'Rejected':        'badge-error',
}

// Status progression matched to DB Enum
const nextStatus = {
  'Pending':         'Confirmed',
  'Confirmed':       'Being Processed',
  'Being Processed': 'Dispatched',
  'Dispatched':      'Delivered',
}

export default function FulfillmentStatus() {
  const { userData } = useRole()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('All')
  const [updating, setUpdating] = useState(null)

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${userData?.token || localStorage.getItem('token')}` }
      })
      const data = await res.json()
      if (res.ok && Array.isArray(data)) {
        // Exclude already completed/cancelled orders
        setOrders(data.filter(o => !['Delivered', 'Cancelled'].includes(o.status)))
      } else {
        setError(data.message || 'Failed to load orders')
      }
    } catch (err) {
      setError('Connection error. Check your network.')
    } finally {
      setLoading(false)
    }
  }, [userData])

  useEffect(() => {
    fetchOrders()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdating(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData?.token || localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        // Update state locally for instant feedback
        if (newStatus === 'Delivered') {
          setOrders(prev => prev.filter(o => o._id !== orderId))
        } else {
          setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o))
        }
      } else {
        const data = await res.json()
        alert(data.message || 'Failed to update status')
      }
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setUpdating(null)
    }
  }

  // Filter logic
  const filtered = orders.filter(o => {
    if (filter === 'All') return true
    if (filter === 'Pickup') return o.deliveryMethod === 'Pickup' || !o.deliveryMethod
    if (filter === 'Delivery') return o.deliveryMethod === 'Delivery'
    return o.status === filter
  })

  const completedToday = (() => {
    const today = new Date(); today.setHours(0,0,0,0)
    return orders.filter(o => o.status === 'Delivered' && new Date(o.updatedAt) >= today).length
  })()

  const formatItems = (order) => {
    if (!order.medicines?.length) return 'No items'
    return order.medicines.slice(0, 2).map(m =>
      `${m.medicine?.name || 'Medicine'} ×${m.quantity}`
    ).join(', ') + (order.medicines.length > 2 ? ` +${order.medicines.length - 2} more` : '')
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  return (
    <div className="fade-up">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div className="page-header" style={{ marginBottom:0 }}>
          <h1 className="page-title">Fulfillment Status & Pickup</h1>
          <p className="page-subtitle">
            Real-time order fulfillment tracking
            {loading && <span style={{ marginLeft: 8, fontSize:'0.75rem', color:'var(--primary)' }}>● Refreshing...</span>}
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchOrders} disabled={loading}>
          <span className="material-icons" style={{fontSize:16}}>refresh</span> Refresh
        </button>
      </div>

      {error && (
        <div style={{ background:'var(--error-container)', color:'var(--error)', padding:'12px 16px', borderRadius:12, marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
          <span className="material-icons" style={{fontSize:18}}>error</span>
          {error}
          <button className="btn btn-sm" style={{ marginLeft:'auto', background:'var(--error)', color:'white' }} onClick={fetchOrders}>Retry</button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid-4" style={{ marginBottom:24 }}>
        {[
          { label:'Active Deliveries', val: orders.filter(o => o.status === 'Dispatched').length, icon:'directions_bike', color:'var(--primary-fixed)', icolor:'var(--primary-container)' },
          { label:'Currently Processing', val: orders.filter(o => o.status === 'Being Processed' || o.status === 'Confirmed').length, icon:'inventory', color:'var(--tertiary-fixed)', icolor:'var(--tertiary-container)' },
          { label:'Pending Orders', val: orders.filter(o => o.status === 'Pending').length, icon:'hourglass_top', color:'var(--surface-high)', icolor:'var(--on-surface-variant)' },
          { label:'Completed', val: orders.filter(o => o.status === 'Delivered').length, icon:'check_circle', color:'var(--secondary-fixed)', icolor:'var(--secondary)' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div style={{ width:40, height:40, borderRadius:10, background:s.color, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span className="material-icons" style={{ color:s.icolor, fontSize:22 }}>{s.icon}</span>
            </div>
            <div className="stat-value" style={{ fontSize:'1.75rem' }}>
              {loading ? '—' : s.val}
            </div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {['All','Pickup','Delivery','Being Processed','Dispatched','Pending'].map(f => (
          <button
            key={f}
            className={`badge ${filter===f?'badge-info':'badge-neutral'}`}
            style={{ cursor:'pointer', padding:'7px 14px', fontSize:'0.8125rem' }}
            onClick={() => setFilter(f)}
          >{f}</button>
        ))}
      </div>

      <div className="card" style={{ padding:0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Method</th>
                <th>Placed At</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign:'center', padding:40, color:'var(--on-surface-variant)' }}>Loading live orders...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign:'center', padding:40, color:'var(--on-surface-variant)' }}>
                  <span className="material-icons" style={{ fontSize:36, display:'block', marginBottom:8, opacity:0.4 }}>inbox</span>
                  No active orders found.
                </td></tr>
              ) : filtered.map(o => (
                <tr key={o._id}>
                  <td style={{ fontWeight:600, fontFamily:'monospace', fontSize:'0.875rem' }}>
                    {o._id.slice(-8).toUpperCase()}
                  </td>
                  <td style={{ fontWeight:600 }}>{o.customer?.name || 'Walk-in'}</td>
                  <td style={{ fontSize:'0.8125rem', color:'var(--on-surface-variant)', maxWidth:180 }}>
                    {formatItems(o)}
                  </td>
                  <td>
                    <span className={`badge ${o.deliveryMethod === 'Delivery' ? 'badge-info' : 'badge-neutral'}`}>
                      <span className="material-icons" style={{fontSize:12}}>
                        {o.deliveryMethod === 'Delivery' ? 'directions_bike' : 'storefront'}
                      </span>
                      {o.deliveryMethod || 'Pickup'}
                    </span>
                  </td>
                  <td style={{ fontSize:'0.875rem', color:'var(--on-surface-variant)' }}>
                    {formatTime(o.createdAt)}
                  </td>
                  <td>
                    <span className={`badge ${statusBadge[o.status] || 'badge-neutral'}`}>{o.status}</span>
                  </td>
                  <td>
                    {nextStatus[o.status] && (
                      <button
                        className={`btn btn-sm ${nextStatus[o.status] === 'Delivered' ? 'btn-primary' : 'btn-secondary'}`}
                        disabled={updating === o._id}
                        onClick={() => handleUpdateStatus(o._id, nextStatus[o.status])}
                      >
                        {updating === o._id ? 'Saving...' : (
                          nextStatus[o.status] === 'Delivered' ? 'Mark Delivered' :
                          nextStatus[o.status] === 'Being Processed' ? 'Start Processing' :
                          nextStatus[o.status] === 'Dispatched' ? 'Mark Dispatched' :
                          `→ ${nextStatus[o.status]}`
                        )}
                      </button>
                    )}
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
