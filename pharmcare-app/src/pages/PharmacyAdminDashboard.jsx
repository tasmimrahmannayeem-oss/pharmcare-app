import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useRole } from '../context/RoleContext'

export default function PharmacyAdminDashboard() {
  const navigate = useNavigate()
  const { userData } = useRole()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    todaySales: 0,
    yesterdaySales: 0,
    lowStockCount: 0,
    pendingPrescriptions: 0,
    nearExpiryCount: 0,
    recentSales: [],
    staff: [],
    branchName: 'Your Branch'
  })

  useEffect(() => {
    if (userData?.assignedPharmacy) {
      fetchAllData()
    }
  }, [userData])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const headers = { 'Authorization': `Bearer ${userData?.token}` }

      // 1. Fetch Orders
      const ordersRes = await fetch('/api/orders', { headers })
      const orders = await ordersRes.json()
      
      // Calculate Sales
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const dailyOrders = Array.isArray(orders) ? orders : []
      const todayTotal = dailyOrders
        .filter(o => new Date(o.createdAt) >= today)
        .reduce((acc, o) => acc + o.totalAmount, 0)
      
      const yesterdayTotal = dailyOrders
        .filter(o => {
          const d = new Date(o.createdAt)
          return d >= yesterday && d < today
        })
        .reduce((acc, o) => acc + o.totalAmount, 0)

      const recent = dailyOrders.slice(0, 4).map(o => ({
        id: o._id.slice(-6).toUpperCase(),
        customer: o.customer?.name || 'Walk-in',
        items: o.medicines.map(m => `${m.medicine?.name || 'Item'} ×${m.quantity}`).join(', '),
        total: `৳${o.totalAmount.toLocaleString('en-IN')}`,
        method: o.paymentMethod || 'Cash'
      }))

      // 2. Fetch Medicines
      const medRes = await fetch('/api/medicines', { headers })
      const medicines = await medRes.json()
      const medList = Array.isArray(medicines) ? medicines : []
      
      const lowStock = medList.filter(m => m.stockQuantity < 10).length
      
      const sevenDays = 7 * 24 * 60 * 60 * 1000
      const nearExpiry = medList.filter(m => {
        const diff = new Date(m.expiryDate) - new Date()
        return diff > 0 && diff < sevenDays
      }).length

      // 3. Fetch Staff
      const staffRes = await fetch('/api/users', { headers })
      const users = await staffRes.json()
      const staffList = Array.isArray(users) ? users.slice(0, 5).map(u => ({
        name: u.name,
        role: u.role,
        status: 'On Shift', // Placeholder for actual shift logic
        tasks: Math.floor(Math.random() * 20), // Placeholder
        avatar: u.role === 'Pharmacist' ? 'medical_services' : 'person'
      })) : []

      // 4. Fetch Branch Name
      const branchRes = await fetch('/api/pharmacies', { headers })
      const branches = await branchRes.json()
      const currentBranch = Array.isArray(branches) ? branches.find(b => b._id === userData.assignedPharmacy) : null

      setData({
        todaySales: todayTotal,
        yesterdaySales: yesterdayTotal,
        lowStockCount: lowStock,
        pendingPrescriptions: dailyOrders.filter(o => o.status === 'Pending').length,
        nearExpiryCount: nearExpiry,
        recentSales: recent,
        staff: staffList,
        branchName: currentBranch ? currentBranch.name : 'Dhanmondi Branch'
      })

    } catch (err) {
      console.error('Dashboard fetch failed', err)
    } finally {
      setLoading(false)
    }
  }

  const alerts = [
    { 
      msg: `${data.lowStockCount} items at critical low stock — reorder from suppliers`, 
      color: 'var(--error-container)', 
      ic: 'var(--error)', 
      icon: 'warning',
      show: data.lowStockCount > 0,
      path: '/inventory'
    },
    { 
      msg: `${data.nearExpiryCount} items expiring within 7 days`, 
      color: 'var(--tertiary-fixed)', 
      ic: 'var(--tertiary-container)', 
      icon: 'schedule',
      show: data.nearExpiryCount > 0,
      path: '/inventory'
    },
    { 
      msg: `${data.pendingPrescriptions} orders pending verification`, 
      color: 'var(--primary-fixed)', 
      ic: 'var(--primary-container)', 
      icon: 'info',
      show: data.pendingPrescriptions > 0,
      path: '/prescriptions'
    },
  ].filter(a => a.show)

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Synchronizing Live Data...</div>

  return (
    <div className="fade-up">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <h1 className="page-title">Branch Command Center</h1>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
            <div className="live-dot" />
            <span style={{ fontSize:'0.875rem', color:'var(--on-surface-variant)' }}>Live overview · {data.branchName} · System Online</span>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-ghost btn-sm" onClick={fetchAllData}><span className="material-icons" style={{fontSize:16}}>refresh</span></button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/pos')}>
            <span className="material-icons" style={{fontSize:16}}>point_of_sale</span> Open POS
          </button>
        </div>
      </div>

      {/* KPI stats */}
      <div className="grid-4" style={{ marginBottom:24 }}>
        {[
          { label:"Today's Sales", val:`৳${data.todaySales.toLocaleString('en-IN')}`, delta:`vs ৳${data.yesterdaySales.toLocaleString('en-IN')} yesterday`, icon:'payments', bg:'linear-gradient(135deg,var(--primary),var(--primary-container))', white:true },
          { label:'Critical Low Stock', val:`${data.lowStockCount} Items`, delta:'Action required immediately', icon:'warning', bg:'var(--error-container)', ic:'var(--error)' },
          { label:'Pending Verification', val:data.pendingPrescriptions, delta:'Awaiting review', icon:'description', bg:'var(--tertiary-fixed)', ic:'var(--tertiary-container)' },
          { label:'Near Expiry (7 Days)', val:String(data.nearExpiryCount).padStart(2, '0'), delta:'Clearance markdown suggested', icon:'schedule', bg:'var(--primary-fixed)', ic:'var(--primary-container)' },
        ].map(s => (
          <div className="stat-card" key={s.label} style={{ background: s.white ? s.bg : 'var(--surface-lowest)' }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
              <div style={{ width:40, height:40, borderRadius:10, background: s.white ? 'rgba(255,255,255,0.2)' : s.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span className="material-icons" style={{ color: s.white ? 'white' : s.ic, fontSize:22 }}>{s.icon}</span>
              </div>
            </div>
            <div style={{ fontFamily:'var(--font-headline)', fontSize:'1.625rem', fontWeight:800, color: s.white ? 'white' : 'var(--on-surface)' }}>{s.val}</div>
            <div style={{ fontSize:'0.8rem', color: s.white ? 'rgba(255,255,255,0.75)' : 'var(--on-surface-variant)' }}>{s.delta}</div>
            <div style={{ fontSize:'0.75rem', fontWeight:600, color: s.white ? 'rgba(255,255,255,0.9)' : 'var(--on-surface-variant)', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
        {alerts.length === 0 && (
          <div style={{ padding: 12, textAlign: 'center', border: '1px dashed #ddd', borderRadius: 12, color: '#666' }}>All systems stable. No urgent alerts.</div>
        )}
        {alerts.map((a, i) => (
          <div key={i} style={{ background:a.color, borderRadius:'var(--radius)', padding:'12px 16px', display:'flex', gap:10, alignItems:'center' }}>
            <span className="material-icons" style={{ color:a.ic, fontSize:20 }}>{a.icon}</span>
            <span style={{ color:a.ic, fontWeight:500, fontSize:'0.875rem', flex:1 }}>{a.msg}</span>
            <button className="btn btn-sm" style={{ background:a.ic, color:'white', padding:'4px 12px' }}
              onClick={() => navigate(a.path)}>
              Take Action
            </button>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap:24 }}>
        {/* Recent sales */}
        <div className="card" style={{ padding:0 }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--outline-variant)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h3 className="title-md">Recent In-Store Sales</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/analytics')}>View All</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Method</th></tr></thead>
              <tbody>
                {data.recentSales.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: 20 }}>No sales recorded yet.</td></tr>
                ) : data.recentSales.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontFamily:'monospace', fontSize:'0.8rem', fontWeight:600 }}>{t.id}</td>
                    <td>{t.customer}</td>
                    <td style={{ fontSize:'0.8rem', color:'var(--on-surface-variant)', maxWidth:160 }}>{t.items}</td>
                    <td style={{ fontWeight:700 }}>{t.total}</td>
                    <td><span className={`badge ${t.method==='Nagad'?'badge-success':t.method==='Card'?'badge-info':'badge-neutral'}`}>{t.method}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Staff on shift */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div className="card">
            <div className="section-header" style={{ marginBottom:12 }}>
              <h3 className="section-title">Staff on Shift</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/staff')}>Manage</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {data.staff.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: '#666' }}>No other staff currently assigned.</div>
              ) : data.staff.map(s => (
                <div key={s.name} style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--primary-fixed)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span className="material-icons" style={{ color:'var(--primary-container)', fontSize:20 }}>{s.avatar}</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:'0.875rem' }}>{s.name}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--on-surface-variant)' }}>{s.role} · {s.tasks} tasks</div>
                  </div>
                  <span className={`badge ${s.status==='On Shift'?'badge-success':'badge-warning'}`} style={{ fontSize:'0.7rem' }}>{s.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="card">
            <h3 className="section-title" style={{ marginBottom:12 }}>Quick Actions</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { icon:'description', label:'View Queue', to:'/prescriptions', color:'var(--primary-fixed)', ic:'var(--primary-container)' },
                { icon:'point_of_sale', label:'Open POS', to:'/pos', color:'var(--secondary-fixed)', ic:'var(--secondary)' },
                { icon:'inventory_2', label:'Inventory', to:'/inventory', color:'var(--tertiary-fixed)', ic:'var(--tertiary-container)' },
                { icon:'analytics', label:'Analytics', to:'/analytics', color:'var(--primary-fixed)', ic:'var(--primary-container)' },
              ].map(a => (
                <button key={a.label}
                  style={{ background:a.color, border:'none', borderRadius:'var(--radius)', padding:'14px 12px', cursor:'pointer', display:'flex', flexDirection:'column', gap:6, alignItems:'flex-start', fontFamily:'inherit', transition:'transform 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
                  onClick={() => navigate(a.to)}
                >
                  <span className="material-icons" style={{ color:a.ic, fontSize:22 }}>{a.icon}</span>
                  <span style={{ fontSize:'0.8125rem', fontWeight:600, color:a.ic }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
