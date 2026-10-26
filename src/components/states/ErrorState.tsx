import type { ApiError } from '../../types/api'

// Error con reintento: muestra el mensaje de la API y un botón que vuelve a pedir los datos
export default function ErrorState({
  error,
  onRetry,
  minHeight = 'min-h-48',
}: {
  error: ApiError
  onRetry: () => void
  minHeight?: string
}) {
  // 429: la API dice cuántos segundos esperar
  const wait = error.retryAfterSeconds ? ` Espera ${error.retryAfterSeconds} s antes de reintentar.` : ''

  return (
    <div
      role="alert"
      className={`flex ${minHeight} flex-col items-center justify-center gap-3 rounded border border-red-200 bg-red-50 p-6 text-center text-red-800`}
    >
      <p className="font-semibold">El Log Pose perdió el rumbo</p>
      <p className="text-sm">
        {error.message}
        {wait}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded bg-red-700 px-4 py-2 text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Reintentar
      </button>
    </div>
  )
}
