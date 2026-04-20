const topMeds = [
  { name:'Paracetamol 500mg', dispensed:1240, revenue:'৳6,188', pct:88 },
  { name:'Metformin 850mg', dispensed:890, revenue:'৳8,099', pct:74 },
  { name:'Ibuprofen 400mg', dispensed:720, revenue:'৳4,536', pct:60 },
  { name:'Vitamin C 1000mg', dispensed:650, revenue:'৳8,450', pct:54 },
  { name:'Cetirizine 10mg', dispensed:510, revenue:'৳2,958', pct:43 },
]

const expiring = [
  { name:'Omeprazole 20mg', qty:48, expiry:'Apr 15, 2026', days:7 },
  { name:'Metformin 500mg', qty:12, expiry:'Apr 20, 2026', days:12 },
  { name:'Codeine Syrup', qty:6, expiry:'Apr 25, 2026', days:17 },
]

import { useState, useEffect } from 'react'
import { useRole } from '../context/RoleContext'

export default function InventoryReports() {
  const { userData } = useRole()
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

  const handleExport = () => {
    window.print()
  }

  return (
    <div className="fade-up print-container">
      <style>{`
        @media print {
          .sidebar, .topbar, .btn, .page-subtitle, .badge-info, .sidebar-bottom { display: none !important; }
          .app-content { margin-left: 0 !important; padding: 0 !important; }
          .page-main { padding: 0 !important; }
          .card { box-shadow: none !important; border: 1px solid #eee !important; break-inside: avoid; }
          body { background: white !important; }
          .grid-4, .grid-2 { display: block !important; }
          .stat-card, .card { margin-bottom: 20px !important; width: 100% !important; }
          .page-title { color: black !important; font-size: 24pt !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div className="page-header" style={{ marginBottom:0 }}>
          <h1 className="page-title">Inventory Reports</h1>
          <p className="page-subtitle">April 2026 · {pharmacyName || 'Assigned Branch'}</p>
        </div>
        <div style={{ display:'flex', gap:8 }} className="no-print">
          <button className="btn btn-ghost btn-sm"><span className="material-icons" style={{fontSize:16}}>date_range</span> Apr 2026</button>
          <button className="btn btn-primary btn-sm" onClick={handleExport}><span className="material-icons" style={{fontSize:16}}>download</span> Export PDF</button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid-4" style={{ marginBottom:28 }}>
        {[
          { label:'Total Stock Value', val:'৳48,212', delta:'+5.2%', icon:'account_balance_wallet', bg:'var(--primary-fixed)', ic:'var(--primary-container)' },
          { label:'Items Dispensed (MTD)', val:'4,182', delta:'+12%', icon:'medication', bg:'var(--secondary-fixed)', ic:'var(--secondary)' },
          { label:'Dead Stock Items', val:'23', delta:'-4', icon:'inventory', bg:'var(--surface-high)', ic:'var(--on-surface-variant)' },
          { label:'Wastage (Expired)', val:'৳1,240', delta: '-8.1%', icon:'delete_sweep', bg:'var(--error-container)', ic:'var(--error)' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div style={{ width:40, height:40, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span className="material-icons" style={{ color:s.ic, fontSize:22 }}>{s.icon}</span>
            </div>
            <div className="stat-value" style={{ fontSize:'1.75rem' }}>{s.val}</div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div className="stat-label">{s.label}</div>
              <span style={{ fontSize:'0.75rem', color:'var(--secondary)', fontWeight:600 }}>{s.delta}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap:24 }}>
        {/* Top dispensed medications */}
        <div className="card">
          <div className="section-header">
            <h3 className="section-title">Top Dispensed Medications</h3>
            <span className="badge badge-info">Apr 2026</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {topMeds.map((m, i) => (
              <div key={m.name}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <div>
                    <span style={{ fontWeight:600, fontSize:'0.9rem' }}>{m.name}</span>
                    <span style={{ fontSize:'0.75rem', color:'var(--on-surface-variant)', marginLeft:8 }}>#{i+1}</span>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--primary-container)' }}>{m.revenue}</div>
                    <div style={{ fontSize:'0.7rem', color:'var(--on-surface-variant)' }}>{m.dispensed} units</div>
                  </div>
                </div>
                <div style={{ height:8, background:'var(--surface-high)', borderRadius:999 }}>
                  <div style={{ height:'100%', borderRadius:999, width:`${m.pct}%`, background:'linear-gradient(90deg, var(--primary), var(--primary-container))' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expiring soon */}
        <div>
          <div className="card" style={{ marginBottom:20 }}>
            <div className="section-header">
              <h3 className="section-title">Expiring Soon</h3>
              <span className="badge badge-warning">Action Required</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {expiring.map(e => (
                <div key={e.name} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background:'var(--tertiary-fixed)', borderRadius:'var(--radius-sm)' }}>
                  <span className="material-icons" style={{ color:'var(--tertiary-container)', fontSize:20 }}>schedule</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:'0.875rem' }}>{e.name}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--tertiary-container)' }}>Expires {e.expiry} · {e.qty} units</div>
                  </div>
                  <span style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--error)' }}>{e.days}d</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="section-title" style={{ marginBottom:14 }}>Category Distribution</h3>
            {[
              { cat:'Analgesics', pct:28, color:'var(--primary-container)' },
              { cat:'Antibiotics', pct:22, color:'var(--secondary)' },
              { cat:'Antidiabetics', pct:18, color:'var(--tertiary-container)' },
              { cat:'Supplements', pct:16, color:'#f59e0b' },
              { cat:'Others', pct:16, color:'var(--on-surface-variant)' },
            ].map(c => (
              <div key={c.cat} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <span style={{ fontSize:'0.8125rem', minWidth:100, color:'var(--on-surface-variant)' }}>{c.cat}</span>
                <div style={{ flex:1, height:10, background:'var(--surface-high)', borderRadius:999 }}>
                  <div style={{ height:'100%', borderRadius:999, width:`${c.pct}%`, background:c.color }} />
                </div>
                <span style={{ fontSize:'0.8rem', fontWeight:700, minWidth:32 }}>{c.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
