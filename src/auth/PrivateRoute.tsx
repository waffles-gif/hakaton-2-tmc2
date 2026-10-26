import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

export interface RedirectState {
  from: string
}

export default function PrivateRoute() {
  const { status } = useAuth()
  const location = useLocation()

  // Mientras /auth/me responde no mostramos el login
  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status">
        Verificando sesión...
      </div>
    )
  }

  // Sin sesión: al login, guardando a dónde quería ir (ruta + filtros de la URL)
  if (status === 'anonymous') {
    const state: RedirectState = { from: location.pathname + location.search }
    return <Navigate to="/login" replace state={state} />
  }

  return <Outlet />
}
