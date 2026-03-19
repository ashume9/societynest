import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface Props {
  children: React.ReactNode
  role?: 'user' | 'partner' | 'admin'
}

export default function ProtectedRoute({ children, role }: Props) {
  const { session, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner spinner-dark" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (role && session.role !== role) {
    if (session.role === 'admin') return <Navigate to="/admin" replace />
    if (session.role === 'partner') return <Navigate to="/partner/dashboard" replace />
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
