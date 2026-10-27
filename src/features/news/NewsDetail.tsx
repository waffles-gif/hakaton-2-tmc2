import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { api, getApiError } from '../../api/client'
import EmptyState from '../../components/states/EmptyState'
import ErrorState from '../../components/states/ErrorState'
import LoadingState from '../../components/states/LoadingState'
import type { ApiError } from '../../types/api'
import { formatDate } from '../../utils/format'
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TYPE_LABELS,
  type NewsItem,
  type NewsOutletContext,
  type NewsStatus,
} from './feed/types'

// GET /news/{id} y PATCH devuelven la noticia del feed más su cuerpo
type NewsDetailData = NewsItem & { body: string[] }

// Solo un RUMOR se puede verificar, y solo a uno de estos dos estados
type NewsVerification = 'CONFIRMED' | 'DEBUNKED'

const STATUS_STYLE: Record<NewsStatus, string> = {
  RUMOR: 'bg-amber-100 text-amber-900',
  CONFIRMED: 'bg-emerald-100 text-emerald-900',
  DEBUNKED: 'bg-slate-200 text-slate-800',
}

// Resultado de cargar el detalle; guarda de qué id es para no mostrar otra noticia
type Result =
  | { kind: 'error'; id: string; error: ApiError }
  | { kind: 'not-found'; id: string }
  | { kind: 'success'; id: string; data: NewsDetailData }

// Estado de la verificación (PATCH). No es optimista: la UI cambia solo cuando el servidor responde.
type Verify =
  | { kind: 'idle' }
  | { kind: 'sending'; status: NewsVerification }
  | { kind: 'done'; message: string }
  | { kind: 'failed'; status: NewsVerification; error: ApiError }

// 409 NEWS_ALREADY_VERIFIED trae la noticia actual en `current`
type VerifyError = ApiError & { current?: NewsDetailData }

