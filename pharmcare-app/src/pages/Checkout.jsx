import { useState } from 'react'

const cartItems = [
  { name:'Paracetamol 500mg', brand:'Panadol', price:4.99, qty:2, rx:false },
  { name:'Vitamin C 1000mg', brand:'Cenovis', price:12.99, qty:1, rx:false },
  { name:'Ibuprofen 400mg', brand:'Brufen', price:6.30, qty:2, rx:false },
]

export default function Checkout() {
  const [items, setItems] = useState(cartItems)
  const [step, setStep] = useState(1)
  const [ordered, setOrdered] = useState(false)

  const subtotal = items.reduce((s,i) => s + i.price * i.qty, 0)
  const delivery = 3.99
  const total = subtotal + delivery

  const updateQty = (i, delta) => {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, qty: Math.max(1, item.qty + delta) } : item))
  }

  if (ordered) return (
    <div className="fade-up" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:400, textAlign:'center', gap:16 }}>
      <div style={{ width:80, height:80, background:'var(--secondary-fixed)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span className="material-icons" style={{ fontSize:44, color:'var(--secondary)' }}>check_circle</span>
      </div>
      <h2 style={{ fontFamily:'var(--font-headline)', fontSize:'1.75rem', fontWeight:800 }}>Order Placed Successfully!</h2>
      <p style={{ color:'var(--on-surface-variant)', maxWidth:360 }}>Your order #ORD-20240408 has been confirmed and will be delivered in 2–4 hours.</p>
      <div style={{ display:'flex', gap:12 }}>
        <button className="btn btn-primary" onClick={() => { setOrdered(false); setStep(1); }}>Continue Shopping</button>
        <button className="btn btn-ghost">Track Order</button>
      </div>
    </div>
  )

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1 className="page-title">Checkout</h1>
        <p className="page-subtitle">Review your cart and place your order</p>
      </div>

      {/* Progress */}
      <div style={{ display:'flex', gap:0, marginBottom:32 }}>
        {['Cart Review', 'Delivery Info', 'Payment', 'Confirm'].map((s, i) => (
          <div key={s} style={{ display:'flex', alignItems:'center', flex:1 }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background: step > i ? 'var(--primary-container)' : step === i+1 ? 'var(--primary-container)' : 'var(--surface-high)', color: step >= i+1 ? 'white' : 'var(--on-surface-variant)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.875rem', fontWeight:700 }}>
                {step > i+1 ? <span className="material-icons" style={{fontSize:16}}>check</span> : i+1}
              </div>
              <span style={{ fontSize:'0.75rem', fontWeight:step===i+1?700:500, color:step===i+1?'var(--primary-container)':'var(--on-surface-variant)', whiteSpace:'nowrap' }}>{s}</span>
            </div>
            {i < 3 && <div style={{ flex:1, height:2, background: step > i+1 ? 'var(--primary-container)' : 'var(--outline-variant)', margin:'0 8px', marginBottom:20 }} />}
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:24 }}>
        {/* Main content */}
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
          {step === 1 && (
            <div className="card" style={{ padding:0 }}>
              <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--outline-variant)' }}>
                <h3 className="title-md">Cart Items ({items.length})</h3>
              </div>
              {items.map((item, i) => (
                <div key={item.name} style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 24px', borderBottom: i < items.length-1 ? '1px solid rgba(196,197,213,0.3)' : 'none' }}>
                  <div style={{ width:48, height:48, borderRadius:10, background:'var(--primary-fixed)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span className="material-icons" style={{ color:'var(--primary-container)', fontSize:24 }}>medication</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600 }}>{item.name}</div>
                    <div style={{ fontSize:'0.8rem', color:'var(--on-surface-variant)' }}>{item.brand}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <button className="btn btn-ghost btn-sm" style={{padding:'4px 10px'}} onClick={() => updateQty(i, -1)}>−</button>
                    <span style={{ fontWeight:600, minWidth:20, textAlign:'center' }}>{item.qty}</span>
                    <button className="btn btn-ghost btn-sm" style={{padding:'4px 10px'}} onClick={() => updateQty(i, 1)}>+</button>
                  </div>
                  <div style={{ fontWeight:700, color:'var(--primary-container)', minWidth:60, textAlign:'right' }}>${(item.price * item.qty).toFixed(2)}</div>
                  <button className="btn btn-ghost btn-sm" style={{ color:'var(--error)', padding:'4px 8px' }} onClick={() => setItems(prev => prev.filter((_,idx)=>idx!==i))}>
                    <span className="material-icons" style={{fontSize:18}}>delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="card">
              <h3 className="title-md" style={{ marginBottom:20 }}>Delivery Information</h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                {[['First Name','John'],['Last Name','Smith'],['Phone','+1 555 0100'],['Email','john@example.com']].map(([l,p]) => (
                  <div className="input-group" key={l}><label className="input-label">{l}</label><input className="input" defaultValue={p} /></div>
                ))}
                <div className="input-group" style={{ gridColumn:'span 2' }}><label className="input-label">Delivery Address</label><input className="input" defaultValue="123 Medical Ave, Health City, HC 10001" /></div>
              </div>
              <div style={{ marginTop:16 }}>
                <div className="input-label" style={{ marginBottom:10 }}>Delivery Method</div>
                <div style={{ display:'flex', gap:12 }}>
                  {[{ label:'Standard Delivery', time:'3–5 days', price:'$3.99' }, { label:'Express Delivery', time:'Same day', price:'$9.99' }].map(d => (
                    <div key={d.label} style={{ flex:1, border:'2px solid var(--primary-container)', borderRadius:'var(--radius)', padding:14, cursor:'pointer', background:'var(--primary-fixed)' }}>
                      <div style={{ fontWeight:600 }}>{d.label}</div>
                      <div style={{ fontSize:'0.8125rem', color:'var(--on-surface-variant)' }}>{d.time} · {d.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="card">
              <h3 className="title-md" style={{ marginBottom:20 }}>Payment</h3>
              <div style={{ display:'flex', gap:12, marginBottom:20 }}>
                {['Credit Card','PayPal','Insurance'].map(m => (
                  <button key={m} className={`btn btn-sm ${m==='Credit Card'?'btn-primary':'btn-ghost'}`}>{m}</button>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div className="input-group" style={{ gridColumn:'span 2' }}><label className="input-label">Card Number</label><input className="input" placeholder="•••• •••• •••• ••••" /></div>
                <div className="input-group"><label className="input-label">Expiry</label><input className="input" placeholder="MM/YY" /></div>
                <div className="input-group"><label className="input-label">CVV</label><input className="input" placeholder="•••" /></div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="card">
              <h3 className="title-md" style={{ marginBottom:16 }}>Order Summary</h3>
              <p style={{ color:'var(--on-surface-variant)' }}>Please review your order before confirming. By placing this order you agree to our Terms of Service.</p>
              <div style={{ background:'var(--surface-low)', borderRadius:'var(--radius)', padding:16, marginTop:16 }}>
                {items.map(i => <div key={i.name} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0' }}>
                  <span>{i.name} × {i.qty}</span><span style={{ fontWeight:600 }}>${(i.price*i.qty).toFixed(2)}</span>
                </div>)}
              </div>
            </div>
          )}

          <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
            {step > 1 && <button className="btn btn-ghost" onClick={() => setStep(s => s-1)}>Back</button>}
            <button className="btn btn-primary" onClick={() => step < 4 ? setStep(s => s+1) : setOrdered(true)}>
              {step < 4 ? 'Continue' : 'Place Order'} <span className="material-icons" style={{fontSize:18}}>arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Order summary */}
        <div className="card" style={{ height:'fit-content', position:'sticky', top: 'calc(var(--topbar-height) + 16px)' }}>
          <h3 className="title-md" style={{ marginBottom:16 }}>Order Total</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}><span className="text-muted">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div style={{ display:'flex', justifyContent:'space-between' }}><span className="text-muted">Delivery</span><span>${delivery.toFixed(2)}</span></div>
            <div style={{ display:'flex', justifyContent:'space-between' }}><span className="text-muted">Tax (8%)</span><span>${(subtotal * 0.08).toFixed(2)}</span></div>
            <div style={{ height:1, background:'var(--outline-variant)', margin:'4px 0' }} />
            <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-headline)', fontSize:'1.25rem', fontWeight:800 }}>
              <span>Total</span>
              <span style={{ color:'var(--primary-container)' }}>${(total + subtotal * 0.08).toFixed(2)}</span>
            </div>
          </div>
          <div style={{ marginTop:16, padding:12, background:'var(--secondary-fixed)', borderRadius:'var(--radius-sm)', display:'flex', gap:8, alignItems:'center' }}>
            <span className="material-icons" style={{ color:'var(--secondary)', fontSize:18 }}>verified</span>
            <span style={{ fontSize:'0.8125rem', color:'var(--secondary)', fontWeight:500 }}>Secured & Encrypted Payment</span>
          </div>
        </div>
      </div>
    </div>
  )
}
