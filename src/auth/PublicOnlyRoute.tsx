import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { RedirectState } from './PrivateRoute'
import { useAuth } from './useAuth'

// Login y registro: si ya hay sesión, no tiene sentido mostrarlos
export default function PublicOnlyRoute() {
  const { status } = useAuth()
  const location = useLocation()
  // Si PrivateRoute nos mandó aquí, guardó en el state la ruta a la que quería ir
  const from = (location.state as RedirectState | null)?.from ?? '/dashboard'

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status">
        Verificando sesión...
      </div>
    )
  }

  // Al iniciar sesión volvemos exactamente a donde quería ir (o al dashboard)
  if (status === 'authenticated') return <Navigate to={from} replace />

  return <Outlet />
}
