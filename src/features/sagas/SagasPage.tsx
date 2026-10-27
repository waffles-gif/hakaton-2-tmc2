import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, getApiError } from '../../api/client'
import EmptyState from '../../components/states/EmptyState'
import ErrorState from '../../components/states/ErrorState'
import LoadingState from '../../components/states/LoadingState'
import type { ApiError } from '../../types/api'
import { sagaTransitionName, type SagaSummary } from '../../types/saga'
import './view-transitions.css'

type State =
  | { kind: 'loading' }
  | { kind: 'error'; error: ApiError }
  | { kind: 'success'; sagas: SagaSummary[] }

const distance = new Intl.NumberFormat('es-PE')

export default function SagasPage() {
  const [state, setState] = useState<State>({ kind: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    api
      .get<SagaSummary[]>('/sagas', { signal: controller.signal })
      .then(({ data }) => setState({ kind: 'success', sagas: data }))
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setState({ kind: 'error', error: getApiError(err) })
      })
    return () => controller.abort()
  }, [attempt])

  function retry() {
    setState({ kind: 'loading' })
    setAttempt((n) => n + 1)
  }

  return (
    <section aria-labelledby="sagas-title" className="space-y-6">
      <header>
        <h1 id="sagas-title" className="text-2xl font-bold">
          Poneglyphs: las grandes sagas
        </h1>
        <p className="text-slate-600">Elige una saga para recorrer su historia por el Grand Line.</p>
      </header>

      {state.kind === 'loading' && <LoadingState label="Descifrando los Poneglyphs..." minHeight="min-h-96" />}

      {/* 423: sin Log Pose la API del Grand Line está cerrada */}
      {state.kind === 'error' && state.error.code === 'LOG_POSE_REQUIRED' && (
        <EmptyState title="Sin Log Pose no hay Grand Line" minHeight="min-h-96">
          <p className="text-sm">{state.error.message}</p>
        </EmptyState>
      )}

      {state.kind === 'error' && state.error.code !== 'LOG_POSE_REQUIRED' && (
        <ErrorState error={state.error} onRetry={retry} minHeight="min-h-96" />
      )}

      {state.kind === 'success' && state.sagas.length === 0 && (
        <EmptyState title="Todavía no hay sagas que contar" minHeight="min-h-96" />
      )}

      {state.kind === 'success' && state.sagas.length > 0 && (
        <ol className="grid gap-4 md:grid-cols-2">
          {state.sagas.map((saga) => (
            <li key={saga.id}>
              {/* viewTransition: React Router usa document.startViewTransition si existe; si no, navega normal */}
              <Link
                to={`/sagas/${saga.id}`}
                viewTransition
                className="block h-full rounded-lg p-5 shadow transition-transform focus-visible:outline-4 focus-visible:outline-offset-2 motion-safe:hover:-translate-y-1"
                style={{
                  backgroundColor: saga.palette.background,
                  color: saga.palette.text,
                  outlineColor: saga.palette.accent,
                }}
              >
                {/* Mismo view-transition-name que el encabezado de la historia: el navegador anima de uno a otro */}
                <div style={{ viewTransitionName: sagaTransitionName(saga.id) }}>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: saga.palette.accent }}>
                    Saga {saga.order}
                  </p>
                  <h2 className="text-xl font-bold" style={{ color: saga.palette.primary }}>
                    {saga.title}
                  </h2>
                  <p className="italic">{saga.subtitle}</p>
                </div>
                <p className="mt-3 text-sm">{saga.synopsis}</p>
                <p className="mt-3 text-sm opacity-80">
                  {saga.firstIsland} → {saga.lastIsland} · {saga.stageCount} etapas ·{' '}
                  {distance.format(saga.totalDistanceNm)} millas náuticas
                </p>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
