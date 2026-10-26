import { createContext } from 'react'
import type { Team, User } from '../types/api'

// checking = hay token guardado y estamos verificándolo con /auth/me
export type AuthStatus = 'checking' | 'authenticated' | 'anonymous'

export interface AuthValue {
  status: AuthStatus
  user: User | null
  team: Team | null
  login: (email: string, password: string) => Promise<void>
  register: (teamName: string, email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthValue | null>(null)
