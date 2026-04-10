import { useState } from 'react'

const cartItems = [
  { name:'Paracetamol 500mg', price:4.99, qty:2 },
  { name:'Vitamin C 1000mg', price:12.99, qty:1 },
]

const recentTx = [
  { id:'TX-001', customer:'Walk-in', items:'Paracetamol ×2', total:'$9.98', method:'Cash', time:'09:45 AM' },
  { id:'TX-002', customer:'Sarah M.', items:'Amoxicillin ×1', total:'$8.50', method:'Card', time:'09:32 AM' },
  { id:'TX-003', customer:'John C.', items:'Metformin ×3', total:'$27.30', method:'Insurance', time:'09:18 AM' },
  { id:'TX-004', customer:'Walk-in', items:'Ibuprofen ×1, Cetirizine ×2', total:'$17.90', method:'Cash', time:'09:05 AM' },
]

export default function POSBilling() {
  const [cart, setCart] = useState(cartItems)
  const [search, setSearch] = useState('')
  const subtotal = cart.reduce((s,i) => s+i.price*i.qty, 0)
  const tax = subtotal * 0.08

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1 className="page-title">POS Billing Interface</h1>
        <p className="page-subtitle">Point-of-sale terminal · Green Valley Branch · Cashier: Maria S.</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:24, alignItems:'start' }}>
        {/* Left: Product search + recent */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div className="card">
            <h3 className="title-md" style={{ marginBottom:14 }}>Add Product</h3>
            <div className="input-icon-wrap">
              <span className="material-icons icon">search</span>
              <input className="input" placeholder="Scan barcode or search medicine…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginTop:14 }}>
              {['Paracetamol 500mg','Ibuprofen 400mg','Amoxicillin 500mg','Cetirizine 10mg','Vitamin C','Metformin','Omeprazole','Lisinopril'].filter(n => n.toLowerCase().includes(search.toLowerCase())).map(name => (
                <button key={name}
                  style={{ background:'var(--surface-low)', border:'none', borderRadius:'var(--radius)', padding:'12px 10px', cursor:'pointer', fontSize:'0.8rem', fontWeight:500, textAlign:'center', transition:'background 0.15s', fontFamily:'inherit' }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--primary-fixed)'}
                  onMouseLeave={e => e.currentTarget.style.background='var(--surface-low)'}
                  onClick={() => setCart(prev => {
                    const ex = prev.find(i => i.name === name)
                    if (ex) return prev.map(i => i.name===name ? {...i, qty:i.qty+1} : i)
                    return [...prev, { name, price: 5 + Math.random()*10, qty:1 }]
                  })}
                >
                  <span className="material-icons" style={{fontSize:20,color:'var(--primary-container)',display:'block',marginBottom:4}}>medication</span>
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Recent transactions */}
          <div className="card" style={{ padding:0 }}>
            <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--outline-variant)' }}>
              <h3 className="title-md">Recent Transactions</h3>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>TX ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Method</th><th>Time</th></tr></thead>
                <tbody>
                  {recentTx.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontFamily:'monospace', fontSize:'0.8rem', fontWeight:600 }}>{t.id}</td>
                      <td>{t.customer}</td>
                      <td style={{ fontSize:'0.8125rem', color:'var(--on-surface-variant)' }}>{t.items}</td>
                      <td style={{ fontWeight:700 }}>{t.total}</td>
                      <td><span className={`badge ${t.method==='Cash'?'badge-neutral':t.method==='Card'?'badge-info':'badge-success'}`}>{t.method}</span></td>
                      <td style={{ color:'var(--on-surface-variant)', fontSize:'0.8rem' }}>{t.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Cart */}
        <div className="card" style={{ position:'sticky', top:'calc(var(--topbar-height) + 16px)', display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h3 className="title-md">Current Transaction</h3>
            <button className="btn btn-ghost btn-sm" style={{ color:'var(--error)' }} onClick={() => setCart([])}>
              <span className="material-icons" style={{fontSize:16}}>delete</span> Clear
            </button>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:10, minHeight:200 }}>
            {cart.length === 0 && (
              <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--on-surface-variant)', fontSize:'0.9rem', padding:'40px 0' }}>
                <span className="material-icons" style={{fontSize:32,display:'block',marginBottom:8}}>shopping_cart</span>
              </div>
            )}
            {cart.map((item, i) => (
              <div key={item.name} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'var(--surface-low)', borderRadius:'var(--radius-sm)' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:'0.875rem' }}>{item.name}</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--on-surface-variant)' }}>${item.price.toFixed(2)} each</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <button className="btn btn-ghost btn-sm" style={{padding:'2px 8px'}} onClick={() => setCart(prev => prev.map((c,idx) => idx===i ? {...c, qty:Math.max(1,c.qty-1)} : c))}>−</button>
                  <span style={{ fontWeight:700, minWidth:20, textAlign:'center' }}>{item.qty}</span>
                  <button className="btn btn-ghost btn-sm" style={{padding:'2px 8px'}} onClick={() => setCart(prev => prev.map((c,idx) => idx===i ? {...c, qty:c.qty+1} : c))}>+</button>
                </div>
                <span style={{ fontWeight:700, color:'var(--primary-container)', minWidth:52, textAlign:'right' }}>${(item.price*item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{ borderTop:'1px solid var(--outline-variant)', paddingTop:12, display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.875rem' }}><span className="text-muted">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.875rem' }}><span className="text-muted">Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
            <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-headline)', fontSize:'1.25rem', fontWeight:800, marginTop:4 }}>
              <span>Total</span><span style={{ color:'var(--primary-container)' }}>${(subtotal+tax).toFixed(2)}</span>
            </div>
          </div>

          {/* Payment buttons */}
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
              {['Cash','Card','Insurance'].map(m => (
                <button key={m} className="btn btn-ghost btn-sm" style={{ border:'1.5px solid var(--outline-variant)', fontWeight:600 }}>{m}</button>
              ))}
            </div>
            <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:4 }}>
              <span className="material-icons">receipt_long</span>
              Process Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
