import { useState } from 'react'

const prescriptions = [
  { drug:'Metformin 500mg', dose:'1 tablet twice daily', prescribed:'Dr. A. Patel', date:'Mar 12, 2026', refills:2, status:'Active' },
  { drug:'Lisinopril 10mg', dose:'1 tablet daily', prescribed:'Dr. K. Brown', date:'Feb 28, 2026', refills:5, status:'Active' },
  { drug:'Atorvastatin 40mg', dose:'1 tablet at bedtime', prescribed:'Dr. A. Patel', date:'Jan 10, 2026', refills:3, status:'Expiring Soon' },
]

export default function CustomerProfile() {
  const [activeTab, setActiveTab] = useState('profile')
  const [showEditModal, setShowEditModal] = useState(false)
  const [profile, setProfile] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    phone: '+880 1711 555010',
    dob: 'March 15, 1985',
    bloodType: 'A+',
    weight: '72 kg',
    height: '178 cm',
    allergies: 'Penicillin, Sulfa drugs'
  })

  const handleUpdateProfile = (e) => {
    e.preventDefault()
    // In a real app, this would call PUT /api/users/profile
    setShowEditModal(false)
    alert('Profile updated successfully!')
  }

  return (
    <>
      <div className="fade-up">
        {/* Profile header card */}
        <div className="card" style={{ marginBottom:24, background:'linear-gradient(135deg, var(--primary-fixed) 0%, var(--surface-lowest) 100%)', display:'flex', gap:24, alignItems:'center' }}>
          <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg, var(--primary), var(--primary-container))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span className="material-icons" style={{ color:'white', fontSize:40 }}>person</span>
          </div>
          <div style={{ flex:1 }}>
            <h2 style={{ fontFamily:'var(--font-headline)', fontSize:'1.5rem', fontWeight:800 }}>{profile.name}</h2>
            <div style={{ color:'var(--on-surface-variant)', fontSize:'0.9rem' }}>{profile.email} · {profile.phone}</div>
            <div style={{ display:'flex', gap:8, marginTop:8 }}>
              <span className="badge badge-success">Verified Patient</span>
              <span className="badge badge-info">Premium Member</span>
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowEditModal(true)}>
            <span className="material-icons" style={{fontSize:16}}>edit</span> Edit Profile
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {[['profile','person','Profile'],['prescriptions','description','Prescriptions'],['orders','shopping_bag','Orders'],['health','favorite','Health Record']].map(([k,icon,label]) => (
            <button key={k} className={`tab ${activeTab===k?'active':''}`} onClick={() => { console.log('Handling tab click for:', k); setActiveTab(k); }}>
              <span className="material-icons" style={{fontSize:18,verticalAlign:'middle',marginRight:6}}>{icon}</span>{label}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <div className="grid-2">
            <div className="card">
              <h3 className="title-md" style={{ marginBottom:16 }}>Personal Information</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {[
                  ['Full Name', profile.name],
                  ['Date of Birth', profile.dob],
                  ['Blood Type', profile.bloodType],
                  ['Weight', profile.weight],
                  ['Height', profile.height],
                  ['Allergies', profile.allergies]
                ].map(([l,v]) => (
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(196,197,213,0.25)' }}>
                    <span style={{ color:'var(--on-surface-variant)', fontSize:'0.875rem' }}>{l}</span>
                    <span style={{ fontWeight:600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 className="title-md" style={{ marginBottom:16 }}>Insurance & Delivery</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {[['Insurance','Pragati Life Insurance'],['Member ID','PLI-123-456-789'],['Coverage','80% Prescription'],['Default Address','House 45, Road 11, Banani, Dhaka'],['Preferred Pharmacy','Dhanmondi Branch']].map(([l,v]) => (
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(196,197,213,0.25)' }}>
                    <span style={{ color:'var(--on-surface-variant)', fontSize:'0.875rem' }}>{l}</span>
                    <span style={{ fontWeight:600, textAlign:'right', maxWidth:200 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {prescriptions.map(p => (
              <div key={p.drug} className="card" style={{ display:'flex', alignItems:'center', gap:16 }}>
                <div style={{ width:48, height:48, borderRadius:12, background:'var(--primary-fixed)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span className="material-icons" style={{ color:'var(--primary-container)', fontSize:24 }}>medication</span>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700 }}>{p.drug}</div>
                  <div style={{ fontSize:'0.8125rem', color:'var(--on-surface-variant)' }}>{p.dose} · Prescribed by {p.prescribed}</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--outline)' }}>Since {p.date} · {p.refills} refills remaining</div>
                </div>
                <span className={`badge ${p.status==='Active'?'badge-success':'badge-warning'}`}>{p.status}</span>
                <button className="btn btn-secondary btn-sm" onClick={() => alert(`Refill request for ${p.drug} submitted! Your pharmacist will contact you shortly.`)}>Refill</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'health' && (
          <div className="grid-2">
            <div className="card">
              <h3 className="title-md" style={{ marginBottom:16 }}>Health Vitals</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {[['Blood Pressure', '120/80 mmHg'],['Blood Sugar', '98 mg/dL'],['Heart Rate', '72 bpm'],['Weight', profile.weight],['Height', profile.height],['BMI', '22.7']].map(([l,v]) => (
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(196,197,213,0.25)' }}>
                    <span style={{ color:'var(--on-surface-variant)', fontSize:'0.875rem' }}>{l}</span>
                    <span style={{ fontWeight:600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 className="title-md" style={{ marginBottom:16 }}>Allergy & Conditions</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div style={{ background:'var(--error-container)', borderRadius:'var(--radius-sm)', padding:'12px 14px' }}>
                  <div style={{ fontWeight:700, color:'var(--error)', fontSize:'0.875rem', marginBottom:4 }}>Known Allergies</div>
                  <div style={{ fontSize:'0.875rem' }}>{profile.allergies}</div>
                </div>
                {[['Chronic Conditions', 'Type 2 Diabetes, Hypertension'],['Current Medications', 'Metformin, Lisinopril, Atorvastatin'],['Last Checkup', 'March 15, 2026'],['Next Appointment','May 10, 2026']].map(([l,v]) => (
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(196,197,213,0.25)' }}>
                    <span style={{ color:'var(--on-surface-variant)', fontSize:'0.875rem' }}>{l}</span>
                    <span style={{ fontWeight:600, textAlign:'right', maxWidth:200 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="card" style={{ padding:0 }}>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Order ID</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>
                  {[['ORD-001','Apr 8','Paracetamol, Vitamin C','৳230','Delivered'],['ORD-002','Apr 1','Metformin 500mg','৳275','Delivered'],['ORD-003','Mar 22','Ibuprofen, Cetirizine','৳185','Delivered']].map(r => (
                    <tr key={r[0]}><td style={{fontWeight:600}}>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td style={{fontWeight:700}}>{r[3]}</td><td><span className="badge badge-success">{r[4]}</span></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="section-header">
              <h2 className="section-title">Edit Personal Details</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowEditModal(false)}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <form onSubmit={handleUpdateProfile} className="login-form" style={{ marginTop: 20 }}>
              <div className="grid-2">
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input className="input" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Email</label>
                  <input className="input" type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
                </div>
              </div>
              <div className="grid-2" style={{ marginTop: 12 }}>
                <div className="input-group">
                  <label className="input-label">Phone</label>
                  <input className="input" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Date of Birth</label>
                  <input className="input" value={profile.dob} onChange={e => setProfile({...profile, dob: e.target.value})} />
                </div>
              </div>
              <div className="input-group" style={{ marginTop: 12 }}>
                <label className="input-label">Allergies</label>
                <textarea className="input" style={{ height: 80 }} value={profile.allergies} onChange={e => setProfile({...profile, allergies: e.target.value})} />
              </div>
              <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
