import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { api, getApiError } from '../../api/client'
import EmptyState from '../../components/states/EmptyState'
import ErrorState from '../../components/states/ErrorState'
import LoadingState from '../../components/states/LoadingState'
import type { ApiError } from '../../types/api'
import type { WantedDetail as WantedDetailData } from '../../types/wanted'
import { FRUIT_LABEL, formatBerries, formatDate, STATUS_LABEL } from '../../utils/format'

// Cada resultado guarda de qué id es, para nunca mostrar el cartel de otro id
type Result =
  | { kind: 'error'; id: string; error: ApiError }
  | { kind: 'not-found'; id: string }
  | { kind: 'success'; id: string; data: WantedDetailData }

export default function WantedDetail() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [result, setResult] = useState<Result | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    api
      .get<WantedDetailData>(`/wanted/${encodeURIComponent(id)}`, { signal: controller.signal })
      .then(({ data }) => setResult({ kind: 'success', id, data }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        const error = getApiError(err)
        setResult(error.status === 404 ? { kind: 'not-found', id } : { kind: 'error', id, error })
      })
    // Si cambia el id antes de que llegue la respuesta, la anterior se cancela
    return () => controller.abort()
  }, [id, attempt])

  // Si no hay resultado o es de otro id, estamos cargando (estado derivado, sin efecto extra)
  const state = result && result.id === id ? result : null

  function retry() {
    setResult(null)
    setAttempt((n) => n + 1)
  }

  // Volver: si venimos del listado, atrás en el historial recupera su URL (filtros, página).
  // Si se abrió el link directo (no hay historial dentro de la app), vamos a /wanted.
  function goBack() {
    if (location.key !== 'default') navigate(-1)
    else navigate('/wanted')
  }

  return (
    <section aria-labelledby="wanted-title" className="space-y-4">
      <button
        type="button"
        onClick={goBack}
        className="rounded border px-3 py-1 hover:bg-slate-100 focus-visible:outline-2"
      >
        ← Volver a los carteles
      </button>

      {state === null && <LoadingState label="Desenrollando el cartel..." minHeight="min-h-96" />}

      {state?.kind === 'error' && <ErrorState error={state.error} onRetry={retry} minHeight="min-h-96" />}

      {state?.kind === 'not-found' && (
        <EmptyState title="Este cartel no existe" minHeight="min-h-96">
          <Link to="/wanted" className="underline">
            Ver todos los carteles
          </Link>
        </EmptyState>
      )}

      {state?.kind === 'success' && <Poster wanted={state.data} />}
    </section>
  )
}

function Poster({ wanted }: { wanted: WantedDetailData }) {
  return (
    <article className="mx-auto max-w-xl rounded-lg border-4 border-amber-900 bg-amber-100 p-6 text-amber-950 shadow-lg">
      <p className="text-center font-serif text-4xl font-black tracking-widest">WANTED</p>
      <p className="text-center text-sm uppercase tracking-wide">
        {STATUS_LABEL[wanted.status]} · amenaza {'★'.repeat(wanted.threatLevel)}
        <span className="sr-only"> ({wanted.threatLevel} de 5)</span>
      </p>

      <h1 id="wanted-title" className="mt-4 text-center text-3xl font-bold">
        {wanted.name}
      </h1>
      <p className="text-center italic">"{wanted.epithet}"</p>
      <p className="my-4 text-center font-mono text-3xl font-bold">{formatBerries(wanted.bounty)}</p>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="font-semibold">Tripulación</dt>
        <dd>{wanted.crew.name}</dd>
        <dt className="font-semibold">Puesto</dt>
        <dd>{wanted.role}</dd>
        <dt className="font-semibold">Fruta del diablo</dt>
        <dd>
          {wanted.devilFruit
            ? `${wanted.devilFruit.name} (${FRUIT_LABEL[wanted.devilFruit.type]})`
            : FRUIT_LABEL.NONE}
        </dd>
        <dt className="font-semibold">Edad / altura</dt>
        <dd>
          {wanted.age} años · {wanted.heightCm} cm
        </dd>
        <dt className="font-semibold">Visto por última vez</dt>
        <dd>
          {wanted.lastSeen.island} · {formatDate(wanted.lastSeen.seenAt)}
        </dd>
      </dl>

      <p className="mt-4 text-sm">{wanted.bio}</p>

      <h2 className="mt-4 font-semibold">Historial de recompensas</h2>
      <ol className="text-sm">
        {wanted.bountyHistory.map((entry) => (
          <li key={entry.issuedAt} className="flex justify-between border-b border-amber-300 py-1">
            <span>{formatDate(entry.issuedAt)}</span>
            <span className="font-mono">{formatBerries(entry.amount)}</span>
          </li>
        ))}
      </ol>
    </article>
  )
}
