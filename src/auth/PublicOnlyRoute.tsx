import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'

// Login y registro: si ya hay sesión, no tiene sentido mostrarlos
export default function PublicOnlyRoute() {
  const { status } = useAuth()

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status">
        Verificando sesión...
      </div>
    )
  }

  if (status === 'authenticated') return <Navigate to="/dashboard" replace />

  return <Outlet />
}
