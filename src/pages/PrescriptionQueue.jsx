import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const queue = [
  { id:'RX-2024-0041', patient:'Sarah Mitchell', drug:'Amoxicillin 500mg', qty:'30 caps', urgency:'Urgent', status:'Pending Verification', time:'09:14 AM', insurance:'BlueCross' },
  { id:'RX-2024-0040', patient:'John Chen', drug:'Metformin 850mg', qty:'90 tabs', urgency:'Standard', status:'Dispensing', time:'09:02 AM', insurance:'Aetna' },
  { id:'RX-2024-0039', patient:'Maria Rodriguez', drug:'Lisinopril 10mg', qty:'30 tabs', urgency:'Standard', status:'Ready for Pickup', time:'08:55 AM', insurance:'UHC' },
  { id:'RX-2024-0038', patient:'David Kim', drug:'Atorvastatin 40mg', qty:'30 tabs', urgency:'Urgent', status:'Pending Verification', time:'08:40 AM', insurance:'Cigna' },
  { id:'RX-2024-0037', patient:'Emma Wilson', drug:'Cetirizine 10mg', qty:'20 tabs', urgency:'Standard', status:'Ready for Pickup', time:'08:30 AM', insurance:'None (OOP)' },
  { id:'RX-2024-0036', patient:'Robert Brown', drug:'Omeprazole 20mg', qty:'28 caps', urgency:'Standard', status:'Dispensed', time:'08:10 AM', insurance:'Aetna' },
]

const urgencyBadge = { 'Urgent': 'badge-error', 'Standard': 'badge-neutral' }
const statusBadge = { 'Pending Verification': 'badge-warning', 'Dispensing': 'badge-info', 'Ready for Pickup': 'badge-success', 'Dispensed': 'badge-neutral' }

export default function PrescriptionQueue() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('All')
  const filters = ['All', 'Pending Verification', 'Dispensing', 'Ready for Pickup', 'Dispensed']
  const filtered = filter === 'All' ? queue : queue.filter(q => q.status === filter)

  return (
    <div className="fade-up">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div className="page-header" style={{ marginBottom:0 }}>
          <h1 className="page-title">Prescription Fulfillment Queue</h1>
          <p className="page-subtitle">8 urgent · 16 standard queue — Updated live</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-ghost btn-sm"><span className="material-icons" style={{fontSize:16}}>refresh</span> Refresh</button>
          <button className="btn btn-primary btn-sm"><span className="material-icons" style={{fontSize:16}}>add</span> New Rx</button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid-4" style={{ marginBottom:24 }}>
        {[
          { label:'Pending Verification', val:8, icon:'pending', color:'var(--tertiary-fixed)', icolor:'var(--tertiary-container)' },
          { label:'In Dispensing', val:4, icon:'medication', color:'var(--primary-fixed)', icolor:'var(--primary-container)' },
          { label:'Ready for Pickup', val:12, icon:'check_circle', color:'var(--secondary-fixed)', icolor:'var(--secondary)' },
          { label:'Dispensed Today', val:47, icon:'assignment_turned_in', color:'var(--surface-high)', icolor:'var(--on-surface-variant)' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div style={{ width:40, height:40, borderRadius:10, background:s.color, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span className="material-icons" style={{ color:s.icolor, fontSize:22 }}>{s.icon}</span>
            </div>
            <div className="stat-value" style={{ fontSize:'1.75rem' }}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {filters.map(f => (
          <button key={f} className={`badge ${filter===f?'badge-info':'badge-neutral'}`} style={{ cursor:'pointer', padding:'7px 14px', fontSize:'0.8125rem' }} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      <div className="card" style={{ padding:0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Rx ID</th><th>Patient</th><th>Medication</th><th>Insurance</th><th>Urgency</th><th>Status</th><th>Time</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(rx => (
                <tr key={rx.id}>
                  <td><span style={{ fontFamily:'monospace', fontWeight:600, fontSize:'0.875rem' }}>{rx.id}</span></td>
                  <td><span style={{ fontWeight:600 }}>{rx.patient}</span></td>
                  <td>
                    <div style={{ fontWeight:600 }}>{rx.drug}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--on-surface-variant)' }}>{rx.qty}</div>
                  </td>
                  <td><span style={{ fontSize:'0.8125rem', color:'var(--on-surface-variant)' }}>{rx.insurance}</span></td>
                  <td><span className={`badge ${urgencyBadge[rx.urgency]}`}>{rx.urgency}</span></td>
                  <td><span className={`badge ${statusBadge[rx.status]}`}>{rx.status}</span></td>
                  <td><span style={{ fontSize:'0.8125rem', color:'var(--on-surface-variant)' }}>{rx.time}</span></td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-primary btn-sm" onClick={() => navigate(`/prescriptions/${rx.id}`)}>Verify</button>
                      <button className="btn btn-ghost btn-sm">Skip</button>
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
