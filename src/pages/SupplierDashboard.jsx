import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const recentOrders = [
  { id:'PO-2024-088', items:'Paracetamol 500mg ×500, Ibuprofen 400mg ×200', status:'Delivered', date:'Apr 6, 2026', value:'৳24,500' },
  { id:'PO-2024-082', items:'Amoxicillin 500mg ×300, Metformin 850mg ×400', status:'In Transit', date:'Apr 4, 2026', value:'৳38,200' },
  { id:'PO-2024-075', items:'Atorvastatin 40mg ×200', status:'Processing', date:'Apr 1, 2026', value:'৳16,400' },
]

const stockAlerts = [
  { name:'Amoxicillin 500mg', client:'Aura — Green Valley', stock:12, threshold:30 },
  { name:'Ibuprofen 400mg', client:'MedCenter — North', stock:0, threshold:50 },
  { name:'Omeprazole 20mg', client:'Aura — Green Valley', stock:8, threshold:20 },
]

export default function SupplierDashboard() {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState(stockAlerts)

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1 className="page-title">Supplier Dashboard</h1>
        <p className="page-subtitle">MediSupply Ltd. · Supplier Portal</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: 'Revenue (MTD)', val: '৳482,200', delta: '+8.4%', icon: 'trending_up', bg: 'linear-gradient(135deg,var(--primary),var(--primary-container))', white: true },
          { label: 'Active Orders', val: '14', delta: '3 urgent', icon: 'receipt_long', bg: 'var(--tertiary-fixed)', ic: 'var(--tertiary-container)' },
          { label: 'Client Pharmacies', val: '8', delta: '2 new this month', icon: 'business', bg: 'var(--secondary-fixed)', ic: 'var(--secondary)' },
          { label: 'Avg. Delivery Time', val: '1.8d', delta: '-0.3d vs last month', icon: 'local_shipping', bg: 'var(--primary-fixed)', ic: 'var(--primary-container)' },
        ].map(s => (
          <div className="stat-card" key={s.label} style={{ background: s.white ? s.bg : 'var(--surface-lowest)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.white ? 'rgba(255,255,255,0.2)' : s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-icons" style={{ color: s.white ? 'white' : s.ic, fontSize: 22 }}>{s.icon}</span>
            </div>
            <div className="stat-value" style={{ fontSize: '1.75rem', color: s.white ? 'white' : 'var(--on-surface)' }}>{s.val}</div>
            <div style={{ fontSize: '0.75rem', color: s.white ? 'rgba(255,255,255,0.75)' : 'var(--secondary)', fontWeight: 600 }}>{s.delta}</div>
            <div className="stat-label" style={{ color: s.white ? 'rgba(255,255,255,0.8)' : 'var(--on-surface-variant)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Low stock alerts */}
      <div className="card" style={{ marginBottom: 24, borderLeft: '4px solid var(--error)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span className="material-icons" style={{ color: 'var(--error)', fontSize: 22 }}>warning</span>
          <h3 className="title-md">Client Low-Stock Alerts — Action Required</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {alerts.map(a => (
            <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'var(--error-container)', borderRadius: 'var(--radius-sm)' }}>
              <span className="material-icons" style={{ color: 'var(--error)', fontSize: 18 }}>inventory_2</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{a.name}</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--error)' }}>{a.client} · Stock: {a.stock} (Min: {a.threshold})</div>
              </div>
              <button className="btn btn-sm" style={{ background: 'var(--error)', color: 'white' }}
                onClick={() => { alert(`Fulfillment order created for ${a.name} → ${a.client}`); setAlerts(prev => prev.filter(x => x.name !== a.name)) }}>
                Fulfill Now
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ gap: 24 }}>
        {/* Recent orders */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between' }}>
            <h3 className="title-md">Recent Purchase Orders</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/supplier/orders')}>View All</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recentOrders.map((o, i) => (
              <div key={o.id} style={{ padding: '14px 20px', borderBottom: i < recentOrders.length - 1 ? '1px solid rgba(196,197,213,0.3)' : 'none', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem', color: 'var(--primary-container)' }}>{o.id}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>{o.items}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--outline)', marginTop: 2 }}>{o.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: 'var(--primary-container)' }}>{o.value}</div>
                  <span className={`badge ${o.status === 'Delivered' ? 'badge-success' : o.status === 'In Transit' ? 'badge-info' : 'badge-warning'}`} style={{ marginTop: 4 }}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly revenue bar */}
        <div className="card">
          <h3 className="section-title" style={{ marginBottom: 16 }}>Monthly Revenue</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140 }}>
            {[32, 41, 28, 48, 38, 52, 45, 56, 48, 60, 52, 48].map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '100%', height: `${(v / 60) * 120}px`, background: i === 11 ? 'linear-gradient(180deg, var(--primary-container), var(--primary))' : 'var(--primary-fixed)', borderRadius: '4px 4px 0 0', minHeight: 6 }} />
                <span style={{ fontSize: '0.6rem', color: 'var(--on-surface-variant)' }}>
                  {['J','F','M','A','M','J','J','A','S','O','N','D'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
