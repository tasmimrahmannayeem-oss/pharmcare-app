import { useState } from 'react'

const inventory = [
  { name:'Paracetamol 500mg', sku:'MED-001', cat:'Analgesic', stock:480, min:50, price:'$4.99', expiry:'Dec 2026', status:'In Stock' },
  { name:'Amoxicillin 500mg', sku:'MED-002', cat:'Antibiotic', stock:12, min:30, price:'$8.50', expiry:'Aug 2026', status:'Low Stock' },
  { name:'Metformin 850mg', sku:'MED-003', cat:'Antidiabetic', stock:95, min:40, price:'$9.10', expiry:'Mar 2027', status:'In Stock' },
  { name:'Ibuprofen 400mg', sku:'MED-004', cat:'NSAID', stock:0, min:50, price:'$6.30', expiry:'Jan 2027', status:'Out of Stock' },
  { name:'Cetirizine 10mg', sku:'MED-005', cat:'Antihistamine', stock:210, min:30, price:'$5.80', expiry:'Jun 2027', status:'In Stock' },
  { name:'Omeprazole 20mg', sku:'MED-006', cat:'Antacid', stock:8, min:20, price:'$9.40', expiry:'Apr 2026', status:'Near Expiry' },
  { name:'Atorvastatin 40mg', sku:'MED-007', cat:'Statin', stock:145, min:40, price:'$14.75', expiry:'Sep 2027', status:'In Stock' },
  { name:'Lisinopril 10mg', sku:'MED-008', cat:'ACE Inhibitor', stock:332, min:60, price:'$7.60', expiry:'Nov 2026', status:'In Stock' },
]

const statusBadge = { 'In Stock':'badge-success', 'Low Stock':'badge-warning', 'Out of Stock':'badge-error', 'Near Expiry':'badge-warning' }

export default function Inventory() {
  const [search, setSearch] = useState('')
  const filtered = inventory.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="fade-up">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div className="page-header" style={{ marginBottom:0 }}>
          <h1 className="page-title">Inventory Management</h1>
          <p className="page-subtitle">Green Valley Branch · {inventory.length} SKUs tracked</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-ghost btn-sm"><span className="material-icons" style={{fontSize:16}}>upload</span> Import</button>
          <button className="btn btn-primary btn-sm"><span className="material-icons" style={{fontSize:16}}>add</span> Add Item</button>
        </div>
      </div>

      {/* Alerts */}
      {[
        { msg: '12 items at critical low stock — reorder required', color:'var(--error-container)', icolor:'var(--error)', icon:'warning' },
        { msg: '8 items expiring within 7 days — clearance suggested', color:'var(--tertiary-fixed)', icolor:'var(--tertiary-container)', icon:'schedule' },
      ].map((a, i) => (
        <div key={i} style={{ background:a.color, borderRadius:'var(--radius)', padding:'12px 16px', display:'flex', gap:10, alignItems:'center', marginBottom:12 }}>
          <span className="material-icons" style={{ color:a.icolor, fontSize:20 }}>{a.icon}</span>
          <span style={{ color:a.icolor, fontWeight:500, fontSize:'0.9rem' }}>{a.msg}</span>
        </div>
      ))}

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:24 }}>
        {[
          { label:'Total SKUs', val: inventory.length, icon:'inventory_2', bg:'var(--primary-fixed)', ic:'var(--primary-container)' },
          { label:'Low Stock Items', val:12, icon:'warning', bg:'var(--error-container)', ic:'var(--error)' },
          { label:'Near Expiry', val:8, icon:'schedule', bg:'var(--tertiary-fixed)', ic:'var(--tertiary-container)' },
          { label:'Total Value', val:'$48.2K', icon:'payments', bg:'var(--secondary-fixed)', ic:'var(--secondary)' },
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

      {/* Search */}
      <div style={{ marginBottom:16 }}>
        <div className="input-icon-wrap">
          <span className="material-icons icon">search</span>
          <input className="input" placeholder="Search by name or SKU…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ padding:0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Medicine</th><th>SKU</th><th>Category</th><th>Stock</th><th>Min Level</th><th>Price</th><th>Expiry</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.sku}>
                  <td style={{ fontWeight:600 }}>{item.name}</td>
                  <td><code style={{ fontSize:'0.8rem', color:'var(--on-surface-variant)' }}>{item.sku}</code></td>
                  <td><span className="badge badge-neutral">{item.cat}</span></td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ flex:1, height:6, background:'var(--surface-high)', borderRadius:3, maxWidth:80, overflow:'hidden' }}>
                        <div style={{ height:'100%', borderRadius:3, width:`${Math.min(100,(item.stock/200)*100)}%`, background: item.stock < item.min ? 'var(--error)' : 'var(--secondary)' }} />
                      </div>
                      <span style={{ fontWeight:600, fontSize:'0.875rem' }}>{item.stock}</span>
                    </div>
                  </td>
                  <td style={{ color:'var(--on-surface-variant)', fontSize:'0.875rem' }}>{item.min}</td>
                  <td style={{ fontWeight:600 }}>{item.price}</td>
                  <td style={{ fontSize:'0.875rem', color:'var(--on-surface-variant)' }}>{item.expiry}</td>
                  <td><span className={`badge ${statusBadge[item.status]}`}>{item.status}</span></td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-secondary btn-sm">Reorder</button>
                      <button className="btn btn-ghost btn-sm">Edit</button>
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
