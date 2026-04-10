import { useState } from 'react'

const queue = [
  { id:'ORD-F-001', patient:'Sarah Mitchell', items:'Amoxicillin 500mg ×30', method:'Pickup', status:'Ready', eta:'Now', slot:'10:00 AM' },
  { id:'ORD-F-002', patient:'John Chen', items:'Metformin 850mg ×90', method:'Delivery', status:'In Transit', eta:'11:30 AM', slot:'Morning' },
  { id:'ORD-F-003', patient:'Maria Rodriguez', items:'Lisinopril 10mg ×30', method:'Pickup', status:'Packing', eta:'10:45 AM', slot:'10:30 AM' },
  { id:'ORD-F-004', patient:'David Kim', items:'Atorvastatin 40mg ×30', method:'Delivery', status:'Dispatched', eta:'12:00 PM', slot:'Afternoon' },
  { id:'ORD-F-005', patient:'Emma Wilson', items:'Cetirizine 10mg ×20', method:'Pickup', status:'Ready', eta:'Now', slot:'11:00 AM' },
]

const statusBadge = { 'Ready': 'badge-success', 'In Transit': 'badge-info', 'Packing': 'badge-warning', 'Dispatched': 'badge-info' }

export default function FulfillmentStatus() {
  const [filter, setFilter] = useState('All')
  const filtered = filter === 'All' ? queue : queue.filter(q => q.method === filter || q.status === filter)

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1 className="page-title">Fulfillment Status & Pickup</h1>
        <p className="page-subtitle">Real-time order fulfillment tracking — Green Valley Branch</p>
      </div>

      <div className="grid-4" style={{ marginBottom:24 }}>
        {[
          { label:'Ready for Pickup', val:7, icon:'storefront', color:'var(--secondary-fixed)', icolor:'var(--secondary)' },
          { label:'Out for Delivery', val:4, icon:'directions_bike', color:'var(--primary-fixed)', icolor:'var(--primary-container)' },
          { label:'Currently Packing', val:3, icon:'inventory', color:'var(--tertiary-fixed)', icolor:'var(--tertiary-container)' },
          { label:'Completed Today', val:62, icon:'task_alt', color:'var(--surface-high)', icolor:'var(--on-surface-variant)' },
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

      {/* Filter */}
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {['All','Pickup','Delivery','Ready','Packing'].map(f => (
          <button key={f} className={`badge ${filter===f?'badge-info':'badge-neutral'}`} style={{ cursor:'pointer', padding:'7px 14px', fontSize:'0.8125rem' }} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      <div className="card" style={{ padding:0 }}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Order ID</th><th>Patient</th><th>Items</th><th>Method</th><th>Pickup Slot</th><th>ETA</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id}>
                  <td style={{ fontWeight:600, fontFamily:'monospace', fontSize:'0.875rem' }}>{o.id}</td>
                  <td style={{ fontWeight:600 }}>{o.patient}</td>
                  <td style={{ fontSize:'0.8125rem', color:'var(--on-surface-variant)' }}>{o.items}</td>
                  <td>
                    <span className={`badge ${o.method==='Pickup'?'badge-neutral':'badge-info'}`}>
                      <span className="material-icons" style={{fontSize:12}}>{o.method==='Pickup'?'storefront':'directions_bike'}</span>
                      {o.method}
                    </span>
                  </td>
                  <td>{o.slot}</td>
                  <td>
                    {o.eta === 'Now'
                      ? <span style={{ color:'var(--secondary)', fontWeight:700, fontSize:'0.875rem' }}>● Ready Now</span>
                      : <span style={{ color:'var(--on-surface-variant)', fontSize:'0.875rem' }}>{o.eta}</span>}
                  </td>
                  <td><span className={`badge ${statusBadge[o.status]}`}>{o.status}</span></td>
                  <td>
                    <button className="btn btn-primary btn-sm">
                      {o.status === 'Ready' ? 'Mark Collected' : 'Update'}
                    </button>
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
