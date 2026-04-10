import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const products = [
  { name:'Paracetamol 500mg', brand:'Panadol', cat:'Antipyretics', price:'$4.99', rating:4.8, reviews:2341, tag:'Best Seller', tagColor:'badge-success', rx:false },
  { name:'Vitamin C 1000mg', brand:'Cenovis', cat:'Supplements', price:'$12.99', rating:4.6, reviews:1820, tag:'Popular', tagColor:'badge-info', rx:false },
  { name:'Ibuprofen 400mg', brand:'Brufen', cat:'Pain Relief', price:'$6.30', rating:4.5, reviews:1544, tag:null, rx:false },
  { name:'Metformin 500mg', brand:'Glucophage', cat:'Diabetes', price:'$9.10', rating:4.7, reviews:980, tag:'Rx', tagColor:'badge-error', rx:true },
  { name:'Cetirizine HCl', brand:'Zyrtec', cat:'Allergy', price:'$5.80', rating:4.4, reviews:712, tag:null, rx:false },
  { name:'Omeprazole 20mg', brand:'Prilosec', cat:'Digestive', price:'$9.40', rating:4.3, reviews:643, tag:'Sale 20%', tagColor:'badge-warning', rx:false },
  { name:'Atorvastatin 40mg', brand:'Lipitor', cat:'Cardio', price:'$14.75', rating:4.9, reviews:518, tag:'Rx', tagColor:'badge-error', rx:true },
  { name:'Omega-3 Fish Oil', brand:'Nordic', cat:'Supplements', price:'$15.99', rating:4.7, reviews:2100, tag:'New', tagColor:'badge-info', rx:false },
  { name:'Amoxicillin 500mg', brand:'Amoxil', cat:'Antibiotics', price:'$8.50', rating:4.6, reviews:890, tag:'Rx', tagColor:'badge-error', rx:true },
]

export default function ProductCatalogue() {
  const navigate = useNavigate()
  const [cat, setCat] = useState('All')
  const [view, setView] = useState('grid')
  const cats = ['All', 'Antipyretics', 'Supplements', 'Pain Relief', 'Diabetes', 'Allergy', 'Antibiotics', 'Cardio', 'Digestive']
  const filtered = cat === 'All' ? products : products.filter(p => p.cat === cat)

  return (
    <div className="fade-up">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div className="page-header" style={{ marginBottom:0 }}>
          <h1 className="page-title">Product Catalogue</h1>
          <p className="page-subtitle">{products.length} products across {cats.length - 1} categories</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className={`btn btn-sm ${view==='grid'?'btn-primary':'btn-ghost'}`} onClick={() => setView('grid')}><span className="material-icons" style={{fontSize:16}}>grid_view</span></button>
          <button className={`btn btn-sm ${view==='list'?'btn-primary':'btn-ghost'}`} onClick={() => setView('list')}><span className="material-icons" style={{fontSize:16}}>view_list</span></button>
          <button className="btn btn-primary btn-sm"><span className="material-icons" style={{fontSize:16}}>filter_list</span> Filter</button>
        </div>
      </div>

      {/* Category chips */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:24 }}>
        {cats.map(c => (
          <button key={c}
            className={`badge ${cat===c ? 'badge-info' : 'badge-neutral'}`}
            style={{ cursor:'pointer', padding:'7px 16px', fontSize:'0.875rem' }}
            onClick={() => setCat(c)}
          >{c}</button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid-3">
        {filtered.map(p => (
          <div key={p.name} className="card" style={{ padding:0, overflow:'hidden', cursor:'pointer', transition:'transform 0.15s, box-shadow 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,40,142,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='var(--shadow-card)'; }}
          >
            {/* Image placeholder */}
            <div style={{ height:140, background:'linear-gradient(135deg, var(--primary-fixed) 0%, var(--primary-fixed-dim) 100%)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
              <span className="material-icons" style={{ fontSize:56, color:'var(--primary-container)', opacity:0.6 }}>medication</span>
              {p.tag && <span className={`badge ${p.tagColor}`} style={{ position:'absolute', top:12, right:12 }}>{p.tag}</span>}
            </div>
            <div style={{ padding:'16px 18px', display:'flex', flexDirection:'column', gap:8 }}>
              <div>
                <div style={{ fontSize:'0.75rem', color:'var(--on-surface-variant)', fontWeight:500 }}>{p.brand} · {p.cat}</div>
                <div style={{ fontWeight:700, fontSize:'0.9375rem', marginTop:2 }}>{p.name}</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                {'★★★★★'.split('').map((s,i) => (
                  <span key={i} style={{ fontSize:12, color: i < Math.floor(p.rating) ? '#f59e0b' : 'var(--outline-variant)' }}>★</span>
                ))}
                <span style={{ fontSize:'0.75rem', color:'var(--on-surface-variant)', marginLeft:4 }}>{p.rating} ({p.reviews.toLocaleString()})</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontFamily:'var(--font-headline)', fontSize:'1.25rem', fontWeight:800, color:'var(--primary-container)' }}>{p.price}</span>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/checkout')}>
                  <span className="material-icons" style={{fontSize:15}}>add_shopping_cart</span>
                  {p.rx ? 'Add Rx' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
