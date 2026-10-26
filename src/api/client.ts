import axios from 'axios'
import type { ApiError } from '../types/api'

export const TOKEN_KEY = 'logpose_token'

// La URL base sale del .env, nunca escrita en el código
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

// Antes de cada request: si hay token, lo mandamos en el header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// El AuthProvider registra aquí qué hacer cuando la sesión deja de ser válida
let onUnauthorized: () => void = () => {}

export function setOnUnauthorized(handler: () => void) {
  onUnauthorized = handler
}

// Después de cada respuesta: un 401 con token enviado = sesión vencida o inválida → logout
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      error.config?.headers?.Authorization
    ) {
      onUnauthorized()
    }
    return Promise.reject(error)
  },
)

// Convierte cualquier error en el formato de error de la API (para mostrar mensajes)
export function getApiError(error: unknown): ApiError {
  if (axios.isAxiosError<ApiError>(error) && error.response?.data?.code) {
    return error.response.data
  }
  return {
    status: 0,
    code: 'NETWORK_ERROR',
    message: 'No se pudo conectar con el servidor. Intenta de nuevo.',
    traceId: '',
  }
}

// Errores de validación por campo: { email: '...', teamName: '...' }
export function getFieldErrors(error: unknown): Record<string, string> {
  const apiError = getApiError(error)
  const fields: Record<string, string> = {}
  for (const detail of apiError.details ?? []) fields[detail.field] = detail.message
  if (apiError.code === 'EMAIL_ALREADY_REGISTERED') fields.email = apiError.message
  if (apiError.code === 'TEAM_NAME_TAKEN') fields.teamName = apiError.message
  return fields
}
