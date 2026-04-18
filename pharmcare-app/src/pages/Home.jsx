import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const categories = [
  { icon: 'thermostat', label: 'Fever', sub: 'Antipyretics & Relief', color: '#ffdad6', icolor: '#ba1a1a' },
  { icon: 'healing', label: 'Pain Relief', sub: 'Analgesics & Topicals', color: '#ffdbce', icolor: '#872d00' },
  { icon: 'monitor_heart', label: 'Diabetes', sub: 'Monitoring & Care', color: '#dde1ff', icolor: '#1e40af' },
  { icon: 'spa', label: 'Vitamins', sub: 'Supplements & Health', color: '#6ffbbe', icolor: '#006c49' },
  { icon: 'psychology', label: 'Mental Health', sub: 'Wellness & Balance', color: '#b8c4ff', icolor: '#00288e' },
  { icon: 'child_care', label: 'Pediatrics', sub: 'Baby & Child Care', color: '#ffdbce', icolor: '#611e00' },
]

export default function Home() {
  const navigate = useNavigate()
  const { addToCart, selectedPharmacy } = useCart()
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const url = selectedPharmacy ? `/api/medicines?pharmacy=${selectedPharmacy._id}` : '/api/medicines'
    fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFeatured(data.slice(0, 6).map(m => ({
            ...m,
            price: `৳${(m?.sellPrice ?? 0)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            desc: m.genericName || 'Certified Clinical Medicine',
            pack: 'Standard Packaging',
            tag: m.requiresPrescription ? 'Rx' : 'Best Seller',
            tagColor: m.requiresPrescription ? 'badge-error' : 'badge-success'
          })))
        }
      })
      .catch(err => console.error('Error fetching featured:', err))
      .finally(() => setLoading(false))
  }, [selectedPharmacy])

  return (
    <div className="fade-up">
      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '40px 48px',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -40, top: -40, width: 280, height: 280, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', right: 60, bottom: -60, width: 200, height: 200, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
        <div>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, opacity: 0.75, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>PharmaCare — Certified Clinical Pharmacy</p>
          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '2rem', fontWeight: 800, lineHeight: 1.2, marginBottom: 12, maxWidth: 440 }}>
            Access certified pharmacy services from the comfort of your home.
          </h2>
          <p style={{ opacity: 0.8, fontSize: '1rem', marginBottom: 24 }}>High-quality medicines delivered with professional care.</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn" style={{ background: 'white', color: 'var(--primary-container)', fontWeight: 700 }} onClick={() => navigate('/catalogue')}>
              <span className="material-icons">shopping_bag</span>
              Shop Now
            </button>
            <button className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)' }} onClick={() => navigate('/prescriptions')}>
              <span className="material-icons">description</span>
              Upload Prescription
            </button>
          </div>
        </div>
        <div style={{ display:'flex', gap:16, flexShrink:0 }}>
          {[
            { val: '10k+', label: 'Medicines' },
            { val: '24/7', label: 'Support' },
            { val: '2hr', label: 'Delivery' },
          ].map(s => (
            <div key={s.val} style={{ textAlign:'center', background:'rgba(255,255,255,0.12)', borderRadius:12, padding:'16px 20px' }}>
              <div style={{ fontSize:'1.75rem', fontWeight: 800, fontFamily:'var(--font-headline)' }}>{s.val}</div>
              <div style={{ fontSize:'0.75rem', opacity:0.75, marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="section-header">
        <h2 className="section-title">Shop by Category</h2>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/catalogue')}>
          View all <span className="material-icons" style={{fontSize:16}}>arrow_forward</span>
        </button>
      </div>
      <div className="grid-3" style={{ marginBottom: 36 }}>
        {categories.map(c => (
          <button
            key={c.label}
            onClick={() => navigate('/catalogue')}
            style={{
              background: 'var(--surface-lowest)',
              border: 'none',
              borderRadius: 'var(--radius)',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              cursor: 'pointer',
              transition: 'transform 0.15s, box-shadow 0.15s',
              boxShadow: 'var(--shadow-card)',
              textAlign: 'left',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
          >
            <div style={{ width:46, height:46, borderRadius:12, background:c.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span className="material-icons" style={{ color:c.icolor, fontSize:24 }}>{c.icon}</span>
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:'0.9375rem', color:'var(--on-surface)' }}>{c.label}</div>
              <div style={{ fontSize:'0.8rem', color:'var(--on-surface-variant)', marginTop:2 }}>{c.sub}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Featured Products */}
      <div className="section-header">
        <h2 className="section-title">Handpicked Essentials</h2>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/catalogue')}>
          See all products <span className="material-icons" style={{fontSize:16}}>arrow_forward</span>
        </button>
      </div>
      <div className="grid-3">
        {featured.map(p => (
          <div
            key={p.name}
            className="card"
            style={{ display:'flex', flexDirection:'column', gap:12, cursor:'pointer', transition:'transform 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
          >
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div style={{ width:52, height:52, borderRadius:12, background:'var(--primary-fixed)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span className="material-icons" style={{ color:'var(--primary-container)', fontSize:26 }}>medication</span>
              </div>
              <span className={`badge ${p.tagColor}`}>{p.tag}</span>
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:'0.9375rem' }}>{p.name}</div>
              <div style={{ fontSize:'0.8125rem', color:'var(--on-surface-variant)', marginTop:4 }}>{p.desc}</div>
              <div style={{ fontSize:'0.75rem', color:'var(--outline)', marginTop:2 }}>{p.pack}</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'auto' }}>
              <span style={{ fontFamily:'var(--font-headline)', fontSize:'1.25rem', fontWeight:800, color:'var(--primary-container)' }}>{p.price}</span>
              <button className="btn btn-secondary btn-sm" onClick={(e) => {
                e.stopPropagation()
                addToCart(p)
                navigate('/checkout')
              }}>
                <span className="material-icons" style={{fontSize:15}}>add_shopping_cart</span>
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
