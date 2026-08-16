import { Navigate, Outlet } from 'react-router-dom'
import { useRole, normalizeRole } from '../context/RoleContext'

export default function ProtectedRoute({ allowedRoles }) {
  const { role, userData } = useRole()
  const token = localStorage.getItem('token')

  const currentRole = normalizeRole(role || userData?.role || localStorage.getItem('userRole'))

  // If token is missing, user is logged out -> redirect to login
  if (!token) {
    return <Navigate to="/" replace />
  }

  // Check if role is authorized
  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
