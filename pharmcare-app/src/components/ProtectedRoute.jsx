import { Navigate, Outlet } from 'react-router-dom'
import { useRole } from '../context/RoleContext'

export default function ProtectedRoute({ allowedRoles }) {
  const { role } = useRole()

  if (!role || (allowedRoles && !allowedRoles.includes(role))) {
    // If the user's role is not in the allowed list, redirect to login
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
