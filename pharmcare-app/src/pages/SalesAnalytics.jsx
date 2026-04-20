import { useState, useEffect } from 'react'
import { useRole } from '../context/RoleContext'

const weeklyData = [
  { day:'Mon', revenue:3200, prescriptions:48 },
  { day:'Tue', revenue:4100, prescriptions:62 },
  { day:'Wed', revenue:3800, prescriptions:57 },
  { day:'Thu', revenue:4820, prescriptions:71 },
  { day:'Fri', revenue:5200, prescriptions:78 },
  { day:'Sat', revenue:4500, prescriptions:65 },
  { day:'Sun', revenue:2800, prescriptions:38 },
]
const maxRevenue = Math.max(...weeklyData.map(d => d.revenue))

const topProducts = [
  { name:'Paracetamol 500mg', units:1240, revenue:'৳6,188', pct:92 },
  { name:'Metformin 850mg', units:890, revenue:'৳8,099', pct:74 },
  { name:'Vitamin C 1000mg', units:650, revenue:'৳8,450', pct:60 },
  { name:'Ibuprofen 400mg', units:720, revenue:'৳4,536', pct:54 },
]

export default function SalesAnalytics() {
  const { userData } = useRole()
  const [period, setPeriod] = useState('Week')
  const [pharmacyName, setPharmacyName] = useState('')

  useEffect(() => {
    const fetchPharmacyName = async () => {
      if (!userData?.assignedPharmacy) return;
      const pharmacyId = typeof userData.assignedPharmacy === 'object' ? userData.assignedPharmacy._id : userData.assignedPharmacy;
      if (!pharmacyId) return;
      try {
        const res = await fetch(`/api/pharmacies/${pharmacyId}`, {
          headers: { 'Authorization': `Bearer ${userData?.token || localStorage.getItem('token')}` }
        })
        if (res.ok) {
          const data = await res.json()
          setPharmacyName(data.name || '')
        }
      } catch (err) {}
    };
    fetchPharmacyName();
  }, [userData])

  return (
    <div className="fade-up">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div className="page-header" style={{ marginBottom:0 }}>
          <h1 className="page-title">Sales Analytics</h1>
          <p className="page-subtitle">Revenue intelligence · {pharmacyName || 'Assigned Branch'}</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {['Day','Week','Month','Year'].map(p => (
            <button key={p} className={`btn btn-sm ${period===p?'btn-primary':'btn-ghost'}`} onClick={() => setPeriod(p)}>{p}</button>
          ))}
          <button className="btn btn-ghost btn-sm"><span className="material-icons" style={{fontSize:16}}>download</span></button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid-4" style={{ marginBottom:28 }}>
        {[
          { label:'Total Revenue', val:'৳28,420', delta:'+12.4%', icon:'trending_up', bg:'linear-gradient(135deg,var(--primary),var(--primary-container))', textColor:'white' },
          { label:'Prescriptions Filled', val:'419', delta:'+8.2%', icon:'description', bg:'var(--secondary-fixed)', icolor:'var(--secondary)', textColor:'var(--on-surface)' },
          { label:'Avg. Transaction', val:'৳67.82', delta:'+3.8%', icon:'receipt', bg:'var(--primary-fixed)', icolor:'var(--primary-container)', textColor:'var(--on-surface)' },
          { label:'New Customers', val:'38', delta:'+15%', icon:'person_add', bg:'var(--tertiary-fixed)', icolor:'var(--tertiary-container)', textColor:'var(--on-surface)' },
        ].map(s => (
          <div className="stat-card" key={s.label} style={{ background: s.textColor==='white' ? s.bg : 'var(--surface-lowest)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ width:40, height:40, borderRadius:10, background: s.textColor==='white' ? 'rgba(255,255,255,0.2)' : s.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span className="material-icons" style={{ color: s.textColor==='white' ? 'white' : s.icolor, fontSize:22 }}>{s.icon}</span>
              </div>
              <span style={{ fontSize:'0.75rem', fontWeight:700, color: s.textColor==='white' ? 'rgba(255,255,255,0.8)' : 'var(--secondary)', background: s.textColor==='white' ? 'rgba(255,255,255,0.15)' : 'var(--secondary-fixed)', padding:'3px 8px', borderRadius:999 }}>{s.delta}</span>
            </div>
            <div style={{ fontFamily:'var(--font-headline)', fontSize:'2rem', fontWeight:800, color: s.textColor }}>{s.val}</div>
            <div style={{ fontSize:'0.8125rem', fontWeight:500, color: s.textColor==='white' ? 'rgba(255,255,255,0.75)' : 'var(--on-surface-variant)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap:24 }}>
        {/* Bar chart (styled divs) */}
        <div className="card">
          <div className="section-header">
            <h3 className="section-title">Daily Revenue — This Week</h3>
            <span className="badge badge-success">↑ 12.4%</span>
          </div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:12, height:180, paddingBottom:8 }}>
            {weeklyData.map(d => (
              <div key={d.day} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6, height:'100%', justifyContent:'flex-end' }}>
                <span style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--primary-container)' }}>৳{(d.revenue/1000).toFixed(1)}k</span>
                <div style={{ width:'100%', position:'relative', borderRadius:'var(--radius-sm) var(--radius-sm) 0 0', overflow:'hidden' }}>
                  <div style={{ height: `${(d.revenue/maxRevenue)*140}px`, background:'linear-gradient(180deg, var(--primary-container), var(--primary))', borderRadius:'var(--radius-sm) var(--radius-sm) 0 0', transition:'height 0.4s ease', minHeight:8 }} />
                </div>
                <span style={{ fontSize:'0.75rem', color:'var(--on-surface-variant)', fontWeight:500 }}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="card">
          <div className="section-header">
            <h3 className="section-title">Top Revenue Products</h3>
            <button className="btn btn-ghost btn-sm">View All</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {topProducts.map((p, i) => (
              <div key={p.name}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ width:22, height:22, borderRadius:'50%', background:'var(--primary-fixed)', color:'var(--primary-container)', fontSize:'0.7rem', fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center' }}>{i+1}</span>
                    <span style={{ fontWeight:600, fontSize:'0.875rem' }}>{p.name}</span>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontWeight:800, fontSize:'0.9rem', color:'var(--primary-container)' }}>{p.revenue}</div>
                    <div style={{ fontSize:'0.7rem', color:'var(--on-surface-variant)' }}>{p.units} units</div>
                  </div>
                </div>
                <div style={{ height:8, background:'var(--surface-high)', borderRadius:999 }}>
                  <div style={{ height:'100%', borderRadius:999, width:`${p.pct}%`, background:'linear-gradient(90deg, var(--secondary), #10b981)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment methods donut-style */}
        <div className="card">
          <h3 className="section-title" style={{ marginBottom:14 }}>Payment Methods</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              { label:'bKash', pct:42, color:'var(--primary-container)', amount:'৳11,936' },
              { label:'Nagad', pct:35, color:'var(--secondary)', amount:'৳9,947' },
              { label:'Cash/Card', pct:23, color:'var(--outline)', amount:'৳6,537' },
            ].map(m => (
              <div key={m.label} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:12, height:12, borderRadius:3, background:m.color, flexShrink:0 }} />
                <span style={{ flex:1, fontSize:'0.875rem' }}>{m.label}</span>
                <div style={{ width:120, height:8, background:'var(--surface-high)', borderRadius:999 }}>
                  <div style={{ height:'100%', borderRadius:999, width:`${m.pct}%`, background:m.color }} />
                </div>
                <span style={{ fontSize:'0.8125rem', fontWeight:600, minWidth:64, textAlign:'right' }}>{m.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly peak */}
        <div className="card">
          <h3 className="section-title" style={{ marginBottom:14 }}>Hourly Dispensing Traffic</h3>
          <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:100 }}>
            {[3,6,12,18,25,32,28,35,42,38,30,22,18,12,8,5].map((v,i) => (
              <div key={i} style={{ flex:1, borderRadius:'3px 3px 0 0', background: v>32 ? 'var(--secondary)' : 'var(--primary-fixed)', height:`${(v/42)*100}%`, minHeight:4, transition:'height 0.3s' }} />
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
            <span style={{ fontSize:'0.7rem', color:'var(--on-surface-variant)' }}>8 AM</span>
            <span style={{ fontSize:'0.7rem', color:'var(--on-surface-variant)' }}>12 PM</span>
            <span style={{ fontSize:'0.7rem', color:'var(--on-surface-variant)' }}>4 PM</span>
            <span style={{ fontSize:'0.7rem', color:'var(--on-surface-variant)' }}>8 PM</span>
          </div>
        </div>
      </div>
    </div>
  )
}
