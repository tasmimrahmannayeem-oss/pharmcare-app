import { Navigate, Outlet } from 'react-router-dom'
import { useRole, normalizeRole } from '../context/RoleContext'

export default function ProtectedRoute({ allowedRoles }) {
  const { role, userData } = useRole()
  const rawToken = localStorage.getItem('token')
  const hasToken = !!(rawToken && rawToken !== 'undefined' && rawToken !== 'null')

  const currentRole = normalizeRole(role || userData?.role || localStorage.getItem('userRole'))

  // If no valid token present, redirect to Login
  if (!hasToken) {
    return <Navigate to="/" replace />
  }

  // If role is specified but current user is not authorized, redirect to their role's dashboard
  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    const defaultRoute = currentRole === 'superadmin' ? '/superadmin' :
                         currentRole === 'owner' ? '/admin' :
                         currentRole === 'pharmacist' ? '/prescriptions' :
                         currentRole === 'assistant' ? '/pos' :
                         currentRole === 'supplier' ? '/supplier/dashboard' : '/home'
    
    // Prevent self-looping if already on default route
    if (window.location.pathname === defaultRoute) {
      return <Outlet />
    }
    return <Navigate to={defaultRoute} replace />
  }

  return <Outlet />
}
