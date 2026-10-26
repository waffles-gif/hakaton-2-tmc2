import { createBrowserRouter, Navigate } from 'react-router-dom'
import PrivateRoute from './auth/PrivateRoute'
import PublicOnlyRoute from './auth/PublicOnlyRoute'
import Layout from './components/Layout'
import Placeholder from './components/Placeholder'

export const router = createBrowserRouter([
  // Públicas: solo si NO hay sesión
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: '/login', element: <Placeholder name="Login" /> },
      { path: '/register', element: <Placeholder name="Registro" /> },
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
          { path: '/dashboard', element: <Placeholder name="Dashboard" /> },
          { path: '/wanted', element: <Placeholder name="Se Busca" /> },
          { path: '/wanted/:id', element: <Placeholder name="Detalle del cartel" /> },
          { path: '/news', element: <Placeholder name="Noticias" /> },
          { path: '/news/:id', element: <Placeholder name="Detalle de noticia" /> },
          { path: '/sagas', element: <Placeholder name="Sagas" /> },
          { path: '/sagas/:id', element: <Placeholder name="Historia de la saga" /> },
        ],
      },
    ],
  },
  // 404
  { path: '*', element: <Placeholder name="404 - Página no encontrada" /> },
])
