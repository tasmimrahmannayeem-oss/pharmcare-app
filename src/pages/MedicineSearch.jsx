import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const results = [
  { name: 'Paracetamol 500mg', brand: 'Panadol', category: 'Antipyretic', price: '$4.99', stock: 'In Stock', rx: false },
  { name: 'Amoxicillin 500mg', brand: 'Amoxil', category: 'Antibiotic', price: '$8.50', stock: 'In Stock', rx: true },
  { name: 'Metformin 850mg', brand: 'Glucophage', category: 'Antidiabetic', price: '$11.20', stock: 'Low Stock', rx: true },
  { name: 'Atorvastatin 40mg', brand: 'Lipitor', category: 'Statin', price: '$14.75', stock: 'In Stock', rx: true },
  { name: 'Ibuprofen 400mg', brand: 'Brufen', category: 'NSAID', price: '$6.30', stock: 'In Stock', rx: false },
  { name: 'Cetirizine 10mg', brand: 'Zyrtec', category: 'Antihistamine', price: '$5.80', stock: 'In Stock', rx: false },
  { name: 'Omeprazole 20mg', brand: 'Prilosec', category: 'Antacid', price: '$9.40', stock: 'Out of Stock', rx: false },
  { name: 'Lisinopril 10mg', brand: 'Zestril', category: 'ACE Inhibitor', price: '$7.60', stock: 'In Stock', rx: true },
]

const stockBadge = { 'In Stock': 'badge-success', 'Low Stock': 'badge-warning', 'Out of Stock': 'badge-error' }

export default function MedicineSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')

  const cats = ['All', 'Antipyretic', 'Antibiotic', 'Antidiabetic', 'NSAID', 'Antihistamine', 'Antacid', 'Statin']
  const filtered = results.filter(r =>
    (filter === 'All' || r.category === filter) &&
    (r.name.toLowerCase().includes(query.toLowerCase()) || r.brand.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1 className="page-title">Medicine Search</h1>
        <p className="page-subtitle">Search our catalogue of 10,000+ verified medicines</p>
      </div>

      {/* Search bar */}
      <div className="card" style={{ marginBottom: 24, padding: 20 }}>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <div className="input-icon-wrap" style={{ flex:1 }}>
            <span className="material-icons icon">search</span>
            <input
              className="input"
              placeholder="Search by medicine name, brand, or ingredient…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ fontSize:'1rem' }}
            />
          </div>
          <button className="btn btn-primary">
            <span className="material-icons">search</span>
            Search
          </button>
        </div>

        {/* Filter chips */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:16 }}>
          {cats.map(c => (
            <button
              key={c}
              className={`badge ${filter === c ? 'badge-info' : 'badge-neutral'}`}
              style={{ cursor:'pointer', padding:'6px 14px', fontSize:'0.8125rem' }}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="card" style={{ padding:0 }}>
        <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--outline-variant)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span className="label-md text-muted">{filtered.length} medicines found</span>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-ghost btn-sm"><span className="material-icons" style={{fontSize:16}}>filter_list</span> Filter</button>
            <button className="btn btn-ghost btn-sm"><span className="material-icons" style={{fontSize:16}}>sort</span> Sort</button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Category</th>
                <th>Price</th>
                <th>Availability</th>
                <th>Rx</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.name}>
                  <td>
                    <div style={{ fontWeight:600 }}>{m.name}</div>
                    <div style={{ fontSize:'0.8rem', color:'var(--on-surface-variant)' }}>{m.brand}</div>
                  </td>
                  <td><span className="badge badge-neutral">{m.category}</span></td>
                  <td><span style={{ fontWeight:700, color:'var(--primary-container)' }}>{m.price}</span></td>
                  <td><span className={`badge ${stockBadge[m.stock]}`}>{m.stock}</span></td>
                  <td>
                    {m.rx
                      ? <span className="badge badge-error">Rx Required</span>
                      : <span className="badge badge-success">OTC</span>}
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:8 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/checkout')}>
                        <span className="material-icons" style={{fontSize:14}}>add_shopping_cart</span>
                        Add
                      </button>
                      <button className="btn btn-ghost btn-sm">Details</button>
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
