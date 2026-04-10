import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function PrescriptionVerification() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [verified, setVerified] = useState(false)
  const [notes, setNotes] = useState('')

  if (verified) return (
    <div className="fade-up" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, marginTop:60, textAlign:'center' }}>
      <div style={{ width:80, height:80, borderRadius:'50%', background:'var(--secondary-fixed)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span className="material-icons" style={{ fontSize:44, color:'var(--secondary)' }}>verified</span>
      </div>
      <h2 style={{ fontFamily:'var(--font-headline)', fontSize:'1.75rem', fontWeight:800 }}>Prescription Verified</h2>
      <p style={{ color:'var(--on-surface-variant)', maxWidth:360 }}>Prescription {id} has been verified and sent to dispensing queue.</p>
      <div style={{ display:'flex', gap:12 }}>
        <button className="btn btn-primary" onClick={() => navigate('/prescriptions')}>Back to Queue</button>
      </div>
    </div>
  )

  return (
    <div className="fade-up">
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/prescriptions')}>
          <span className="material-icons" style={{fontSize:16}}>arrow_back</span> Queue
        </button>
        <h1 className="page-title" style={{ fontSize:'1.5rem' }}>Prescription Verification</h1>
        <span className="badge badge-warning">Pending</span>
        <span style={{ marginLeft:'auto', fontFamily:'monospace', fontWeight:600, color:'var(--on-surface-variant)' }}>{id || 'RX-2024-0041'}</span>
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
                <div style={{ fontWeight:700, fontSize:'1.0625rem' }}>Sarah Mitchell</div>
                <div style={{ fontSize:'0.8125rem', color:'var(--on-surface-variant)' }}>DOB: 1985-06-15 · Member ID: BCB-123-456</div>
                <div style={{ display:'flex', gap:6, marginTop:6 }}>
                  <span className="badge badge-info">BlueCross Member</span>
                  <span className="badge badge-warning">Allergy: Penicillin</span>
                </div>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[['Insurance ID','BCB-123-456-789'],['Phone','+1 555 0192'],['Email','s.mitchell@email.com'],['Primary Care','Dr. A. Patel']].map(([l,v]) => (
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
              <div style={{ fontFamily:'var(--font-headline)', fontSize:'1.25rem', fontWeight:800, color:'var(--primary-container)' }}>Amoxicillin 500mg</div>
              <div style={{ color:'var(--on-surface-variant)', marginTop:4 }}>Capsules · Oral administration</div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
              {[['Quantity','30 capsules'],['Dosage','1 cap 3×/day'],['Duration','10 days'],['Refills','0'],['Prescriber','Dr. A. Patel'],['Date','Apr 8, 2026']].map(([l,v]) => (
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
              {['Valid prescriber license confirmed','Patient allergy check (Penicillin ⚠️ — using Amoxicillin — REVIEW)','Insurance coverage verified (80% covered)','Dosage within safe therapeutic range','Drug interactions checked — clear','DEA schedule: Not a controlled substance'].map((item, i) => (
                <label key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background: i===1 ? 'var(--error-container)' : 'var(--surface-low)', borderRadius:'var(--radius-sm)', cursor:'pointer', fontSize:'0.875rem' }}>
                  <input type="checkbox" defaultChecked={i!==1} style={{ accentColor:'var(--secondary)', width:16, height:16 }} />
                  <span style={{ color: i===1 ? 'var(--error)' : 'var(--on-surface)', fontWeight: i===1 ? 600 : 400 }}>{item}</span>
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
            <button className="btn btn-danger" style={{ flex:1 }}>
              <span className="material-icons" style={{fontSize:18}}>cancel</span>
              Reject
            </button>
            <button className="btn btn-primary" style={{ flex:2 }} onClick={() => setVerified(true)}>
              <span className="material-icons" style={{fontSize:18}}>verified</span>
              Approve & Dispense
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
