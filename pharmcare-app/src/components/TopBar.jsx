import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useRole, roles } from '../context/RoleContext'
import { useCart } from '../context/CartContext'
import PharmacySelectModal from './PharmacySelectModal'
import './TopBar.css'

const pageTitles = {
  '/home': 'Online Pharmacy',
  '/search': 'Medicine Search',
  '/catalogue': 'Product Catalogue',
  '/checkout': 'Checkout',
  '/orders': 'My Orders',
  '/profile': 'My Profile',
  '/fulfillment': 'Fulfillment Status',
  '/prescriptions': 'Prescription Queue',
  '/admin': 'Pharmacy Dashboard',
  '/inventory': 'Inventory Management',
  '/inventory/reports': 'Inventory Reports',
  '/pos': 'POS Billing',
  '/analytics': 'Sales Analytics',
  '/staff': 'Staff Management',
  '/suppliers': 'Supplier Management',
  '/supplier/dashboard': 'Supplier Dashboard',
  '/supplier/orders': 'Purchase Orders',
  '/superadmin': 'Super Admin Dashboard',
  '/superadmin/users': 'User Management',
  '/superadmin/pharmacies': 'Pharmacy Management',
  '/superadmin/audit': 'System Audit Log',
}

export default function TopBar() {
  const { role, setRole, userData } = useRole()
  const { selectedPharmacy } = useCart()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [showBranchModal, setShowBranchModal] = useState(false)
  const [notifCount, setNotifCount] = useState(0)

  // Fetch live notification count (active orders for customers, pending Rx for staff)
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch('/api/orders', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (!Array.isArray(data)) return
        if (role === 'customer') {
          // Count orders that are active (not delivered/cancelled/rejected)
          setNotifCount(data.filter(o => !['Delivered','Cancelled','Rejected'].includes(o.status)).length)
        } else {
          // Count pending/unverified orders for staff
          setNotifCount(data.filter(o => ['Pending','Confirmed'].includes(o.status)).length)
        }
      })
      .catch(() => {})
  }, [role, location.pathname])

  const title = pageTitles[location.pathname] ||
    (location.pathname.startsWith('/prescriptions/') ? 'Prescription Verification' : 'SPMIS')
  const currentRole = roles[role]

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
        <div className="live-indicator">
          <span className="live-dot" />
          <span className="live-label">Live</span>
        </div>

        {role === 'customer' && (
          <button 
            className="btn btn-ghost btn-sm" 
            style={{ marginLeft: 16, border: '1.5px solid var(--outline-variant)', borderRadius: 10, padding: '4px 12px', gap: 6 }}
            onClick={() => setShowBranchModal(true)}
          >
            <span className="material-icons" style={{ fontSize: 18, color: 'var(--primary)' }}>location_on</span>
            <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>
              {selectedPharmacy ? selectedPharmacy.name : 'Select Pharmacy Branch'}
            </span>
            <span className="material-icons" style={{ fontSize: 16 }}>expand_more</span>
          </button>
        )}
      </div>

      <div className="topbar-right">
        {/* Notifications */}
        <button
          className="topbar-icon-btn"
          onClick={() => navigate(role === 'customer' ? '/orders' : (role === 'pharmacist' || role === 'assistant' ? '/prescriptions' : '/fulfillment'))}
          title="View active orders"
          style={{ position: 'relative' }}
        >
          <span className="material-icons">notifications</span>
          {notifCount > 0 && (
            <span className="notif-badge">{notifCount > 9 ? '9+' : notifCount}</span>
          )}
        </button>

        {/* Role switcher — hidden for customers */}
        {role !== 'customer' && (
          <div className="role-switcher">
            <button
              className="role-switcher-btn"
              onClick={() => setOpen(o => !o)}
            >
              <div className="role-avatar">
                <span className="material-icons">{currentRole.icon}</span>
              </div>
              <div className="role-info">
                <span className="role-name">{userData?.name || currentRole.name}</span>
                <span className="role-label">{currentRole.label}</span>
              </div>
              <span className="material-icons role-chevron">expand_more</span>
            </button>

            {open && (
              <div className="role-dropdown">
                <div className="role-dropdown-header">Switch Role (Demo)</div>
                {Object.entries(roles).map(([key, r]) => (
                  <button
                    key={key}
                    className={`role-option ${role === key ? 'active' : ''}`}
                    onClick={() => { setRole(key, roles[key]); setOpen(false) }}
                  >
                    <span className="material-icons" style={{ fontSize: 18 }}>{r.icon}</span>
                    <span>{r.label}</span>
                    {role === key && <span className="material-icons" style={{ fontSize: 16, marginLeft: 'auto' }}>check</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Customer avatar — shown instead of role switcher */}
        {role === 'customer' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="role-avatar">
              <span className="material-icons">{currentRole.icon}</span>
            </div>
            <div className="role-info">
              <span className="role-name">{userData?.name || currentRole.name}</span>
              <span className="role-label">{currentRole.label}</span>
            </div>
          </div>
        )}
      </div>

      <PharmacySelectModal isOpen={showBranchModal} onClose={() => setShowBranchModal(false)} />
    </header>
  )
}
