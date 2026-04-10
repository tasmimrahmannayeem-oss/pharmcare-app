const orders = [
  { id:'ORD-2024-001', date:'Apr 8, 2026', items:['Paracetamol 500mg ×2', 'Vitamin C ×1'], total:'$22.97', status:'Out for Delivery', step:3 },
  { id:'ORD-2024-002', date:'Apr 6, 2026', items:['Metformin 500mg ×3'], total:'$27.30', status:'Delivered', step:4 },
  { id:'ORD-2024-003', date:'Apr 1, 2026', items:['Ibuprofen 400mg ×1', 'Cetirizine ×2'], total:'$18.40', status:'Delivered', step:4 },
]

const steps = ['Order Placed', 'Confirmed', 'Packed', 'Out for Delivery', 'Delivered']
const statusBadge = { 'Out for Delivery': 'badge-warning', 'Delivered': 'badge-success', 'Cancelled': 'badge-error', 'Processing': 'badge-info' }

export default function OrderTracking() {
  return (
    <div className="fade-up">
      <div className="page-header">
        <h1 className="page-title">Order Tracking</h1>
        <p className="page-subtitle">Track your pharmacy orders in real-time</p>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
        {orders.map(o => (
          <div key={o.id} className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                  <span style={{ fontFamily:'var(--font-headline)', fontWeight:800, fontSize:'1rem' }}>{o.id}</span>
                  <span className={`badge ${statusBadge[o.status]}`}>{o.status}</span>
                </div>
                <div style={{ fontSize:'0.8125rem', color:'var(--on-surface-variant)' }}>Placed on {o.date} · {o.items.join(', ')}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontFamily:'var(--font-headline)', fontWeight:800, fontSize:'1.125rem', color:'var(--primary-container)' }}>{o.total}</div>
                <button className="btn btn-ghost btn-sm" style={{ marginTop:4 }}>View Details</button>
              </div>
            </div>

            {/* Progress tracker */}
            <div style={{ display:'flex', alignItems:'center', gap:0 }}>
              {steps.map((s, i) => (
                <div key={s} style={{ display:'flex', alignItems:'center', flex: i < steps.length-1 ? 1 : 0 }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', background: i < o.step ? 'var(--secondary)' : i === o.step ? 'var(--secondary)' : 'var(--surface-high)', color: i <= o.step ? 'white' : 'var(--on-surface-variant)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', fontWeight:700, flexShrink:0 }}>
                      {i < o.step ? <span className="material-icons" style={{fontSize:14}}>check</span> : i+1}
                    </div>
                    <span style={{ fontSize:'0.65rem', fontWeight: i<=o.step ? 700 : 400, color: i<=o.step ? 'var(--secondary)' : 'var(--on-surface-variant)', whiteSpace:'nowrap', textAlign:'center' }}>{s}</span>
                  </div>
                  {i < steps.length-1 && <div style={{ flex:1, height:2, background: i < o.step ? 'var(--secondary)' : 'var(--outline-variant)', margin:'0 4px', marginBottom:18 }} />}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
