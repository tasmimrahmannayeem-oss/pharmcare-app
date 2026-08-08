import { useState, useEffect, useRef } from 'react'
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
  const [showViewSwitch, setShowViewSwitch] = useState(false)
  const dropdownRef = useRef(null)

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

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
        setShowViewSwitch(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  const handleSignOut = () => {
    localStorage.clear()
    setOpen(false)
    navigate('/')
  }

  const handleSwitchAccount = () => {
    localStorage.clear()
    setOpen(false)
    navigate('/')
  }

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
            style={{ marginLeft: 16, border: '1.5px solid var(--outline-variant)', borderRadius: 10, padding: '4px 12px', gap: 6, alignItems: 'flex-start' }}
            onClick={() => setShowBranchModal(true)}
          >
            <span className="material-icons" style={{ fontSize: 18, color: 'var(--primary)', marginTop: 2 }}>location_on</span>
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
              <span style={{ fontWeight: 600, fontSize: '0.8125rem', lineHeight: 1.2 }}>
                {selectedPharmacy ? selectedPharmacy.name : 'Select Pharmacy Branch'}
              </span>
              {selectedPharmacy?.address && (
                <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', fontWeight: 400, lineHeight: 1.2, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedPharmacy.address}
                </span>
              )}
              {!selectedPharmacy && (
                <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', fontWeight: 400 }}>Tap to choose a nearby branch</span>
              )}
            </span>
            <span className="material-icons" style={{ fontSize: 16, marginTop: 2 }}>expand_more</span>
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

        {/* User account menu */}
        {role !== 'customer' && (
          <div className="role-switcher" ref={dropdownRef}>
            <button
              className="role-switcher-btn"
              onClick={() => { setOpen(o => !o); setShowViewSwitch(false) }}
              aria-haspopup="true"
              aria-expanded={open}
            >
              <div className="role-avatar" style={{ background: currentRole.color ? `linear-gradient(135deg, ${currentRole.color}, var(--primary-container))` : undefined }}>
                <span className="material-icons">{currentRole.icon}</span>
              </div>
              <div className="role-info">
                <span className="role-name">{userData?.name || currentRole.name}</span>
                <span className="role-label">{currentRole.label}</span>
              </div>
              <span className="material-icons role-chevron" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>expand_more</span>
            </button>

            {open && (
              <div className="role-dropdown">
                {/* User info header */}
                <div className="role-dropdown-user">
                  <div className="role-dropdown-avatar" style={{ background: currentRole.color ? `linear-gradient(135deg, ${currentRole.color}, var(--primary-container))` : undefined }}>
                    <span className="material-icons">{currentRole.icon}</span>
                  </div>
                  <div>
                    <div className="role-dropdown-username">{userData?.name || currentRole.name}</div>
                    <div className="role-dropdown-email">{userData?.email || currentRole.label}</div>
                  </div>
                </div>

                <div className="role-dropdown-divider" />

                {/* Role badge */}
                <div className="role-dropdown-badge-row">
                  <div className="role-dropdown-badge">
                    <span className="material-icons" style={{ fontSize: 14 }}>{currentRole.icon}</span>
                    {currentRole.label}
                  </div>
                </div>

                {/* Super Admin: switch view panel */}
                {role === 'superadmin' && (
                  <>
                    <div className="role-dropdown-divider" />
                    <button
                      className="role-option"
                      onClick={() => setShowViewSwitch(v => !v)}
                    >
                      <span className="material-icons" style={{ fontSize: 18 }}>swap_horiz</span>
                      <span>Switch View</span>
                      <span className="material-icons" style={{ fontSize: 16, marginLeft: 'auto', opacity: 0.5 }}>
                        {showViewSwitch ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                    {showViewSwitch && (
                      <div className="role-view-panel">
                        {Object.entries(roles)
                          .filter(([key]) => key !== 'customer')
                          .map(([key, r]) => (
                            <button
                              key={key}
                              className={`role-view-option ${role === key ? 'active' : ''}`}
                              onClick={() => {
                                setRole(key)
                                setOpen(false)
                                setShowViewSwitch(false)
                                const dest = {
                                  superadmin: '/superadmin', owner: '/admin',
                                  pharmacist: '/prescriptions', assistant: '/pos',
                                  supplier: '/supplier/dashboard'
                                }
                                navigate(dest[key] || '/superadmin')
                              }}
                            >
                              <span className="material-icons" style={{ fontSize: 16 }}>{r.icon}</span>
                              <span>{r.label}</span>
                              {role === key && <span className="material-icons" style={{ fontSize: 14, marginLeft: 'auto', color: 'var(--primary)' }}>check_circle</span>}
                            </button>
                          ))}
                      </div>
                    )}
                  </>
                )}

                <div className="role-dropdown-divider" />

                {/* Switch account */}
                <button className="role-option" onClick={handleSwitchAccount}>
                  <span className="material-icons" style={{ fontSize: 18 }}>manage_accounts</span>
                  <span>Switch Account</span>
                </button>

                {/* Sign out */}
                <button className="role-option role-option-danger" onClick={handleSignOut}>
                  <span className="material-icons" style={{ fontSize: 18 }}>logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <PharmacySelectModal isOpen={showBranchModal} onClose={() => setShowBranchModal(false)} />
    </header>
  )
}
