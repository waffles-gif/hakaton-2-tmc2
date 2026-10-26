import { createBrowserRouter, Navigate } from 'react-router-dom'
import PrivateRoute from './auth/PrivateRoute'
import PublicOnlyRoute from './auth/PublicOnlyRoute'
import Layout from './components/Layout'
import Placeholder from './components/Placeholder'
import WantedDetail from './features/wanted/WantedDetail'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Register from './pages/Register'

export const router = createBrowserRouter([
  // Públicas: solo si NO hay sesión
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
    ],
  },
  // Privadas: requieren sesión
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/wanted', element: <Placeholder name="Se Busca" /> },
          { path: '/wanted/:id', element: <WantedDetail /> },
          { path: '/news', element: <Placeholder name="Noticias" /> },
          { path: '/news/:id', element: <Placeholder name="Detalle de noticia" /> },
          { path: '/sagas', element: <Placeholder name="Sagas" /> },
          { path: '/sagas/:id', element: <Placeholder name="Historia de la saga" /> },
        ],
      },
    ],
  },
  // 404
  { path: '*', element: <NotFound /> },
])
