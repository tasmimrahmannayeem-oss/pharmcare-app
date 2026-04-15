import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const alerts = [
  { msg:'Ibuprofen 400mg is out of stock — 3 pending orders affected', color:'var(--error-container)', ic:'var(--error)', icon:'error' },
  { msg:'12 items at critical low stock — reorder from suppliers', color:'var(--tertiary-fixed)', ic:'var(--tertiary-container)', icon:'warning' },
  { msg:'24 prescriptions pending verification — 8 urgent', color:'var(--primary-fixed)', ic:'var(--primary-container)', icon:'info' },
]

const recentSales = [
  { id:'TX-048', customer:'Walk-in', items:'Paracetamol ×2, Vitamin C ×1', total:'৳230', time:'09:45', method:'Cash' },
  { id:'TX-047', customer:'Sarah Mitchell', items:'Amoxicillin ×1', total:'৳85', time:'09:32', method:'Insurance' },
  { id:'TX-046', customer:'John Chen', items:'Metformin 850mg ×90', total:'৳275', time:'09:18', method:'Card' },
  { id:'TX-045', customer:'Walk-in', items:'Ibuprofen ×2, Cetirizine ×1', total:'৳185', time:'09:05', method:'Cash' },
]

const staff = [
  { name:'Dr. Sarah Chen', role:'Chief Pharmacist', status:'On Shift', tasks:14, avatar:'person' },
  { name:'Maria Santos', role:'Pharmacist', status:'On Shift', tasks:9, avatar:'person_4' },
  { name:'James Lee', role:'Pharmacy Tech', status:'On Break', tasks:6, avatar:'person_3' },
  { name:'Anna Kwak', role:'Cashier', status:'On Shift', tasks:22, avatar:'person_2' },
]

