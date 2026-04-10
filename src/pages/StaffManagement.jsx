import { useState } from 'react'

const staff = [
  { name:'Dr. Sarah Chen', role:'Chief Pharmacist', email:'s.chen@aurahealth.com', phone:'+1 555 0101', shift:'Morning', status:'Active', license:'PH-2024-001', hired:'Jan 2020' },
  { name:'Maria Santos', role:'Pharmacist', email:'m.santos@aurahealth.com', phone:'+1 555 0102', shift:'Morning', status:'Active', license:'PH-2024-012', hired:'Mar 2021' },
  { name:'James Lee', role:'Pharmacy Technician', email:'j.lee@aurahealth.com', phone:'+1 555 0103', shift:'Afternoon', status:'On Leave', license:'PT-2023-088', hired:'Jun 2022' },
  { name:'Anna Kwak', role:'Cashier', email:'a.kwak@aurahealth.com', phone:'+1 555 0104', shift:'Morning', status:'Active', license:'—', hired:'Sep 2022' },
  { name:'Robert Park', role:'Pharmacy Technician', email:'r.park@aurahealth.com', phone:'+1 555 0105', shift:'Evening', status:'Active', license:'PT-2023-091', hired:'Feb 2023' },
  { name:'Linda Chen', role:'Pharmacist', email:'l.chen@aurahealth.com', phone:'+1 555 0106', shift:'Evening', status:'Active', license:'PH-2024-021', hired:'Apr 2023' },
]

const statusBadge = { 'Active':'badge-success', 'On Leave':'badge-warning', 'Inactive':'badge-neutral' }

export default function StaffManagement() {
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const filtered = staff.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.role.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="fade-up">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div className="page-header" style={{ marginBottom:0 }}>
          <h1 className="page-title">Staff Management</h1>
          <p className="page-subtitle">Green Valley Branch · {staff.length} team members</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <span className="material-icons" style={{fontSize:18}}>person_add</span> Add Staff
        </button>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:24 }}>
        {[
          { label:'Total Staff', val: staff.length, icon:'groups', bg:'var(--primary-fixed)', ic:'var(--primary-container)' },
          { label:'On Shift Today', val:4, icon:'schedule', bg:'var(--secondary-fixed)', ic:'var(--secondary)' },
          { label:'Licensed Pharmacists', val:3, icon:'verified', bg:'var(--tertiary-fixed)', ic:'var(--tertiary-container)' },
          { label:'On Leave', val:1, icon:'beach_access', bg:'var(--surface-high)', ic:'var(--on-surface-variant)' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div style={{ width:40, height:40, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span className="material-icons" style={{ color:s.ic, fontSize:22 }}>{s.icon}</span>
            </div>
            <div className="stat-value" style={{ fontSize:'1.75rem' }}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom:16 }}>
        <div className="input-icon-wrap">
          <span className="material-icons icon">search</span>
          <input className="input" placeholder="Search by name or role…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:16 }}>
        {filtered.map(s => (
          <div key={s.name} className="card" style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:'linear-gradient(135deg,var(--primary),var(--primary-container))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span className="material-icons" style={{ color:'white', fontSize:26 }}>person</span>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700 }}>{s.name}</div>
                <div style={{ fontSize:'0.8125rem', color:'var(--on-surface-variant)' }}>{s.role}</div>
              </div>
              <span className={`badge ${statusBadge[s.status]}`}>{s.status}</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[['Email',s.email,'email'],['Phone',s.phone,'phone'],['Shift',s.shift,'schedule'],['Since',s.hired,'calendar_today']].map(([l,v,icon]) => (
                <div key={l} style={{ background:'var(--surface-low)', borderRadius:8, padding:'8px 10px' }}>
                  <div style={{ fontSize:'0.7rem', color:'var(--on-surface-variant)', fontWeight:500, display:'flex', alignItems:'center', gap:4 }}>
                    <span className="material-icons" style={{fontSize:12}}>{icon}</span>{l}
                  </div>
                  <div style={{ fontWeight:600, fontSize:'0.8125rem', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{v}</div>
                </div>
              ))}
            </div>
            {s.license !== '—' && (
              <div style={{ display:'flex', alignItems:'center', gap:6, background:'var(--primary-fixed)', borderRadius:8, padding:'8px 12px' }}>
                <span className="material-icons" style={{ color:'var(--primary-container)', fontSize:16 }}>badge</span>
                <span style={{ fontSize:'0.8rem', color:'var(--primary-container)', fontWeight:500 }}>License: {s.license}</span>
              </div>
            )}
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex:1 }}>View Profile</button>
              <button className="btn btn-secondary btn-sm" style={{ flex:1 }}>Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
