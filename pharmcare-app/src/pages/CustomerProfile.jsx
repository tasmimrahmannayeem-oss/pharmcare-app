import { useState, useEffect } from 'react'
import { useRole } from '../context/RoleContext'
import { useCart } from '../context/CartContext'

const statusBadge = {
  Pending: 'badge-warning', Confirmed: 'badge-info', 'Being Processed': 'badge-info',
  Dispatched: 'badge-warning', Delivered: 'badge-success', Cancelled: 'badge-error', Rejected: 'badge-error'
}

export default function CustomerProfile() {
  const { userData } = useRole()
  const { selectedPharmacy } = useCart()
  const [activeTab, setActiveTab] = useState('profile')
  const [showEditModal, setShowEditModal] = useState(false)
  const [profile, setProfile] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [orders, setOrders] = useState([])
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const token = userData?.token || localStorage.getItem('token')
  const userId = userData?._id

  // Fetch profile on mount
  useEffect(() => {
    if (!userId) return
    fetchProfile()
  }, [userId])

  // Fetch orders when that tab is active
  useEffect(() => {
    if (activeTab === 'orders') fetchOrders()
  }, [activeTab])

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true)
      const res = await fetch(`/api/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setProfile(data)
        setEditForm({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || ''
        })
      }
    } catch (err) {
      console.error('Profile fetch error:', err)
    } finally {
      setLoadingProfile(false)
    }
  }

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true)
      const res = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Orders fetch error:', err)
    } finally {
      setLoadingOrders(false)
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      })
      const data = await res.json()
      if (res.ok) {
        setProfile(data)
        setSaveMsg('Profile updated successfully!')
        setShowEditModal(false)
        setTimeout(() => setSaveMsg(''), 3000)
      } else {
        alert(data.message || 'Failed to update')
      }
    } catch {
      alert('Connection error')
    } finally {
      setSaving(false)
    }
  }

  if (loadingProfile) {
    return (
      <div className="fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ textAlign: 'center' }}>
          <span className="material-icons" style={{ fontSize: 48, color: 'var(--outline)', animation: 'spin 1s linear infinite' }}>refresh</span>
          <p style={{ marginTop: 12, color: 'var(--on-surface-variant)' }}>Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="fade-up card text-center" style={{ padding: 60 }}>
        <span className="material-icons" style={{ fontSize: 48, color: 'var(--outline)' }}>person_off</span>
        <p style={{ marginTop: 12 }}>Could not load profile. Please log in again.</p>
      </div>
    )
  }

  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : 'N/A'

  return (
    <>
      <div className="fade-up">
        {saveMsg && (
          <div style={{ background: 'var(--secondary-fixed)', color: 'var(--secondary)', padding: '12px 20px', borderRadius: 10, marginBottom: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-icons" style={{ fontSize: 18 }}>check_circle</span>
            {saveMsg}
          </div>
        )}

        {/* Profile header */}
        <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, var(--primary-fixed) 0%, var(--surface-lowest) 100%)', display: 'flex', gap: 24, alignItems: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-container))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span className="material-icons" style={{ color: 'white', fontSize: 40 }}>person</span>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.5rem', fontWeight: 800 }}>{profile.name}</h2>
            <div style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>
              {profile.email}{profile.phone ? ` · ${profile.phone}` : ''}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <span className="badge badge-success">Verified Patient</span>
              <span className="badge badge-info">Member since {memberSince}</span>
              {selectedPharmacy && <span className="badge badge-neutral">{selectedPharmacy.name}</span>}
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowEditModal(true)}>
            <span className="material-icons" style={{ fontSize: 16 }}>edit</span> Edit Profile
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {[['profile', 'person', 'Profile'], ['orders', 'shopping_bag', 'My Orders'], ['health', 'favorite', 'Health Record']].map(([k, icon, label]) => (
            <button key={k} className={`tab ${activeTab === k ? 'active' : ''}`} onClick={() => setActiveTab(k)}>
              <span className="material-icons" style={{ fontSize: 18, verticalAlign: 'middle', marginRight: 6 }}>{icon}</span>{label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid-2">
            <div className="card">
              <h3 className="title-md" style={{ marginBottom: 16 }}>Personal Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  ['Full Name', profile.name],
                  ['Email Address', profile.email],
                  ['Phone Number', profile.phone || '—'],
                  ['Address', profile.address || '—'],
                  ['Account Role', profile.role],
                  ['Member Since', memberSince]
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(196,197,213,0.25)' }}>
                    <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>{l}</span>
                    <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: 220 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 className="title-md" style={{ marginBottom: 16 }}>Account Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  ['Account Status', profile.isApproved ? 'Approved' : 'Pending Approval'],
                  ['Preferred Branch', selectedPharmacy?.name || 'Not selected'],
                  ['Preferred Branch Location', selectedPharmacy?.location || '—'],
                  ['Account ID', profile._id?.slice(-8).toUpperCase() || '—']
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(196,197,213,0.25)' }}>
                    <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>{l}</span>
                    <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: 200 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="card" style={{ padding: 0 }}>
            {loadingOrders ? (
              <div style={{ textAlign: 'center', padding: 60 }}>Loading your orders...</div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <span className="material-icons" style={{ fontSize: 48, color: 'var(--outline)' }}>shopping_bag</span>
                <p style={{ marginTop: 12 }}>No orders yet.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Order ID</th><th>Date</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o._id}>
                        <td style={{ fontWeight: 600 }}>ORD-{o._id.slice(-6).toUpperCase()}</td>
                        <td>{new Date(o.createdAt).toLocaleDateString('en-GB')}</td>
                        <td style={{ fontSize: '0.8rem' }}>{o.medicines?.map(m => m.medicine?.name || 'Item').join(', ') || '—'}</td>
                        <td style={{ fontWeight: 700, color: 'var(--primary-container)' }}>৳{(o.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td style={{ fontSize: '0.8rem' }}>{o.paymentMethod || '—'}</td>
                        <td><span className={`badge ${statusBadge[o.status] || 'badge-neutral'}`}>{o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Health Tab - editable fields from profile */}
        {activeTab === 'health' && (
          <div className="grid-2">
            <div className="card">
              <h3 className="title-md" style={{ marginBottom: 16 }}>Contact & Delivery</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  ['Phone Number', profile.phone || '—'],
                  ['Delivery Address', profile.address || '—'],
                  ['Preferred Branch', selectedPharmacy?.name || 'Not selected'],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(196,197,213,0.25)' }}>
                    <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>{l}</span>
                    <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: 220 }}>{v}</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 16 }} onClick={() => setShowEditModal(true)}>
                <span className="material-icons" style={{ fontSize: 16 }}>edit</span> Update Info
              </button>
            </div>
            <div className="card">
              <h3 className="title-md" style={{ marginBottom: 16 }}>Order Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  ['Total Orders', orders.length || '—'],
                  ['Delivered', orders.filter(o => o.status === 'Delivered').length],
                  ['Pending / Processing', orders.filter(o => ['Pending', 'Confirmed', 'Being Processed'].includes(o.status)).length],
                  ['Total Spent', `৳${orders.filter(o => o.status !== 'Cancelled').reduce((acc, o) => acc + (o.totalAmount || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`]
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(196,197,213,0.25)' }}>
                    <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>{l}</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary-container)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="section-header">
              <h2 className="section-title">Edit Profile</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowEditModal(false)}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveProfile} style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="grid-2">
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input className="input" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Email</label>
                  <input className="input" type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} required />
                </div>
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label className="input-label">Phone Number</label>
                  <input className="input" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} placeholder="+880 1711 000000" />
                </div>
                <div className="input-group">
                  <label className="input-label">Address</label>
                  <input className="input" value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} placeholder="House no, Road, Area, City" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
