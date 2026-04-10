import { useState } from 'react'

const prescriptions = [
  { drug:'Metformin 500mg', dose:'1 tablet twice daily', prescribed:'Dr. A. Patel', date:'Mar 12, 2026', refills:2, status:'Active' },
  { drug:'Lisinopril 10mg', dose:'1 tablet daily', prescribed:'Dr. K. Brown', date:'Feb 28, 2026', refills:5, status:'Active' },
  { drug:'Atorvastatin 40mg', dose:'1 tablet at bedtime', prescribed:'Dr. A. Patel', date:'Jan 10, 2026', refills:3, status:'Expiring Soon' },
]

export default function CustomerProfile() {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="fade-up">
      {/* Profile header card */}
      <div className="card" style={{ marginBottom:24, background:'linear-gradient(135deg, var(--primary-fixed) 0%, var(--surface-lowest) 100%)', display:'flex', gap:24, alignItems:'center' }}>
        <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg, var(--primary), var(--primary-container))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <span className="material-icons" style={{ color:'white', fontSize:40 }}>person</span>
        </div>
        <div style={{ flex:1 }}>
          <h2 style={{ fontFamily:'var(--font-headline)', fontSize:'1.5rem', fontWeight:800 }}>Alex Johnson</h2>
          <div style={{ color:'var(--on-surface-variant)', fontSize:'0.9rem' }}>alex.johnson@email.com · +1 555 0100</div>
          <div style={{ display:'flex', gap:8, marginTop:8 }}>
            <span className="badge badge-success">Verified Patient</span>
            <span className="badge badge-info">Premium Member</span>
          </div>
        </div>
        <button className="btn btn-primary btn-sm"><span className="material-icons" style={{fontSize:16}}>edit</span> Edit Profile</button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[['profile','person','Profile'],['prescriptions','description','Prescriptions'],['orders','shopping_bag','Orders'],['health','favorite','Health Record']].map(([k,icon,label]) => (
          <button key={k} className={`tab ${activeTab===k?'active':''}`} onClick={() => setActiveTab(k)}>
            <span className="material-icons" style={{fontSize:18,verticalAlign:'middle',marginRight:6}}>{icon}</span>{label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="grid-2">
          <div className="card">
            <h3 className="title-md" style={{ marginBottom:16 }}>Personal Information</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[['Full Name','Alex Johnson'],['Date of Birth','March 15, 1985'],['Blood Type','A+'],['Weight','72 kg'],['Height','178 cm'],['Allergies','Penicillin, Sulfa drugs']].map(([l,v]) => (
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
              {[['Insurance','BlueCross BlueShield'],['Member ID','BCB-123-456-789'],['Coverage','80% Prescription'],['Default Address','123 Medical Ave, HC'],['Preferred Pharmacy','Green Valley Branch']].map(([l,v]) => (
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
              <button className="btn btn-secondary btn-sm">Refill</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="card" style={{ padding:0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Order ID</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                {[['ORD-001','Apr 8','Paracetamol, Vitamin C','$22.97','Delivered'],['ORD-002','Apr 1','Metformin 500mg','$27.30','Delivered'],['ORD-003','Mar 22','Ibuprofen, Cetirizine','$18.40','Delivered']].map(r => (
                  <tr key={r[0]}><td style={{fontWeight:600}}>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td style={{fontWeight:700}}>{r[3]}</td><td><span className="badge badge-success">{r[4]}</span></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
