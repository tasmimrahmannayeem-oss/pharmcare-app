import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useRole } from '../context/RoleContext'
import { useNavigate } from 'react-router-dom'

export default function Checkout() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart, prescriptionFile, selectedPharmacy } = useCart()
  const { userData } = useRole()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [ordered, setOrdered] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pharmacies, setPharmacies] = useState([])
  const [selectedPharmacyId, setSelectedPharmacyId] = useState(selectedPharmacy?._id || '')
  const [shippingAddress, setShippingAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery')

  const token = localStorage.getItem('token')

  // Load pharmacies
  useEffect(() => {
    fetch('/api/pharmacies', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        const branches = Array.isArray(data) ? data : []
        setPharmacies(branches)
        if (!selectedPharmacyId && branches.length > 0) setSelectedPharmacyId(branches[0]._id)
      })
      .catch(() => setPharmacies([]))
  }, [])

  // Pre-fill address from user profile
  useEffect(() => {
    const userId = userData?._id
    if (!userId) return
    fetch(`/api/users/${userId}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.address) setShippingAddress(data.address)
        else if (data.phone) setShippingAddress('')  // reset placeholder if no address
      })
      .catch(() => {})
  }, [userData?._id])

  const subtotal = cartTotal
  const delivery = 3.99
  const tax = subtotal * 0.08
  const total = subtotal + delivery + tax

  const handlePlaceOrder = async () => {
    // Basic validation for Rx
    const needsRx = cartItems.some(i => i.requiresPrescription)
    if (needsRx && !prescriptionFile) {
      alert("This order contains prescription-only medication. Please upload a prescription first in the catalogue.")
      navigate('/catalogue')
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('pharmacy', selectedPharmacyId)
      formData.append('totalAmount', total)
      formData.append('paymentMethod', paymentMethod)
      formData.append('medicines', JSON.stringify(cartItems.map(i => ({
        medicine: i._id,
        quantity: i.quantity,
        price: i.sellPrice
      }))))
      
      if (prescriptionFile) {
        formData.append('prescriptionImage', prescriptionFile)
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData // Fetch automatically sets multipart/form-data for FormData
      })
      
      if (res.ok) {
        setOrdered(true)
        clearCart()
      } else {
        const err = await res.json()
        alert(`Order failed: ${err.message}`)
      }
    } catch (err) {
      alert('Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0 && !ordered) {
    return (
      <div className="fade-up text-center" style={{ padding: 100 }}>
        <span className="material-icons" style={{ fontSize: 64, color: 'var(--outline)' }}>shopping_cart</span>
        <h2 style={{ marginTop: 20 }}>Your cart is empty</h2>
        <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/catalogue')}>Back to Shop</button>
      </div>
    )
  }

  if (ordered) return (
    <div className="fade-up" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:400, textAlign:'center', gap:16 }}>
      <div style={{ width:80, height:80, background:'var(--secondary-fixed)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span className="material-icons" style={{ fontSize:44, color:'var(--secondary)' }}>check_circle</span>
      </div>
      <h2 style={{ fontFamily:'var(--font-headline)', fontSize:'1.75rem', fontWeight:800 }}>Order Placed!</h2>
      <p style={{ color:'var(--on-surface-variant)', maxWidth:360 }}>Thank you! Your order has been registered and is being processed.</p>
      <div style={{ display:'flex', gap:12 }}>
        <button className="btn btn-primary" onClick={() => navigate('/catalogue')}>Continue Shopping</button>
        <button className="btn btn-ghost" onClick={() => navigate('/orders')}>Track My Order</button>
      </div>
    </div>
  )

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1 className="page-title">Checkout</h1>
        <p className="page-subtitle">Review your cart and confirm your delivery</p>
      </div>

      <div style={{ display:'flex', gap:0, marginBottom:32 }}>
        {['Review', 'Delivery', 'Confirm'].map((s, i) => (
          <div key={s} style={{ display:'flex', alignItems:'center', flex:1 }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background: step > i ? 'var(--primary-container)' : step === i+1 ? 'var(--primary-container)' : 'var(--surface-high)', color: 'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.875rem', fontWeight:700 }}>
                {step > i+1 ? <span className="material-icons" style={{fontSize:16}}>check</span> : i+1}
              </div>
              <span style={{ fontSize:'0.75rem', fontWeight:step===i+1?700:500, color:step===i+1?'var(--primary-container)':'var(--on-surface-variant)' }}>{s}</span>
            </div>
            {i < 2 && <div style={{ flex:1, height:2, background: step > i+1 ? 'var(--primary-container)' : 'var(--outline-variant)', margin:'0 8px', marginBottom:20 }} />}
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:24 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
          {step === 1 && (
            <div className="card" style={{ padding:0 }}>
              <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--outline-variant)' }}>
                <h3 className="title-md">Cart Items ({cartItems.length})</h3>
              </div>
              {Array.isArray(cartItems) && cartItems.map((item, i) => (
                <div key={item._id} style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 24px', borderBottom: i < cartItems.length-1 ? '1px solid rgba(196,197,213,0.3)' : 'none' }}>
                  <div style={{ width:48, height:48, borderRadius:10, background:'var(--primary-fixed)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span className="material-icons" style={{ color:'var(--primary-container)', fontSize:24 }}>medication</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600 }}>{item.name}</div>
                    <div style={{ fontSize:'0.8rem', color:'var(--on-surface-variant)' }}>{item.genericName || 'Medicine'}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => updateQuantity(item._id, item.quantity - 1)}>−</button>
                    <span style={{ fontWeight:600, minWidth:20, textAlign:'center' }}>{item.quantity}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                  </div>
                  <div style={{ fontWeight:700, color:'var(--primary-container)', minWidth:60, textAlign:'right' }}>৳{((item.sellPrice || 0) * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  <button className="btn btn-ghost btn-sm" style={{ color:'var(--error)' }} onClick={() => removeFromCart(item._id)}>
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
                <div className="input-group" style={{ gridColumn:'span 2' }}>
                  <label className="input-label">Select Pharmacy Branch</label>
                  <select className="input" value={selectedPharmacyId} onChange={e => setSelectedPharmacyId(e.target.value)}>
                    <option value="" disabled>Choose a pharmacy branch...</option>
                    {Array.isArray(pharmacies) && pharmacies.map(p => (
                      <option key={p._id} value={p._id}>{p.name} - {p.location}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group" style={{ gridColumn:'span 2' }}><label className="input-label">Delivery Address</label><input className="input" value={shippingAddress} placeholder="Enter your delivery address" onChange={e => setShippingAddress(e.target.value)} /></div>

                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Payment Method</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    {['Cash on Delivery', 'bKash', 'Card'].map(m => (
                      <button key={m}
                        className={`btn btn-sm ${paymentMethod === m ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ border: paymentMethod === m ? 'none' : '1.5px solid var(--outline-variant)' }}
                        onClick={() => setPaymentMethod(m)}
                      >{m}</button>
                    ))}
                  </div>
                </div>

                <div className="input-group"><label className="input-label">Contact Phone</label><input className="input" defaultValue="+880 1711-000000" /></div>
                <div className="input-group"><label className="input-label">Delivery Notes</label><input className="input" placeholder="Optional" /></div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="card">
              <h3 className="title-md" style={{ marginBottom:16 }}>Order Confirmation</h3>
              <p style={{ color:'var(--on-surface-variant)' }}>Please review your order. Clicking "Place Order" will confirm your purchase.</p>
              <div style={{ background:'var(--surface-low)', borderRadius:'var(--radius)', padding:16, marginTop:16 }}>
                {Array.isArray(cartItems) && cartItems.map(i => (
                  <div key={i._id} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0' }}>
                    <span>{i.name} × {i.quantity}</span><span style={{ fontWeight:600 }}>৳{((i.sellPrice || 0) * i.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
            {step > 1 && <button className="btn btn-ghost" onClick={() => setStep(s => s-1)}>Back</button>}
            <button 
              className="btn btn-primary" 
              disabled={loading} 
              onClick={() => {
                if (step === 1) {
                  const needsRx = cartItems.some(i => i.requiresPrescription)
                  if (needsRx && !prescriptionFile) {
                    alert("This order contains prescription-only medication. Please upload a prescription first.")
                    return
                  }
                }
                step < 3 ? setStep(s => s+1) : handlePlaceOrder()
              }}
            >
              {loading ? 'Processing...' : step < 3 ? 'Continue' : 'Place Order'}
            </button>
          </div>
        </div>

        <div className="card" style={{ height:'fit-content', position:'sticky', top: 100 }}>
          <h3 className="title-md" style={{ marginBottom:16 }}>Order Total</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}><span className="text-muted">Subtotal</span><span>৳{(subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
            <div style={{ display:'flex', justifyContent:'space-between' }}><span className="text-muted">Delivery</span><span>৳{(delivery || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
            <div style={{ display:'flex', justifyContent:'space-between' }}><span className="text-muted">Tax</span><span>৳{(tax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
            <div style={{ height:1, background:'var(--outline-variant)', margin:'4px 0' }} />
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'1.25rem', fontWeight:800 }}>
              <span>Total</span>
              <span style={{ color:'var(--primary-container)' }}>৳{(total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
