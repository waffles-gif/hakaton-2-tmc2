// Tipos copiados del contrato de Swagger (/docs). No usar `any` para respuestas de la API.

export interface User {
  id: string
  name: string
  email: string
}

export interface Team {
  code: string
  name: string
}

export interface LoginResponse {
  token: string
  tokenType: 'Bearer'
  expiresAt: string
  user: User
  team: Team
}

export interface MeResponse {
  user: User
  team: Team
  expiresAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  teamName: string
  email: string
  password: string
}

export interface ApiErrorDetail {
  field: string
  message: string
}

// Formato único de error de toda la API
export interface ApiError {
  status: number
  code: string
  message: string
  traceId: string
  details?: ApiErrorDetail[]
  retryAfterSeconds?: number
}

export type LogPoseStatus = 'LOCKED' | 'UNLOCKED'

export interface LogPose {
  status: LogPoseStatus
  grandLineUnlocked: boolean
  unlockedAt: string | null
  message: string
}
