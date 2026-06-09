import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'

const roleHome = {
  pm: '/dashboard',
  tenant: '/my/tenant',
  owner: '/my/owner',
}

export default function ProtectedRoute({ children, requireRole }) {
  const { user, session, loading } = useAuth()

  if (loading) {
    return <div className="loading-screen">Loading...</div>
  }

  if (!user || !session) {
    return <Navigate to="/" replace />
  }

  if (requireRole && session.role !== requireRole) {
    return <Navigate to={roleHome[session.role] || '/'} replace />
  }

  return children
}
