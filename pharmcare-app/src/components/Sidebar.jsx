import { NavLink, useNavigate } from 'react-router-dom'
import { useRole } from '../context/RoleContext'
import './Sidebar.css'

const navConfig = {
  customer: [
    { icon: 'home', label: 'Home', to: '/home' },
    { icon: 'search', label: 'Medicine Search', to: '/search' },
    { icon: 'category', label: 'Product Catalogue', to: '/catalogue' },
    { icon: 'shopping_cart', label: 'Checkout', to: '/checkout' },
    { icon: 'local_shipping', label: 'Order Tracking', to: '/orders' },
    { icon: 'person', label: 'My Profile', to: '/profile' },
  ],
  pharmacist: [
    { icon: 'description', label: 'Prescription Queue', to: '/prescriptions' },
    { icon: 'inventory', label: 'Fulfillment Status', to: '/fulfillment' },
    { icon: 'search', label: 'Medicine Search', to: '/search' },
    { icon: 'psychology', label: 'AI Smart Insights', to: '/smart-insights' },
  ],
  assistant: [
    { icon: 'point_of_sale', label: 'POS Billing', to: '/pos' },
    { icon: 'inventory', label: 'Fulfillment Status', to: '/fulfillment' },
    { icon: 'search', label: 'Medicine Search', to: '/search' },
    { icon: 'psychology', label: 'AI Smart Insights', to: '/smart-insights' },
  ],
  owner: [
    { icon: 'dashboard', label: 'Admin Dashboard', to: '/admin' },
    { icon: 'inventory_2', label: 'Inventory', to: '/inventory' },
    { icon: 'bar_chart', label: 'Inventory Reports', to: '/inventory/reports' },
    { icon: 'point_of_sale', label: 'POS Billing', to: '/pos' },
    { icon: 'analytics', label: 'Sales Analytics', to: '/analytics' },
    { icon: 'groups', label: 'Staff Management', to: '/staff' },
    { icon: 'local_shipping', label: 'Supplier Management', to: '/suppliers' },
    { icon: 'description', label: 'Prescription Queue', to: '/prescriptions' },
    { icon: 'inventory', label: 'Fulfillment Status', to: '/fulfillment' },
  ],
  supplier: [
    { icon: 'dashboard', label: 'Supplier Dashboard', to: '/supplier/dashboard' },
    { icon: 'receipt_long', label: 'Purchase Orders', to: '/supplier/orders' },
  ],
  superadmin: [
    { icon: 'admin_panel_settings', label: 'Super Dashboard', to: '/superadmin' },
    { icon: 'manage_accounts', label: 'User Management', to: '/superadmin/users' },
    { icon: 'business', label: 'Pharmacy Management', to: '/superadmin/pharmacies' },
    { icon: 'history', label: 'System Audit Log', to: '/superadmin/audit' },
  ],
}

export default function Sidebar({ isCollapsed, toggleCollapse, isMobileOpen, closeMobile }) {
  const { role, roles } = useRole()
  const navigate = useNavigate()
  const items = navConfig[role] || navConfig.customer

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <span className="material-icons">medication</span>
        </div>
        {!isCollapsed && (
          <div>
            <div className="sidebar-logo-name">SPMIS</div>
            <div className="sidebar-logo-tag">Pharmacy System</div>
          </div>
        )}

        {/* Desktop Collapse Toggle */}
        <button 
          className="btn-ghost sidebar-toggle-btn desktop-only" 
          style={{ marginLeft: isCollapsed ? 0 : 'auto', padding: isCollapsed ? 0 : 4, color: 'var(--on-surface-variant)' }} 
          onClick={toggleCollapse}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="material-icons">{isCollapsed ? 'menu' : 'menu_open'}</span>
        </button>

        {/* Mobile Close Button */}
        <button 
          className="btn-ghost mobile-close-btn" 
          onClick={closeMobile}
          title="Close Menu"
        >
          <span className="material-icons">close</span>
        </button>
      </div>

      {/* Role chip */}
      {!isCollapsed ? (
        <div className="sidebar-role-chip">
          <span className="material-icons" style={{ fontSize: 16 }}>{roles[role]?.icon || 'person'}</span>
          <span>{roles[role]?.label || 'User'}</span>
        </div>
      ) : (
        <div className="sidebar-role-chip collapsed" title={roles[role]?.label}>
          <span className="material-icons" style={{ fontSize: 18 }}>{roles[role]?.icon || 'person'}</span>
        </div>
      )}

      {/* Nav */}
      <nav className="sidebar-nav">
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            title={isCollapsed ? item.label : undefined}
            onClick={closeMobile}
          >
            <span className="material-icons sidebar-link-icon">{item.icon}</span>
            {!isCollapsed && <span className="sidebar-link-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: Logout */}
      <div className="sidebar-bottom">
        <button 
          className="sidebar-link w-full" 
          onClick={() => { closeMobile(); localStorage.clear(); navigate('/'); }}
          title={isCollapsed ? "Sign Out" : undefined}
          style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
        >
          <span className="material-icons sidebar-link-icon">logout</span>
          {!isCollapsed && <span className="sidebar-link-label">Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}
