import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function PrescriptionVerification() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/orders/${id}`)
      const data = await res.json()
      setOrder(data)
    } catch (err) {
      console.error('Fetch order error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (action) => {
    try {
      const res = await fetch(`/api/orders/${id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, note: notes })
      })
      if (res.ok) {
        alert(`Order ${action}d successfully`)
        navigate('/prescriptions')
      } else {
        const err = await res.json()
        alert(`Error: ${err.message}`)
      }
    } catch (err) {
      alert('Error connecting to server')
    }
  }

  if (loading) return <div className="text-center" style={{ padding: 60 }}>Loading prescription details...</div>
  if (!order) return <div className="text-center" style={{ padding: 60 }}>Order not found</div>

  const patient = order.customer || { name: 'Walk-in Customer' }
  const mainMedicine = order.medicines[0]?.medicine || { name: 'Unknown Item' }

  return (
    <div className="fade-up">
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/prescriptions')}>
          <span className="material-icons" style={{fontSize:16}}>arrow_back</span> Queue
        </button>
        <h1 className="page-title" style={{ fontSize:'1.5rem' }}>Prescription Verification</h1>
        <span className={`badge ${order.status==='Pending'?'badge-warning':'badge-info'}`}>{order.status}</span>
        <span style={{ marginLeft:'auto', fontFamily:'monospace', fontWeight:600, color:'var(--on-surface-variant)' }}>#{id.slice(-6).toUpperCase()}</span>
      </div>

      <div className="grid-2" style={{ gap:24, alignItems:'start' }}>
        {/* Left: Prescription details */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div className="card">
            <h3 className="title-md" style={{ marginBottom:16 }}>Patient Information</h3>
            <div style={{ display:'flex', gap:16, alignItems:'center', marginBottom:16 }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:'var(--primary-fixed)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span className="material-icons" style={{ color:'var(--primary-container)', fontSize:28 }}>person</span>
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:'1.0625rem' }}>{patient.name}</div>
                <div style={{ fontSize:'0.8125rem', color:'var(--on-surface-variant)' }}>Email: {patient.email} · ID: {patient._id?.slice(-8).toUpperCase()}</div>
                <div style={{ display:'flex', gap:6, marginTop:6 }}>
                  <span className="badge badge-info">Registered Member</span>
                  {patient.phone && <span className="badge badge-neutral">Phone: {patient.phone}</span>}
                </div>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[['Member ID', patient._id?.slice(-6).toUpperCase()],['Phone', patient.phone || 'N/A'],['Email', patient.email],['Joined', new Date(patient.createdAt).toLocaleDateString()]].map(([l,v]) => (
                <div key={l} style={{ background:'var(--surface-low)', borderRadius:'var(--radius-sm)', padding:'10px 14px' }}>
                  <div style={{ fontSize:'0.75rem', color:'var(--on-surface-variant)', fontWeight:500 }}>{l}</div>
                  <div style={{ fontWeight:600, marginTop:2 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="title-md" style={{ marginBottom:16 }}>Prescribed Medication</h3>
            <div style={{ background:'var(--primary-fixed)', borderRadius:'var(--radius)', padding:16, marginBottom:16 }}>
              <div style={{ fontFamily:'var(--font-headline)', fontSize:'1.25rem', fontWeight:800, color:'var(--primary-container)' }}>{mainMedicine.name}</div>
              <div style={{ color:'var(--on-surface-variant)', marginTop:4 }}>{order.medicines[0]?.quantity} Units · ID: {mainMedicine._id?.slice(-6).toUpperCase()}</div>
            </div>
            {order.prescriptionImage && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginBottom: 8 }}>Scanned Prescription Copy:</div>
                <img src={`/api/uploads/${order.prescriptionImage.split('\\').pop()}`} alt="Prescription" style={{ width: '100%', borderRadius: 8, maxHeight: 300, objectFit: 'contain', background: 'var(--surface-low)' }} />
              </div>
            )}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginTop:16 }}>
              {[['Total Items', order.medicines.length],['Total Amount', `৳${order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],['Order Date', new Date(order.createdAt).toLocaleDateString()]].map(([l,v]) => (
                <div key={l} style={{ background:'var(--surface-low)', borderRadius:'var(--radius-sm)', padding:'10px 12px' }}>
                  <div style={{ fontSize:'0.7rem', color:'var(--on-surface-variant)', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.04em' }}>{l}</div>
                  <div style={{ fontWeight:700, marginTop:3, fontSize:'0.9375rem' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Verification panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div className="card" style={{ border:'2px solid var(--secondary-fixed)' }}>
            <h3 className="title-md" style={{ marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
              <span className="material-icons" style={{ color:'var(--secondary)', fontSize:20 }}>fact_check</span>
              Verification Checklist
            </h3>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {['Valid prescriber license confirmed','Patient history reviewed','Medication & dosage match prescription','No high-risk contraindications found','Stock availability confirmed'].map((item, i) => (
                <label key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background: 'var(--surface-low)', borderRadius:'var(--radius-sm)', cursor:'pointer', fontSize:'0.875rem' }}>
                  <input type="checkbox" style={{ accentColor:'var(--secondary)', width:16, height:16 }} />
                  <span style={{ color: 'var(--on-surface)', fontWeight: 400 }}>{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="title-md" style={{ marginBottom:12 }}>Pharmacist Notes</h3>
            <textarea
              className="input"
              style={{ minHeight:100, resize:'vertical' }}
              placeholder="Add verification notes…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display:'flex', gap:12 }}>
            <button className="btn btn-danger" style={{ flex:1 }} onClick={() => handleVerify('Reject')}>
              <span className="material-icons" style={{fontSize:18}}>cancel</span>
              Reject
            </button>
            <button className="btn btn-primary" style={{ flex:2 }} onClick={() => handleVerify('Approve')}>
              <span className="material-icons" style={{fontSize:18}}>verified</span>
              Approve & Dispense
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
