import { useState, useEffect } from 'react'
import { useRole } from '../context/RoleContext'

const weeklyData = [
  { day:'Mon', revenue:3200, prescriptions:48 },
  { day:'Tue', revenue:4100, prescriptions:62 },
  { day:'Wed', revenue:3800, prescriptions:57 },
  { day:'Thu', revenue:4820, prescriptions:71 },
  { day:'Fri', revenue:5200, prescriptions:78 },
  { day:'Sat', revenue:4500, prescriptions:65 },
  { day:'Sun', revenue:2800, prescriptions:38 },
]
const maxRevenue = Math.max(...weeklyData.map(d => d.revenue))

const topProducts = [
  { name:'Paracetamol 500mg', units:1240, revenue:'৳6,188', pct:92 },
  { name:'Metformin 850mg', units:890, revenue:'৳8,099', pct:74 },
  { name:'Vitamin C 1000mg', units:650, revenue:'৳8,450', pct:60 },
  { name:'Ibuprofen 400mg', units:720, revenue:'৳4,536', pct:54 },
]

export default function SalesAnalytics() {
  const { userData } = useRole()
  const [period, setPeriod] = useState('Week')
  const [pharmacyName, setPharmacyName] = useState('')
  const [forecast, setForecast] = useState(null)
  const [loadingAI, setLoadingAI] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    prescriptionsFilled: 0,
    avgTransaction: 0,
    newCustomers: 0,
    weeklyData: [
      { day:'Mon', revenue:0, prescriptions:0 },
      { day:'Tue', revenue:0, prescriptions:0 },
      { day:'Wed', revenue:0, prescriptions:0 },
      { day:'Thu', revenue:0, prescriptions:0 },
      { day:'Fri', revenue:0, prescriptions:0 },
      { day:'Sat', revenue:0, prescriptions:0 },
      { day:'Sun', revenue:0, prescriptions:0 },
    ],
    topProducts: [],
    paymentMethods: [
      { label:'bKash', pct:0, color:'var(--primary-container)', amount:'৳0' },
      { label:'Nagad', pct:0, color:'var(--secondary)', amount:'৳0' },
      { label:'Cash/Card', pct:0, color:'var(--outline)', amount:'৳0' },
    ]
  })

  useEffect(() => {
    const fetchPharmacyName = async () => {
      if (!userData?.assignedPharmacy) return;
      const pharmacyId = typeof userData.assignedPharmacy === 'object' ? userData.assignedPharmacy._id : userData.assignedPharmacy;
      if (!pharmacyId) return;
      try {
        const res = await fetch(`/api/pharmacies/${pharmacyId}`, {
          headers: { 'Authorization': `Bearer ${userData?.token || localStorage.getItem('token')}` }
        })
        if (res.ok) {
          const data = await res.json()
          setPharmacyName(data.name || '')
        }
      } catch (err) {
        console.error('Failed to fetch pharmacy name:', err)
      }
    };
    fetchPharmacyName();
  }, [userData])

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true)
        const token = userData?.token || localStorage.getItem('token')
        const rawPharmacy = userData?.assignedPharmacy
        const pharmacyId = rawPharmacy?._id ? rawPharmacy._id : rawPharmacy
        const queryParam = pharmacyId ? `?pharmacy=${pharmacyId}` : ''
        
        const res = await fetch(`/api/orders${queryParam}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to fetch orders')
        const allOrders = await res.json()

        // Filter for paid/confirmed/delivered orders
        const validOrders = Array.isArray(allOrders)
          ? allOrders.filter(o => ['Confirmed', 'Being Processed', 'Dispatched', 'Delivered'].includes(o.status))
          : []

        // Filter by selected period
        const now = new Date()
        let periodFilteredOrders = [...validOrders]
        if (period === 'Day') {
          const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          periodFilteredOrders = validOrders.filter(o => new Date(o.createdAt) >= startOfDay)
        } else if (period === 'Week') {
          const d = new Date()
          const startOfWeek = new Date(d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1))) // Monday
          startOfWeek.setHours(0,0,0,0)
          periodFilteredOrders = validOrders.filter(o => new Date(o.createdAt) >= startOfWeek)
        } else if (period === 'Month') {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          periodFilteredOrders = validOrders.filter(o => new Date(o.createdAt) >= startOfMonth)
        } else if (period === 'Year') {
          const startOfYear = new Date(now.getFullYear(), 0, 1)
          periodFilteredOrders = validOrders.filter(o => new Date(o.createdAt) >= startOfYear)
        }

        // 1. Calculations
        const totalRevenue = periodFilteredOrders.reduce((acc, o) => acc + o.totalAmount, 0)
        const avgTransaction = periodFilteredOrders.length > 0 ? (totalRevenue / periodFilteredOrders.length) : 0
        const rxCount = periodFilteredOrders.filter(o => 
          o.prescriptionImage || o.medicines.some(m => m.medicine?.requiresPrescription)
        ).length
        const uniqueCustomers = new Set(periodFilteredOrders.filter(o => o.customer).map(o => String(o.customer?._id || o.customer))).size

        // 2. Weekly Chart
        const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        const weeklyRevenue = weekdays.map(day => ({ day, revenue: 0, prescriptions: 0 }))
        const d = new Date()
        const startOfWeek = new Date(d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1)))
        startOfWeek.setHours(0,0,0,0)

        validOrders.forEach(o => {
          const orderDate = new Date(o.createdAt)
          if (orderDate >= startOfWeek) {
            let dayIndex = orderDate.getDay() - 1 // Sunday is 0
            if (dayIndex === -1) dayIndex = 6 // Map Sunday to 6
            weeklyRevenue[dayIndex].revenue += o.totalAmount
            if (o.prescriptionImage || o.medicines.some(m => m.medicine?.requiresPrescription)) {
              weeklyRevenue[dayIndex].prescriptions += 1
            }
          }
        })

        // 3. Top Products
        const productMap = {}
        validOrders.forEach(o => {
          o.medicines.forEach(m => {
            if (!m.medicine) return
            const medId = m.medicine._id || m.medicine
            const name = m.medicine.name || 'Unknown Item'
            if (!productMap[medId]) {
              productMap[medId] = { name, units: 0, revenue: 0 }
            }
            productMap[medId].units += m.quantity
            productMap[medId].revenue += m.quantity * m.price
          })
        })
        const sortedProducts = Object.values(productMap)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 4)
        
        const maxProductRevenue = sortedProducts.length > 0 ? Math.max(...sortedProducts.map(p => p.revenue)) : 1
        const finalProducts = sortedProducts.map(p => ({
          ...p,
          pct: Math.round((p.revenue / maxProductRevenue) * 100),
          revenue: `৳${p.revenue.toLocaleString('en-IN')}`
        }))

        // 4. Payment Methods
        let bkashVal = 0, nagadVal = 0, cashCardVal = 0
        validOrders.forEach(o => {
          const note = o.statusTimeline?.[0]?.note || ''
          if (note.toLowerCase().includes('nagad')) {
            nagadVal += o.totalAmount
          } else if (note.toLowerCase().includes('card') || note.toLowerCase().includes('cash')) {
            cashCardVal += o.totalAmount
          } else {
            bkashVal += o.totalAmount
          }
        })
        const totalPayment = bkashVal + nagadVal + cashCardVal || 1
        const paymentMethods = [
          { label: 'bKash', pct: Math.round((bkashVal / totalPayment) * 100), color: 'var(--primary-container)', amount: `৳${bkashVal.toLocaleString('en-IN')}` },
          { label: 'Nagad', pct: Math.round((nagadVal / totalPayment) * 100), color: 'var(--secondary)', amount: `৳${nagadVal.toLocaleString('en-IN')}` },
          { label: 'Cash/Card', pct: Math.round((cashCardVal / totalPayment) * 100), color: 'var(--outline)', amount: `৳${cashCardVal.toLocaleString('en-IN')}` }
        ]

        setStats({
          totalRevenue,
          prescriptionsFilled: rxCount,
          avgTransaction,
          newCustomers: uniqueCustomers,
          weeklyData: weeklyRevenue,
          topProducts: finalProducts,
          paymentMethods
        })
      } catch (err) {
        console.error('Failed to load sales data:', err)
      } finally {
        setLoading(false)
      }
    }

    if (userData?.token) {
      fetchSalesData()
    }
  }, [userData?.assignedPharmacy, userData?.token, period])

  useEffect(() => {
    const fetchAIForecast = async () => {
      if (!userData?.token) return;
      const pharmacyId = userData.assignedPharmacy 
        ? (typeof userData.assignedPharmacy === 'object' ? userData.assignedPharmacy._id : userData.assignedPharmacy) 
        : '';
      setLoadingAI(true);
      try {
        const res = await fetch(`/api/ml/forecast${pharmacyId ? `?pharmacyId=${pharmacyId}` : ''}`, {
          headers: { 'Authorization': `Bearer ${userData?.token || localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setForecast(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch AI forecast:', err);
      } finally {
        setLoadingAI(false);
      }
    };
    fetchAIForecast();
  }, [userData]);

  const maxRevenue = Math.max(...stats.weeklyData.map(d => d.revenue)) || 1

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Calculating revenue matrix...</div>

  return (
    <div className="fade-up">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div className="page-header" style={{ marginBottom:0 }}>
          <h1 className="page-title">Sales Analytics</h1>
          <p className="page-subtitle">Revenue intelligence · {pharmacyName || 'Assigned Branch'}</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {['Day','Week','Month','Year'].map(p => (
            <button key={p} className={`btn btn-sm ${period===p?'btn-primary':'btn-ghost'}`} onClick={() => setPeriod(p)}>{p}</button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid-4" style={{ marginBottom:28 }}>
        {[
          { label:'Total Revenue', val:`৳${stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, delta:'Sync Live', icon:'trending_up', bg:'linear-gradient(135deg,var(--primary),var(--primary-container))', textColor:'white' },
          { label:'Prescriptions Filled', val:stats.prescriptionsFilled, delta:'Rx Tracked', icon:'description', bg:'var(--secondary-fixed)', icolor:'var(--secondary)', textColor:'var(--on-surface)' },
          { label:'Avg. Transaction', val:`৳${stats.avgTransaction.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, delta:'Average Ticket', icon:'receipt', bg:'var(--primary-fixed)', icolor:'var(--primary-container)', textColor:'var(--on-surface)' },
          { label:'New Customers', val:stats.newCustomers, delta:'Unique patients', icon:'person_add', bg:'var(--tertiary-fixed)', icolor:'var(--tertiary-container)', textColor:'var(--on-surface)' },
        ].map(s => (
          <div className="stat-card" key={s.label} style={{ background: s.textColor==='white' ? s.bg : 'var(--surface-lowest)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ width:40, height:40, borderRadius:10, background: s.textColor==='white' ? 'rgba(255,255,255,0.2)' : s.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span className="material-icons" style={{ color: s.textColor==='white' ? 'white' : s.icolor, fontSize:22 }}>{s.icon}</span>
              </div>
              <span style={{ fontSize:'0.75rem', fontWeight:700, color: s.textColor==='white' ? 'rgba(255,255,255,0.8)' : 'var(--secondary)', background: s.textColor==='white' ? 'rgba(255,255,255,0.15)' : 'var(--secondary-fixed)', padding:'3px 8px', borderRadius:999 }}>{s.delta}</span>
            </div>
            <div style={{ fontFamily:'var(--font-headline)', fontSize:'2rem', fontWeight:800, color: s.textColor }}>{s.val}</div>
            <div style={{ fontSize:'0.8125rem', fontWeight:500, color: s.textColor==='white' ? 'rgba(255,255,255,0.75)' : 'var(--on-surface-variant)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap:24 }}>
        {/* Bar chart (styled divs) */}
        <div className="card">
          <div className="section-header">
            <h3 className="section-title">Daily Revenue — This Week</h3>
            <span className="badge badge-success">Live Sync</span>
          </div>
          <div className="chart-scroll-wrap">
            <div className="chart-inner-wrap" style={{ display:'flex', alignItems:'flex-end', gap:12, height:180, paddingBottom:8 }}>
              {stats.weeklyData.map(d => (
                <div key={d.day} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6, height:'100%', justifyContent:'flex-end' }}>
                  <span style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--primary-container)' }}>৳{(d.revenue/1000).toFixed(1)}k</span>
                  <div style={{ width:'100%', position:'relative', borderRadius:'var(--radius-sm) var(--radius-sm) 0 0', overflow:'hidden' }}>
                    <div style={{ height: `${(d.revenue/maxRevenue)*140}px`, background:'linear-gradient(180deg, var(--primary-container), var(--primary))', borderRadius:'var(--radius-sm) var(--radius-sm) 0 0', transition:'height 0.4s ease', minHeight:8 }} />
                  </div>
                  <span style={{ fontSize:'0.75rem', color:'var(--on-surface-variant)', fontWeight:500 }}>{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top products */}
        <div className="card">
          <div className="section-header">
            <h3 className="section-title">Top Revenue Products</h3>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {stats.topProducts.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--on-surface-variant)' }}>No sales transactions found.</div>
            ) : stats.topProducts.map((p, i) => (
              <div key={p.name}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ width:22, height:22, borderRadius:'50%', background:'var(--primary-fixed)', color:'var(--primary-container)', fontSize:'0.7rem', fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center' }}>{i+1}</span>
                    <span style={{ fontWeight:600, fontSize:'0.875rem' }}>{p.name}</span>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontWeight:800, fontSize:'0.9rem', color:'var(--primary-container)' }}>{p.revenue}</div>
                    <div style={{ fontSize:'0.7rem', color:'var(--on-surface-variant)' }}>{p.units} units</div>
                  </div>
                </div>
                <div style={{ height:8, background:'var(--surface-high)', borderRadius:999 }}>
                  <div style={{ height:'100%', borderRadius:999, width:`${p.pct}%`, background:'linear-gradient(90deg, var(--secondary), #10b981)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment methods donut-style */}
        <div className="card">
          <h3 className="section-title" style={{ marginBottom:14 }}>Payment Methods</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {stats.paymentMethods.map(m => (
              <div key={m.label} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:12, height:12, borderRadius:3, background:m.color, flexShrink:0 }} />
                <span style={{ flex:1, fontSize:'0.875rem' }}>{m.label}</span>
                <div style={{ width:120, height:8, background:'var(--surface-high)', borderRadius:999 }}>
                  <div style={{ height:'100%', borderRadius:999, width:`${m.pct}%`, background:m.color }} />
                </div>
                <span style={{ fontSize:'0.8125rem', fontWeight:600, minWidth:64, textAlign:'right' }}>{m.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly peak */}
        <div className="card">
          <h3 className="section-title" style={{ marginBottom:14 }}>Hourly Dispensing Traffic</h3>
          <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:100 }}>
            {[3,6,12,18,25,32,28,35,42,38,30,22,18,12,8,5].map((v,i) => (
              <div key={i} style={{ flex:1, borderRadius:'3px 3px 0 0', background: v>32 ? 'var(--secondary)' : 'var(--primary-fixed)', height:`${(v/42)*100}%`, minHeight:4, transition:'height 0.3s' }} />
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
            <span style={{ fontSize:'0.7rem', color:'var(--on-surface-variant)' }}>8 AM</span>
            <span style={{ fontSize:'0.7rem', color:'var(--on-surface-variant)' }}>12 PM</span>
            <span style={{ fontSize:'0.7rem', color:'var(--on-surface-variant)' }}>4 PM</span>
            <span style={{ fontSize:'0.7rem', color:'var(--on-surface-variant)' }}>8 PM</span>
          </div>
        </div>
      </div>

      {/* AI Revenue Forecast */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 className="section-title">AI Revenue Forecast</h3>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 8px #06b6d4', animation: 'pulse 2s infinite' }}></span>
          </div>
          <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.2)' }}>Powered by ML</span>
        </div>
        
        {loadingAI ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>Loading AI predictions...</div>
        ) : forecast ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#06b6d4', fontFamily: 'var(--font-headline)' }}>৳{((forecast.predictedRevenue?.weekly || 0) / 1000).toFixed(1)}k</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>Predicted next 7 days</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: forecast.growthPercentage > 0 ? '#10b981' : 'var(--error)' }}>
                <span className="material-icons" style={{ fontSize: 18 }}>{forecast.growthPercentage > 0 ? 'trending_up' : 'trending_down'}</span>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{Math.abs(forecast.growthPercentage)}%</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160, paddingBottom: 8 }}>
              {forecast.forecast?.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#06b6d4' }}>৳{(d.revenue / 1000).toFixed(1)}k</span>
                  <div style={{ width: '100%', position: 'relative', borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', overflow: 'hidden' }}>
                    <div style={{ 
                      height: `${(d.revenue / Math.max(...(forecast.forecast?.map(x => x.revenue) || [1]))) * 120}px`, 
                      background: 'linear-gradient(180deg, rgba(6, 182, 212, 0.8), rgba(6, 182, 212, 0.2))', 
                      borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', 
                      minHeight: 8,
                      borderTop: '2px solid #06b6d4'
                    }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 500 }}>{new Date(d.date).toLocaleDateString('en-US', {weekday: 'short'})}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', textAlign: 'right', marginTop: 8 }}>
              Based on {forecast.historicalDays || 90} days of historical data
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
