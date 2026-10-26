import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getApiError } from '../api/client'
import { useAuth } from '../auth/useAuth'

export default function Login() {
  const { login } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return // evita doble envío
    setSubmitting(true)
    setError(null)
    try {
      // Al guardar la sesión, PublicOnlyRoute nos redirige a donde quería ir el usuario
      await login(email.trim(), password)
    } catch (err) {
      setError(getApiError(err).message)
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-sm space-y-4 rounded-lg bg-white p-6 shadow-lg"
        aria-labelledby="login-title"
      >
        <h1 id="login-title" className="text-2xl font-bold">
          Zarpar
        </h1>
        <p className="text-sm text-slate-600">Inicia sesión con la cuenta de tu tripulación.</p>

        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border px-3 py-2 focus-visible:outline-2"
            required
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border px-3 py-2 focus-visible:outline-2"
            required
          />
        </div>

        {error && (
          <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
        >
          {submitting ? 'Zarpando...' : 'Iniciar sesión'}
        </button>

        <p className="text-center text-sm">
          ¿Tripulación nueva?{' '}
          {/* Pasamos el state para no perder a dónde quería ir el usuario */}
          <Link to="/register" state={location.state} className="font-semibold underline">
            Regístrala
          </Link>
        </p>
      </form>
    </main>
  )
}
