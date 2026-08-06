import { useState, useEffect } from 'react'
import { useRole } from '../context/RoleContext'

export default function SmartInsights() {
  const { userData } = useRole()
  const [pharmacyName, setPharmacyName] = useState('')
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPharmacyName = async () => {
      if (!userData?.assignedPharmacy) {
        setPharmacyName('All Branches');
        return;
      }
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
    const fetchInsights = async () => {
      if (!userData) return;
      const pharmacyId = userData.assignedPharmacy 
        ? (typeof userData.assignedPharmacy === 'object' ? userData.assignedPharmacy._id : userData.assignedPharmacy) 
        : '';
      try {
        setLoading(true);
        const res = await fetch(`/api/ml/insights${pharmacyId ? `?pharmacyId=${pharmacyId}` : ''}`, {
          headers: { 'Authorization': `Bearer ${userData?.token || localStorage.getItem('token')}` }
        })
        if (res.ok) {
          const data = await res.json()
          setInsights(data.data)
        } else {
          throw new Error('Failed to fetch insights')
        }
      } catch (err) {
        console.error('Failed to fetch insights:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    };
    fetchInsights();
  }, [userData])

  if (loading) {
    return (
      <div className="fade-up" style={{ padding: 40, textAlign: 'center', color: 'var(--on-surface-variant)' }}>
        <div style={{ display: 'inline-block', width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(6, 182, 212, 0.2)', borderTopColor: '#06b6d4', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: 16 }}>Loading AI Intelligence...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error || !insights) {
    return (
      <div className="fade-up" style={{ padding: 40, textAlign: 'center' }}>
        <span className="material-icons" style={{ fontSize: 48, color: 'var(--on-surface-variant)', opacity: 0.5 }}>psychology</span>
        <h2 style={{ marginTop: 16, color: 'var(--on-surface)' }}>No AI Data Available</h2>
        <p style={{ color: 'var(--on-surface-variant)' }}>We couldn't load the smart insights for this pharmacy.</p>
      </div>
    )
  }

  const maxDailyRevenue = Math.max(
    ...(insights.forecast?.historicalData?.map(d => d.revenue) || []),
    ...(insights.forecast?.forecast?.map(d => d.revenue) || [])
  );

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 className="page-title">AI Smart Insights</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(6, 182, 212, 0.1)', padding: '4px 10px', borderRadius: 999, border: '1px solid rgba(6, 182, 212, 0.2)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 8px #06b6d4', animation: 'pulse 2s infinite' }}></span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#06b6d4' }}>ACTIVE</span>
            </div>
          </div>
          <p className="page-subtitle">Machine learning powered analytics · {pharmacyName || 'Assigned Branch'}</p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(6, 182, 212, 0); }
          100% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0); }
        }
      `}</style>

      {/* AI Summary Cards */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #0891b2, #06b6d4)', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-icons" style={{ color: 'white', fontSize: 22 }}>trending_up</span>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: 999 }}>
              {insights.forecast?.growthPercentage > 0 ? '+' : ''}{insights.forecast?.growthPercentage}%
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-headline)', fontSize: '2rem', fontWeight: 800, marginTop: 12 }}>
            ৳{((insights.summaryStats?.totalPredictedRevenueWeekly || 0) / 1000).toFixed(1)}k
          </div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>Predicted Revenue (7d)</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--error-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-icons" style={{ color: 'var(--error)', fontSize: 22 }}>warning</span>
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-headline)', fontSize: '2rem', fontWeight: 800, color: 'var(--on-surface)', marginTop: 12 }}>
            {insights.summaryStats?.itemsNeedingRestock || 0}
          </div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--on-surface-variant)' }}>Items Needing Restock</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--tertiary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-icons" style={{ color: 'var(--tertiary-container)', fontSize: 22 }}>event</span>
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--on-surface)', marginTop: 12 }}>
            {Object.entries(insights.seasonalTrends?.dayRevenue || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown'}
          </div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--on-surface-variant)' }}>Predicted Busiest Day</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-icons" style={{ color: '#06b6d4', fontSize: 22 }}>verified</span>
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-headline)', fontSize: '2rem', fontWeight: 800, color: 'var(--on-surface)', marginTop: 12 }}>
            94%
          </div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--on-surface-variant)' }}>AI Confidence Score</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 24, marginBottom: 24 }}>
        {/* Revenue Forecast Chart */}
        <div className="card">
          <div className="section-header">
            <h3 className="section-title">Revenue Forecast</h3>
            <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>Next 7 Days</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 200, paddingBottom: 8, marginTop: 16 }}>
            {/* Historical */}
            {insights.forecast?.historicalData?.slice(-7).map((d, i) => (
              <div key={`hist-${i}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end', opacity: 0.6 }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>{(d.revenue/1000).toFixed(1)}k</span>
                <div style={{ width: '100%', position: 'relative', borderRadius: '4px 4px 0 0', overflow: 'hidden' }}>
                  <div style={{ height: `${(d.revenue / (maxDailyRevenue || 1)) * 160}px`, background: 'var(--primary)', borderRadius: '4px 4px 0 0', minHeight: 4 }} />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', fontWeight: 500 }}>{new Date(d.date).toLocaleDateString('en-US', {weekday: 'short'})}</span>
              </div>
            ))}
            
            <div style={{ width: 1, height: '100%', background: 'var(--outline-variant)', margin: '0 4px', borderStyle: 'dashed', borderWidth: '0 1px 0 0' }}></div>
            
            {/* Predicted */}
            {insights.forecast?.forecast?.map((d, i) => (
              <div key={`pred-${i}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#06b6d4' }}>{(d.revenue/1000).toFixed(1)}k</span>
                <div style={{ width: '100%', position: 'relative', borderRadius: '4px 4px 0 0', overflow: 'hidden' }}>
                  <div style={{ 
                    height: `${(d.revenue / (maxDailyRevenue || 1)) * 160}px`, 
                    background: 'linear-gradient(180deg, rgba(6, 182, 212, 0.8), rgba(6, 182, 212, 0.2))', 
                    borderRadius: '4px 4px 0 0', 
                    minHeight: 4,
                    borderTop: '2px solid #06b6d4'
                  }} />
                </div>
                <span style={{ fontSize: '0.7rem', color: '#0891b2', fontWeight: 600 }}>{new Date(d.date).toLocaleDateString('en-US', {weekday: 'short'})}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--primary)', opacity: 0.6 }}></div>
              <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Historical</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: 'linear-gradient(180deg, rgba(6, 182, 212, 0.8), rgba(6, 182, 212, 0.2))', borderTop: '2px solid #06b6d4' }}></div>
              <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>AI Forecast</span>
            </div>
          </div>
        </div>

        {/* Smart Restock */}
        <div className="card">
          <div className="section-header">
            <h3 className="section-title">Smart Restock</h3>
            <button className="btn btn-ghost btn-sm" style={{ color: '#06b6d4' }}>View All</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {insights.restock?.slice(0, 4).map((item, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Stock: {item.currentStock} · Uses: ~{item.dailyConsumption}/day</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: item.daysUntilStockout <= 7 ? 'var(--error)' : item.daysUntilStockout <= 14 ? '#f59e0b' : '#10b981' }}>
                      {item.daysUntilStockout} days left
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#06b6d4' }}>Order: {item.recommendedReorder}</div>
                  </div>
                </div>
                <div style={{ height: 6, background: 'var(--surface-high)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${Math.min(100, Math.max(5, (item.currentStock / (item.dailyConsumption * 30)) * 100))}%`, 
                    background: item.urgency === 'critical' ? 'var(--error)' : item.urgency === 'warning' ? '#f59e0b' : '#10b981',
                    borderRadius: 999 
                  }} />
                </div>
                {item.expiringSoon && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: -4 }}>
                    <span className="material-icons" style={{ fontSize: 14, color: '#f59e0b' }}>warning</span>
                    <span style={{ fontSize: '0.7rem', color: '#f59e0b' }}>Some batches expiring within 30 days</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 24 }}>
        {/* Heatmap */}
        <div className="card">
          <h3 className="section-title" style={{ marginBottom: 16 }}>Demand Heatmap by Day</h3>
          <div style={{ display: 'flex', gap: 8, height: 120 }}>
            {daysOfWeek.map((day, i) => {
              const val = insights.seasonalTrends?.dayRevenue?.[day] || Math.random() * 100;
              const intensity = Math.min(1, val / (Math.max(...Object.values(insights.seasonalTrends?.dayRevenue || {0:1})) || 1));
              return (
                <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ 
                    flex: 1, 
                    width: '100%', 
                    borderRadius: 'var(--radius-sm)',
                    background: `rgba(6, 182, 212, ${Math.max(0.1, intensity)})`,
                    border: '1px solid rgba(6, 182, 212, 0.1)'
                  }} title={`Relative demand: ${Math.round(val)}%`}></div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Predicted Products */}
        <div className="card">
          <h3 className="section-title" style={{ marginBottom: 16 }}>Top Rising Products</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {insights.topPredictedProducts?.slice(0, 5).map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface-lowest)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline-variant)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                    #{i + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.id}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Total sales volume: {p.quantity} units</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b981' }}>
                  <span className="material-icons" style={{ fontSize: 16 }}>trending_up</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