export default function PharmacyAdminDashboard() {
  const navigate = useNavigate()
  const [lastRefresh, setLastRefresh] = useState(new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }))

  const handleRefresh = () => {
    setLastRefresh(new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }))
    alert('Dashboard refreshed!')
  }
  return (
    <div className="fade-up">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <h1 className="page-title">Branch Command Center</h1>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
            <div className="live-dot" />
            <span style={{ fontSize:'0.875rem', color:'var(--on-surface-variant)' }}>Live overview · Green Valley Branch · System Online</span>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-ghost btn-sm" onClick={handleRefresh}><span className="material-icons" style={{fontSize:16}}>refresh</span></button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/pos')}>
            <span className="material-icons" style={{fontSize:16}}>point_of_sale</span> Open POS
          </button>
        </div>
      </div>

      {/* KPI stats */}
      <div className="grid-4" style={{ marginBottom:24 }}>
        {[
          { label:"Today's Sales", val:'৳48,205', delta:'vs ৳42,840 yesterday', icon:'payments', bg:'linear-gradient(135deg,var(--primary),var(--primary-container))', white:true },
          { label:'Critical Low Stock', val:'12 Items', delta:'Action required for 3 life-saving meds', icon:'warning', bg:'var(--error-container)', ic:'var(--error)' },
          { label:'Pending Prescriptions', val:'24', delta:'8 urgent / 16 standard queue', icon:'description', bg:'var(--tertiary-fixed)', ic:'var(--tertiary-container)' },
          { label:'Near Expiry (7 Days)', val:'08', delta:'Clearance markdown suggested', icon:'schedule', bg:'var(--primary-fixed)', ic:'var(--primary-container)' },
        ].map(s => (
          <div className="stat-card" key={s.label} style={{ background: s.white ? s.bg : 'var(--surface-lowest)' }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
              <div style={{ width:40, height:40, borderRadius:10, background: s.white ? 'rgba(255,255,255,0.2)' : s.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span className="material-icons" style={{ color: s.white ? 'white' : s.ic, fontSize:22 }}>{s.icon}</span>
              </div>
            </div>
            <div style={{ fontFamily:'var(--font-headline)', fontSize:'1.625rem', fontWeight:800, color: s.white ? 'white' : 'var(--on-surface)' }}>{s.val}</div>
            <div style={{ fontSize:'0.8rem', color: s.white ? 'rgba(255,255,255,0.75)' : 'var(--on-surface-variant)' }}>{s.delta}</div>
            <div style={{ fontSize:'0.75rem', fontWeight:600, color: s.white ? 'rgba(255,255,255,0.9)' : 'var(--on-surface-variant)', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
        {alerts.map((a, i) => (
          <div key={i} style={{ background:a.color, borderRadius:'var(--radius)', padding:'12px 16px', display:'flex', gap:10, alignItems:'center' }}>
            <span className="material-icons" style={{ color:a.ic, fontSize:20 }}>{a.icon}</span>
            <span style={{ color:a.ic, fontWeight:500, fontSize:'0.875rem', flex:1 }}>{a.msg}</span>
            <button className="btn btn-sm" style={{ background:a.ic, color:'white', padding:'4px 12px' }}
              onClick={() => navigate(i === 0 ? '/inventory' : i === 1 ? '/inventory' : '/prescriptions')}>
              Take Action
            </button>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap:24 }}>
        {/* Recent sales */}
        <div className="card" style={{ padding:0 }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--outline-variant)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h3 className="title-md">Recent In-Store Sales</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/analytics')}>View All</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Method</th></tr></thead>
              <tbody>
                {recentSales.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontFamily:'monospace', fontSize:'0.8rem', fontWeight:600 }}>{t.id}</td>
                    <td>{t.customer}</td>
                    <td style={{ fontSize:'0.8rem', color:'var(--on-surface-variant)', maxWidth:160 }}>{t.items}</td>
                    <td style={{ fontWeight:700 }}>{t.total}</td>
                    <td><span className={`badge ${t.method==='Insurance'?'badge-success':t.method==='Card'?'badge-info':'badge-neutral'}`}>{t.method}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Staff on shift */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div className="card">
            <div className="section-header" style={{ marginBottom:12 }}>
              <h3 className="section-title">Staff on Shift</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/staff')}>Manage</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {staff.map(s => (
                <div key={s.name} style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--primary-fixed)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span className="material-icons" style={{ color:'var(--primary-container)', fontSize:20 }}>{s.avatar}</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:'0.875rem' }}>{s.name}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--on-surface-variant)' }}>{s.role} · {s.tasks} tasks</div>
                  </div>
                  <span className={`badge ${s.status==='On Shift'?'badge-success':'badge-warning'}`} style={{ fontSize:'0.7rem' }}>{s.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="card">
            <h3 className="section-title" style={{ marginBottom:12 }}>Quick Actions</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { icon:'description', label:'New Prescription', to:'/prescriptions', color:'var(--primary-fixed)', ic:'var(--primary-container)' },
                { icon:'point_of_sale', label:'Open POS', to:'/pos', color:'var(--secondary-fixed)', ic:'var(--secondary)' },
                { icon:'inventory_2', label:'Inventory', to:'/inventory', color:'var(--tertiary-fixed)', ic:'var(--tertiary-container)' },
                { icon:'analytics', label:'Analytics', to:'/analytics', color:'var(--primary-fixed)', ic:'var(--primary-container)' },
              ].map(a => (
                <button key={a.label}
                  style={{ background:a.color, border:'none', borderRadius:'var(--radius)', padding:'14px 12px', cursor:'pointer', display:'flex', flexDirection:'column', gap:6, alignItems:'flex-start', fontFamily:'inherit', transition:'transform 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
                  onClick={() => navigate(a.to)}
                >
                  <span className="material-icons" style={{ color:a.ic, fontSize:22 }}>{a.icon}</span>
                  <span style={{ fontSize:'0.8125rem', fontWeight:600, color:a.ic }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
