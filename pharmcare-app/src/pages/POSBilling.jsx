import { useState, useEffect } from 'react'
import { useRole } from '../context/RoleContext'
import InvoiceModal from '../components/InvoiceModal'

export default function POSBilling() {
  const [cart, setCart] = useState([])
  const [history, setHistory] = useState([])
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [payMethod, setPayMethod] = useState('Cash')
  const [search, setSearch] = useState('')
  const [showInvoice, setShowInvoice] = useState(null) // Stores the successful order object
  const [activePharmacy, setActivePharmacy] = useState(null)
  const { userData } = useRole()

  useEffect(() => {
    fetchMedicines()
    fetchHistory()
    if (userData.assignedPharmacy) fetchPharmacy()
  }, [])

  const fetchPharmacy = async () => {
    try {
      const res = await fetch('/api/pharmacies')
      const data = await res.json()
      const branch = data.find(p => p._id === userData.assignedPharmacy)
      if (branch) setActivePharmacy(branch)
    } catch (err) { console.error('Error fetching branch details', err) }
  }

  const fetchMedicines = async () => {
    try {
      const res = await fetch('/api/medicines')
      const data = await res.json()
      setMedicines(Array.isArray(data) ? data : [])
    } catch (err) { console.error('Error fetching medicines', err) }
  }

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/orders')
      const data = await res.json()
      // Filter for recent POS-like orders (e.g. status Confirmed/Paid)
      const formatted = Array.isArray(data) ? data.slice(0, 5).map(o => ({
        id: o._id.slice(-6).toUpperCase(),
        customer: o.customer ? o.customer.name : 'Walk-in',
        items: o.medicines.map(m => `${m.medicine?.name || 'Item'} ×${m.quantity}`).join(', '),
        total: `৳${o.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        method: o.statusTimeline[0]?.note.split('via ')[1] || 'Cash',
        time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })) : []
      setHistory(formatted)
    } catch (err) { console.error('Error fetching history', err) } finally { setLoading(false) }
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const tax = subtotal * 0.08
  const total = subtotal + tax

  const handleProcessPayment = async () => {
    if (cart.length === 0) return alert('Cart is empty')

    try {
      const res = await fetch('/api/orders/pos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pharmacy: userData.assignedPharmacy, 
          medicines: cart.map(i => ({ medicine: i._id, quantity: i.qty, price: i.price })),
          totalAmount: total,
          paymentMethod: payMethod
        })
      })

      if (res.ok) {
        const orderData = await res.json()
        setCart([])
        setShowInvoice({...orderData, pharmacy: activePharmacy}) // Pass full pharmacy details for printing
        fetchHistory()
        fetchMedicines() // Refresh stock
      } else {
        const err = await res.json()
        alert(`Error: ${err.message}`)
      }
    } catch (err) {
      alert('Error connecting to server')
    }
  }

  return (
    <div className="fade-up">
      <div className="page-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">POS Billing Interface</h1>
          <p className="page-subtitle">
            Terminal #01 · {activePharmacy ? `${activePharmacy.name} (${activePharmacy.location})` : 'Loading Branch...'} · {userData.name}
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchHistory}>Reset History</button>
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
              {medicines.filter(n => n.name.toLowerCase().includes(search.toLowerCase()) || n.genericName.toLowerCase().includes(search.toLowerCase())).slice(0, 12).map(med => (
                <button key={med._id}
                  disabled={med.stockQuantity <= 0}
                  style={{ 
                    background: med.stockQuantity <= 0 ? 'var(--surface-container-highest)' : 'var(--surface-low)', 
                    opacity: med.stockQuantity <= 0 ? 0.6 : 1,
                    border:'none', borderRadius:'var(--radius)', padding:'12px 10px', cursor: med.stockQuantity <= 0 ? 'default' : 'pointer', 
                    fontSize:'0.8rem', fontWeight:500, textAlign:'center', transition:'background 0.15s', fontFamily:'inherit', position: 'relative' 
                  }}
                  onMouseEnter={e => med.stockQuantity > 0 && (e.currentTarget.style.background='var(--primary-fixed)')}
                  onMouseLeave={e => med.stockQuantity > 0 && (e.currentTarget.style.background='var(--surface-low)')}
                  onClick={() => setCart(prev => {
                    const ex = prev.find(i => i._id === med._id)
                    if (ex) return prev.map(i => i._id === med._id ? {...i, qty:i.qty+1} : i)
                    return [...prev, { _id: med._id, name: med.name, price: med.sellPrice, qty: 1 }]
                  })}
                >
                  <span className="material-icons" style={{fontSize:20,color:'var(--primary-container)',display:'block',marginBottom:4}}>medication</span>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{med.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>{med.stockQuantity} in stock</div>
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
                  {history.map(t => (
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
                  <div style={{ fontSize:'0.75rem', color:'var(--on-surface-variant)' }}>৳{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })} each</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <button className="btn btn-ghost btn-sm" style={{padding:'2px 8px'}} onClick={() => setCart(prev => prev.map((c,idx) => idx===i ? {...c, qty:Math.max(1,c.qty-1)} : c))}>−</button>
                  <span style={{ fontWeight:700, minWidth:20, textAlign:'center' }}>{item.qty}</span>
                  <button className="btn btn-ghost btn-sm" style={{padding:'2px 8px'}} onClick={() => setCart(prev => prev.map((c,idx) => idx===i ? {...c, qty:c.qty+1} : c))}>+</button>
                </div>
                <span style={{ fontWeight:700, color:'var(--primary-container)', minWidth:52, textAlign:'right' }}>৳{(item.price*item.qty).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{ borderTop:'1px solid var(--outline-variant)', paddingTop:12, display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.875rem' }}><span className="text-muted">Subtotal</span><span>৳{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.875rem' }}><span className="text-muted">Tax (8%)</span><span>৳{tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
            <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-headline)', fontSize:'1.25rem', fontWeight:800, marginTop:4 }}>
              <span>Total</span><span style={{ color:'var(--primary-container)' }}>৳{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Payment buttons */}
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:8 }}>
              {['Cash','Card','bKash','Nagad'].map(m => (
                <button key={m}
                  className={`btn btn-sm ${payMethod === m ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ border: payMethod === m ? 'none' : '1.5px solid var(--outline-variant)', fontWeight:600, fontSize:'0.75rem', padding:'8px 4px' }}
                  onClick={() => setPayMethod(m)}
                >{m}</button>
              ))}
            </div>
            <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:4 }} onClick={handleProcessPayment}>
              <span className="material-icons">receipt_long</span>
              Process Payment
            </button>
          </div>
        </div>
      </div>
      
      {showInvoice && (
        <InvoiceModal 
          order={showInvoice} 
          onClose={() => setShowInvoice(null)} 
        />
      )}
    </div>
  )
}
