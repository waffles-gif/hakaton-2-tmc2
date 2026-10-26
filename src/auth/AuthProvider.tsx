import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { api, setOnUnauthorized, TOKEN_KEY } from '../api/client'
import type { LoginRequest, LoginResponse, MeResponse, RegisterRequest, Team, User } from '../types/api'
import { AuthContext, type AuthStatus } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  // Si hay token guardado arrancamos en "checking" para no mostrar el login mientras se verifica
  const [status, setStatus] = useState<AuthStatus>(() =>
    localStorage.getItem(TOKEN_KEY) ? 'checking' : 'anonymous',
  )
  const [user, setUser] = useState<User | null>(null)
  const [team, setTeam] = useState<Team | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
    setTeam(null)
    setExpiresAt(null)
    setStatus('anonymous')
  }, [])

  // Si la API responde 401 en cualquier request, cerramos sesión
  useEffect(() => {
    setOnUnauthorized(logout)
  }, [logout])

  // Restaurar sesión al recargar: validamos el token guardado con /auth/me
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return
    const controller = new AbortController()
    api
      .get<MeResponse>('/auth/me', { signal: controller.signal })
      .then(({ data }) => {
        setUser(data.user)
        setTeam(data.team)
        setExpiresAt(data.expiresAt)
        setStatus('authenticated')
      })
      .catch(() => {
        if (!controller.signal.aborted) logout()
      })
    return () => controller.abort()
  }, [logout])

  // Cuando el token vence, volvemos al login aunque el usuario no haga nada
  useEffect(() => {
    if (!expiresAt) return
    const timer = setTimeout(logout, new Date(expiresAt).getTime() - Date.now())
    return () => clearTimeout(timer)
  }, [expiresAt, logout])

  const saveSession = (data: LoginResponse) => {
    localStorage.setItem(TOKEN_KEY, data.token)
    setUser(data.user)
    setTeam(data.team)
    setExpiresAt(data.expiresAt)
    setStatus('authenticated')
  }

  const login = async (email: string, password: string) => {
    const body: LoginRequest = { email, password }
    const { data } = await api.post<LoginResponse>('/auth/login', body)
    saveSession(data)
  }

  // Registro: crea la tripulación y entra directo con la sesión iniciada
  const register = async (teamName: string, email: string, password: string) => {
    const body: RegisterRequest = { teamName, email, password }
    const { data } = await api.post<LoginResponse>('/auth/register', body)
    saveSession(data)
  }

  return (
    <AuthContext.Provider value={{ status, user, team, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