export default function NewsDetail() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  // Si el feed renderiza este detalle con <Outlet context>, recibimos cómo avisarle los cambios.
  // Si se abrió la URL directa sin feed debajo, es undefined.
  const feed = useOutletContext<NewsOutletContext | undefined>()
  const [result, setResult] = useState<Result | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [verify, setVerify] = useState<Verify>({ kind: 'idle' })
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    api
      .get<NewsDetailData>(`/news/${encodeURIComponent(id)}`, { signal: controller.signal })
      .then(({ data }) => setResult({ kind: 'success', id, data }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        const error = getApiError(err)
        setResult(error.status === 404 ? { kind: 'not-found', id } : { kind: 'error', id, error })
      })
    return () => controller.abort()
  }, [id, attempt])

  // Al abrir, el foco va al diálogo para que el teclado y el lector de pantalla empiecen aquí
  useEffect(() => {
    dialogRef.current?.focus()
  }, [])

  const state = result && result.id === id ? result : null

  // Cerrar: atrás en el historial vuelve al feed con sus filtros (el feed nunca se desmontó).
  // Si se abrió el link directo, no hay historial dentro de la app: vamos a /news.
  function close() {
    if (location.key !== 'default') navigate(-1)
    else navigate('/news')
  }

  function retry() {
    setResult(null)
    setAttempt((n) => n + 1)
  }

  async function verifyAs(status: NewsVerification) {
    if (verify.kind === 'sending') return // una sola request en vuelo
    setVerify({ kind: 'sending', status })
    try {
      const { data } = await api.patch<NewsDetailData>(`/news/${encodeURIComponent(id)}/status`, { status })
      setResult({ kind: 'success', id, data })
      feed?.updateItem(data) // el feed refleja el nuevo estado al volver
      setVerify({ kind: 'done', message: `Noticia marcada como ${STATUS_LABELS[data.status].toLowerCase()}.` })
    } catch (err) {
      const error = getApiError(err) as VerifyError
      if (error.code === 'NEWS_ALREADY_VERIFIED' && error.current) {
        // Alguien ya la verificó: mostramos su estado real en vez de un error
        setResult({ kind: 'success', id, data: error.current })
        feed?.updateItem(error.current)
        setVerify({ kind: 'done', message: `Ya estaba verificada: ${STATUS_LABELS[error.current.status].toLowerCase()}.` })
      } else {
        // Se conserva el estado anterior (no tocamos `result`) y se permite reintentar
        setVerify({ kind: 'failed', status, error })
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 p-4"
      onClick={close}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="news-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()} // clic dentro no cierra
        onKeyDown={(e) => {
          if (e.key === 'Escape') close()
        }}
        className="my-8 w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl focus:outline-none"
      >
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={close}
            className="rounded border px-3 py-1 hover:bg-slate-100 focus-visible:outline-2"
          >
            Cerrar
          </button>
        </div>

        {state === null && <LoadingState label="Llega una gaviota News Coo..." minHeight="min-h-64" />}

        {state?.kind === 'error' && <ErrorState error={state.error} onRetry={retry} minHeight="min-h-64" />}

        {state?.kind === 'not-found' && (
          <EmptyState title="Esta noticia no existe" minHeight="min-h-64">
            <Link to="/news" className="underline">
              Volver al feed
            </Link>
          </EmptyState>
        )}

        {state?.kind === 'success' && (
          <article className="space-y-4">
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className={`rounded px-2 py-1 ${STATUS_STYLE[state.data.status]}`}>
                {STATUS_LABELS[state.data.status]}
              </span>
              <span className="rounded bg-slate-100 px-2 py-1">{TYPE_LABELS[state.data.type]}</span>
              <span className="rounded bg-slate-100 px-2 py-1">Prioridad {PRIORITY_LABELS[state.data.priority]}</span>
            </div>

            <h1 id="news-title" className="text-2xl font-bold">
              {state.data.title}
            </h1>
            <p className="text-sm text-slate-500">
              {state.data.source} · {state.data.island} · {formatDate(state.data.publishedAt)}
            </p>
            <p className="font-medium">{state.data.summary}</p>
            {state.data.body.map((paragraph, i) => (
              // Los párrafos no tienen id; su posición no cambia, así que el índice es estable
              <p key={i}>{paragraph}</p>
            ))}

            {state.data.relatedWanted && (
              <p className="text-sm">
                Cartel relacionado:{' '}
                <Link to={`/wanted/${state.data.relatedWanted.id}`} className="font-semibold underline">
                  {state.data.relatedWanted.name}
                </Link>
              </p>
            )}

            {state.data.verifiedAt && (
              <p className="text-sm text-slate-500">Verificada el {formatDate(state.data.verifiedAt)}</p>
            )}

            {state.data.status === 'RUMOR' && (
              <VerifyPanel verify={verify} onVerify={verifyAs} />
            )}

            {verify.kind === 'done' && (
              <p role="status" className="rounded bg-emerald-50 p-3 text-emerald-800">
                {verify.message}
              </p>
            )}
          </article>
        )}
      </div>
    </div>
  )
}

function VerifyPanel({
  verify,
  onVerify,
}: {
  verify: Verify
  onVerify: (status: NewsVerification) => void
}) {
  const sending = verify.kind === 'sending'

  return (
    <div className="space-y-3 rounded border border-amber-300 bg-amber-50 p-4">
      <p className="font-semibold">¿Este rumor es cierto?</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={sending}
          onClick={() => onVerify('CONFIRMED')}
          className="rounded bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
        >
          {sending && verify.status === 'CONFIRMED' ? 'Confirmando...' : 'Confirmar'}
        </button>
        <button
          type="button"
          disabled={sending}
          onClick={() => onVerify('DEBUNKED')}
          className="rounded bg-slate-700 px-4 py-2 text-white hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
        >
          {sending && verify.status === 'DEBUNKED' ? 'Desmintiendo...' : 'Desmentir'}
        </button>
      </div>

      {verify.kind === 'failed' && (
        <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-red-800">
          <span>
            No se pudo verificar: {verify.error.message}
            {verify.error.retryAfterSeconds ? ` Espera ${verify.error.retryAfterSeconds} s.` : ''}
          </span>
          <button
            type="button"
            onClick={() => onVerify(verify.status)}
            className="rounded border border-red-400 px-3 py-1 hover:bg-red-100 focus-visible:outline-2"
          >
            Reintentar
          </button>
        </div>
      )}
    </div>
  )
}
