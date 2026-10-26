import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getApiError, getFieldErrors } from '../api/client'
import { useAuth } from '../auth/useAuth'

type Field = 'teamName' | 'email' | 'password'

const FIELDS: { name: Field; label: string; type: string; autoComplete: string }[] = [
  { name: 'teamName', label: 'Nombre de la tripulación', type: 'text', autoComplete: 'organization' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  { name: 'password', label: 'Contraseña (8 a 72 caracteres)', type: 'password', autoComplete: 'new-password' },
]

export default function Register() {
  const { register } = useAuth()
  const location = useLocation()
  const [values, setValues] = useState<Record<Field, string>>({ teamName: '', email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setFieldErrors({})
    setFormError(null)
    try {
      // Crea la tripulación y guarda la sesión: entra directo a la app
      await register(values.teamName.trim(), values.email.trim(), values.password)
    } catch (err) {
      // Errores por campo (400 con details, 409 email o nombre repetido) van junto a su input
      const fields = getFieldErrors(err)
      setFieldErrors(fields)
      // Si el error no es de un campo (429, 403, red...), se muestra arriba del botón
      if (Object.keys(fields).length === 0) setFormError(getApiError(err).message)
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-sm space-y-4 rounded-lg bg-white p-6 shadow-lg"
        aria-labelledby="register-title"
      >
        <h1 id="register-title" className="text-2xl font-bold">
          Registra tu tripulación
        </h1>

        {FIELDS.map((field) => {
          const error = fieldErrors[field.name]
          return (
            <div key={field.name} className="space-y-1">
              <label htmlFor={field.name} className="block text-sm font-medium">
                {field.label}
              </label>
              <input
                id={field.name}
                type={field.type}
                autoComplete={field.autoComplete}
                value={values[field.name]}
                onChange={(e) => setValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${field.name}-error` : undefined}
                className={`w-full rounded border px-3 py-2 focus-visible:outline-2 ${error ? 'border-red-500' : ''}`}
              />
              {error && (
                <p id={`${field.name}-error`} className="text-sm text-red-700">
                  {error}
                </p>
              )}
            </div>
          )
        })}

        {formError && (
          <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
        >
          {submitting ? 'Registrando...' : 'Crear tripulación'}
        </button>

        <p className="text-center text-sm">
          ¿Ya tienen cuenta?{' '}
          <Link to="/login" state={location.state} className="font-semibold underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </main>
  )
}
