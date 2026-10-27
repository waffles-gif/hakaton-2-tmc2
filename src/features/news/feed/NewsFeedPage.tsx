import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { api, getApiError } from '../../../api/client'
import {
  NEWS_PRIORITIES,
  NEWS_STATUSES,
  NEWS_TYPES,
  PRIORITY_LABELS,
  STATUS_LABELS,
  TYPE_LABELS,
  type NewsFeed,
  type NewsItem,
  type NewsOutletContext,
} from './types'
import { useNewsFilters } from './useNewsFilters'

const PAGE_SIZE = 20

interface FeedState {
  items: NewsItem[]
  nextCursor: string | null
  hasMore: boolean
  loading: boolean
  error: string | null
}

const INITIAL: FeedState = { items: [], nextCursor: null, hasMore: true, loading: false, error: null }

export default function NewsFeedPage() {
  const { filters, setFilter } = useNewsFilters()
  const location = useLocation()
  const [feed, setFeed] = useState<FeedState>(INITIAL)

  // Una sola carga en vuelo a la vez (useRef: cambiarlo no necesita re-renderizar)
  const inFlight = useRef(false)
  const controllerRef = useRef<AbortController | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const { type, priority, status } = filters

  // Pide una página del feed. cursor = null → primera página
  const loadPage = useCallback(
    async (cursor: string | null) => {
      if (inFlight.current) return
      inFlight.current = true
      const controller = new AbortController()
      controllerRef.current = controller
      setFeed((prev) => ({ ...prev, loading: true, error: null }))

      const params = new URLSearchParams({ limit: String(PAGE_SIZE) })
      if (cursor) params.set('cursor', cursor)
      if (type) params.set('type', type)
      if (priority) params.set('priority', priority)
      if (status) params.set('status', status)

      try {
        const { data } = await api.get<NewsFeed>(`/news/feed?${params}`, { signal: controller.signal })
        // Si cambiaron los filtros mientras llegaba, esta respuesta es vieja: se descarta
        if (controller.signal.aborted) return
        setFeed((prev) => {
          // Regla de Nami: nada se cuenta dos veces → deduplicar por id
          const seen = new Set(prev.items.map((i) => i.id))
          const fresh = data.items.filter((i) => !seen.has(i.id))
          return {
            items: [...prev.items, ...fresh],
            nextCursor: data.nextCursor,
            hasMore: data.hasMore,
            loading: false,
            error: null,
          }
        })
      } catch (err) {
        if (controller.signal.aborted) return
        // Error: se conservan las noticias ya cargadas, solo se marca el error
        setFeed((prev) => ({ ...prev, loading: false, error: getApiError(err).message }))
      } finally {
        if (controllerRef.current === controller) inFlight.current = false
      }
    },
    [type, priority, status],
  )

  // Cambian los filtros → cancelar la carga en vuelo, vaciar y empezar desde la primera página
  // (el cursor queda ligado a los filtros con los que se pidió)
  useEffect(() => {
    inFlight.current = false
    setFeed(INITIAL)
    loadPage(null)
    return () => controllerRef.current?.abort()
  }, [loadPage])

  // Scroll infinito: cuando el centinela del final entra en pantalla, cargar la siguiente página
  const canLoadMore = feed.hasMore && !feed.loading && !feed.error && feed.items.length > 0
  const { nextCursor } = feed
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !canLoadMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadPage(nextCursor)
      },
      { rootMargin: '300px' }, // empieza a cargar un poco antes de llegar al final
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [canLoadMore, nextCursor, loadPage])

  // El detalle llama a esto tras verificar: reemplaza la noticia, o la quita si ya no cumple el filtro
  const updateItem = useCallback(
    (updated: NewsItem) => {
      setFeed((prev) => ({
        ...prev,
        items:
          status && updated.status !== status
            ? prev.items.filter((i) => i.id !== updated.id)
            : prev.items.map((i) => (i.id === updated.id ? updated : i)),
      }))
    },
    [status],
  )
  const outletContext: NewsOutletContext = { updateItem }

  const firstLoad = feed.items.length === 0

  return (
    <section className="space-y-4" aria-labelledby="news-title">
      <h1 id="news-title" className="text-2xl font-bold">
        Noticias del Mundo
      </h1>

      <div className="grid gap-2 sm:grid-cols-3">
        <select
          aria-label="Tipo"
          className="rounded border p-2"
          value={type}
          onChange={(e) => setFilter('type', e.target.value)}
        >
          <option value="">Todos los tipos</option>
          {NEWS_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <select
          aria-label="Prioridad"
          className="rounded border p-2"
          value={priority}
          onChange={(e) => setFilter('priority', e.target.value)}
        >
          <option value="">Todas las prioridades</option>
          {NEWS_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
        <select
          aria-label="Estado"
          className="rounded border p-2"
          value={status}
          onChange={(e) => setFilter('status', e.target.value)}
        >
          <option value="">Todos los estados</option>
          {NEWS_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <ul className="grid gap-2">
        {feed.items.map((item) => (
          <li key={item.id}>
            {/* preventScrollReset: abrir el detalle no mueve el scroll del feed */}
            <Link
              to={`/news/${item.id}${location.search}`}
              preventScrollReset
              className="block rounded border bg-white p-3 hover:bg-slate-50 focus-visible:outline-2"
            >
              <p className="text-xs text-slate-500">
                {TYPE_LABELS[item.type]} · {PRIORITY_LABELS[item.priority]} · {STATUS_LABELS[item.status]} ·{' '}
                {item.island}
              </p>
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-slate-600">{item.summary}</p>
            </Link>
          </li>
        ))}
      </ul>

      {feed.loading && (
        <p role="status" className="p-4 text-center text-slate-500">
          Cargando noticias...
        </p>
      )}

      {feed.error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-2 rounded border border-red-300 bg-red-50 p-3 text-red-800"
        >
          <span>{feed.error}</span>
          <button
            type="button"
            className="rounded border border-red-400 px-3 py-1 hover:bg-red-100 focus-visible:outline-2"
            onClick={() => loadPage(firstLoad ? null : feed.nextCursor)}
          >
            Reintentar
          </button>
        </div>
      )}

      {!feed.loading && !feed.error && firstLoad && !feed.hasMore && (
        <p className="p-12 text-center text-slate-500">No hay noticias con estos filtros.</p>
      )}

      {!feed.hasMore && !firstLoad && <p className="p-4 text-center text-slate-500">No hay más noticias.</p>}

      {/* Centinela: el IntersectionObserver lo vigila para cargar más */}
      <div ref={sentinelRef} aria-hidden="true" className="h-1" />

      {/* Aquí se muestra el detalle /news/:id encima del feed, sin desmontarlo */}
      <Outlet context={outletContext} />
    </section>
  )
}
