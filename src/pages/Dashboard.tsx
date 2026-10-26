import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, getApiError } from '../api/client'
import EmptyState from '../components/states/EmptyState'
import ErrorState from '../components/states/ErrorState'
import LoadingState from '../components/states/LoadingState'
import type { ApiError, LogPose } from '../types/api'
import type { DashboardSummary } from '../types/dashboard'
import { formatBerries, formatDate, STATUS_LABEL } from '../utils/format'

interface DashboardData {
  summary: DashboardSummary
  logPose: LogPose
}

// Un solo estado para los 3 casos: no puede estar cargando y con error a la vez
type State =
  | { kind: 'loading' }
  | { kind: 'error'; error: ApiError }
  | { kind: 'success'; data: DashboardData }

export default function Dashboard() {
  const [state, setState] = useState<State>({ kind: 'loading' })
  // Cambiar este número vuelve a ejecutar el efecto (botón Reintentar)
  const [attempt, setAttempt] = useState(0)

  function retry() {
    setState({ kind: 'loading' })
    setAttempt((n) => n + 1)
  }

  useEffect(() => {
    const controller = new AbortController()
    // Las dos requests en paralelo; si cualquiera falla, mostramos error
    Promise.all([
      api.get<DashboardSummary>('/dashboard/summary', { signal: controller.signal }),
      api.get<LogPose>('/log-pose', { signal: controller.signal }),
    ])
      .then(([summary, logPose]) => {
        setState({ kind: 'success', data: { summary: summary.data, logPose: logPose.data } })
      })
      .catch((err: unknown) => {
        // Si se canceló (desmontaje o reintento) no tocamos el estado
        if (!controller.signal.aborted) setState({ kind: 'error', error: getApiError(err) })
      })
    // Cleanup: al desmontar cancela las requests en vuelo
    return () => controller.abort()
  }, [attempt])

  return (
    <section aria-labelledby="dashboard-title" className="space-y-6">
      <h1 id="dashboard-title" className="text-2xl font-bold">
        Cubierta principal
      </h1>

      {state.kind === 'loading' && <LoadingState label="Leyendo la bitácora..." minHeight="min-h-96" />}

      {state.kind === 'error' && (
        <ErrorState error={state.error} onRetry={retry} minHeight="min-h-96" />
      )}

      {state.kind === 'success' && <DashboardContent data={state.data} />}
    </section>
  )
}

function DashboardContent({ data }: { data: DashboardData }) {
  const { summary, logPose } = data
  const unlocked = logPose.grandLineUnlocked

  return (
    <div className="space-y-6">
      {/* Estado del Log Pose */}
      <div
        className={`rounded-lg border p-4 ${unlocked ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'}`}
      >
        <p className="font-semibold">
          <span aria-hidden="true">🧭 </span>
          Log Pose: {unlocked ? 'Grand Line desbloqueado' : 'Bloqueado'}
        </p>
        <p className="text-sm text-slate-700">{logPose.message}</p>
        {logPose.unlockedAt && (
          <p className="text-xs text-slate-500">Desde {formatDate(logPose.unlockedAt)}</p>
        )}
      </div>

      {/* Estado vacío: el workspace no tiene carteles */}
      {summary.wanted.total === 0 ? (
        <EmptyState title="El mar está en calma">
          <p className="text-sm">Tu tripulación todavía no tiene carteles de "Se Busca".</p>
        </EmptyState>
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Kpi label="Carteles" value={String(summary.wanted.total)} />
            <Kpi label="Recompensa total" value={formatBerries(summary.wanted.totalBounty)} />
            <Kpi label="Recompensa promedio" value={formatBerries(summary.wanted.averageBounty)} />
            <Kpi label="Tripulaciones" value={String(summary.crews.total)} />
            <Kpi label={STATUS_LABEL.AT_LARGE} value={String(summary.wanted.byStatus.AT_LARGE)} />
            <Kpi label={STATUS_LABEL.CAPTURED} value={String(summary.wanted.byStatus.CAPTURED)} />
            <Kpi label={STATUS_LABEL.MISSING} value={String(summary.wanted.byStatus.MISSING)} />
            <Kpi
              label="Con fruta del diablo"
              value={String(summary.wanted.total - summary.wanted.byFruit.NONE)}
            />
          </dl>

          {summary.crews.mostWanted && (
            <div className="rounded-lg border bg-white p-4">
              <h2 className="font-semibold">Tripulación más buscada</h2>
              <p className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: summary.crews.mostWanted.jollyRogerColor }}
                />
                {summary.crews.mostWanted.name} · barco {summary.crews.mostWanted.shipName} ·{' '}
                {formatBerries(summary.crews.mostWanted.totalBounty)}
              </p>
            </div>
          )}

          <div className="rounded-lg border bg-white p-4">
            <h2 className="mb-2 font-semibold">Recompensas más altas</h2>
            <ol className="divide-y">
              {summary.topBounties.map((wanted) => (
                <li key={wanted.id}>
                  <Link
                    to={`/wanted/${wanted.id}`}
                    className="flex justify-between gap-4 rounded px-2 py-2 hover:bg-slate-50 focus-visible:outline-2"
                  >
                    <span>
                      {wanted.name} <span className="text-slate-500">"{wanted.epithet}"</span>
                    </span>
                    <span className="font-mono">{formatBerries(wanted.bounty)}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}

      <p className="text-xs text-slate-500">Actualizado: {formatDate(summary.generatedAt)}</p>
    </div>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-xl font-bold">{value}</dd>
    </div>
  )
}
