import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, profile } = useAuthStore()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check role from profile (backend user data)
  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
