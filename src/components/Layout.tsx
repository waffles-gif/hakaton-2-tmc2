import { NavLink, Outlet, ScrollRestoration } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/wanted', label: 'Se Busca' },
  { to: '/news', label: 'Noticias' },
  { to: '/sagas', label: 'Sagas' },
]

export default function Layout() {
  const { team, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <nav className="mx-auto flex max-w-6xl items-center gap-4 p-4">
          <span className="font-bold">Log Pose Console</span>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded px-2 py-1 focus-visible:outline-2 ${isActive ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <span className="ml-auto text-sm text-slate-600">
            {team ? `${team.name} · ${team.code}` : ''}
          </span>
          <button
            type="button"
            onClick={logout}
            className="rounded border px-3 py-1 hover:bg-slate-100 focus-visible:outline-2"
          >
            Cerrar sesión
          </button>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl p-6">
        <Outlet />
      </main>
      {/* Al volver atrás (ej. del detalle al listado) recupera la posición del scroll */}
      <ScrollRestoration />
    </div>
  )
}
