import { useState } from 'react'

const suppliers = [
  { name:'MediSupply Ltd.', contact:'James Walker', email:'j.walker@medisupply.com', category:'Generic Medicines', status:'Verified', rating:4.8, orders:142, lastOrder:'Apr 6, 2026' },
  { name:'PharmaCo International', contact:'Lisa Chang', email:'l.chang@pharmaco.com', category:'Brand Medicines', status:'Verified', rating:4.5, orders:89, lastOrder:'Apr 3, 2026' },
  { name:'BioMed Distributors', contact:'Ahmed Hassan', email:'a.hassan@biomed.com', category:'Medical Equipment', status:'Verified', rating:4.2, orders:56, lastOrder:'Mar 28, 2026' },
  { name:'NaturalCare Supplies', contact:'Emma Davis', email:'e.davis@naturalcare.com', category:'Supplements', status:'Pending', rating:0, orders:0, lastOrder:'—' },
  { name:'GlobalRx Corp', contact:'David Smith', email:'d.smith@globalrx.com', category:'Controlled Substances', status:'Verified', rating:4.7, orders:34, lastOrder:'Apr 1, 2026' },
]

export default function SupplierManagement() {
  const [search, setSearch] = useState('')
  const filtered = suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="fade-up">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div className="page-header" style={{ marginBottom:0 }}>
          <h1 className="page-title">Supplier Management</h1>
          <p className="page-subtitle">{suppliers.length} registered suppliers · 1 pending verification</p>
        </div>
        <button className="btn btn-primary">
          <span className="material-icons" style={{fontSize:18}}>add_business</span> Add Supplier
        </button>
      </div>

      <div className="grid-4" style={{ marginBottom:24 }}>
        {[
          { label:'Active Suppliers', val:4, icon:'verified', bg:'var(--secondary-fixed)', ic:'var(--secondary)' },
          { label:'Pending Verification', val:1, icon:'pending', bg:'var(--tertiary-fixed)', ic:'var(--tertiary-container)' },
          { label:'Orders This Month', val:38, icon:'receipt_long', bg:'var(--primary-fixed)', ic:'var(--primary-container)' },
          { label:'Avg. Delivery Days', val:'2.3', icon:'local_shipping', bg:'var(--surface-high)', ic:'var(--on-surface-variant)' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div style={{ width:40, height:40, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span className="material-icons" style={{ color:s.ic, fontSize:22 }}>{s.icon}</span>
            </div>
            <div className="stat-value" style={{ fontSize:'1.75rem' }}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom:16 }}>
        <div className="input-icon-wrap">
          <span className="material-icons icon">search</span>
          <input className="input" placeholder="Search suppliers…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ padding:0 }}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Supplier</th><th>Contact</th><th>Category</th><th>Rating</th><th>Total Orders</th><th>Last Order</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.name}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:36, height:36, borderRadius:8, background:'var(--primary-fixed)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <span className="material-icons" style={{ color:'var(--primary-container)', fontSize:20 }}>business</span>
                      </div>
                      <div>
                        <div style={{ fontWeight:700 }}>{s.name}</div>
                        <div style={{ fontSize:'0.75rem', color:'var(--on-surface-variant)' }}>{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color:'var(--on-surface-variant)', fontSize:'0.875rem' }}>{s.contact}</td>
                  <td><span className="badge badge-neutral">{s.category}</span></td>
                  <td>
                    {s.rating > 0
                      ? <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                          <span style={{ color:'#f59e0b', fontWeight:700 }}>★</span>
                          <span style={{ fontWeight:600 }}>{s.rating}</span>
                        </span>
                      : <span style={{ color:'var(--outline)' }}>—</span>
                    }
                  </td>
                  <td style={{ fontWeight:600 }}>{s.orders}</td>
                  <td style={{ color:'var(--on-surface-variant)', fontSize:'0.875rem' }}>{s.lastOrder}</td>
                  <td><span className={`badge ${s.status==='Verified'?'badge-success':'badge-warning'}`}>{s.status}</span></td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-secondary btn-sm">New Order</button>
                      <button className="btn btn-ghost btn-sm">View</button>
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
