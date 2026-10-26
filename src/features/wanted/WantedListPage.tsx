import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
// Acordar con A: apiGet<T>(path, signal) agrega el token y lanza error si la respuesta no es ok.
import { apiGet } from '../../api/client';
import { useDebounce } from '../../hooks/useDebounce';
import {
  FRUIT_LABELS,
  FRUIT_TYPES,
  SORT_LABELS,
  STATUS_LABELS,
  WANTED_SIZES,
  WANTED_SORTS,
  WANTED_STATUSES,
  type Crew,
  type WantedPage,
} from './types';
import { useWantedParams, type WantedParams } from './useWantedParams';

type ListState =
  | { kind: 'loading'; data: WantedPage | null }
  | { kind: 'error'; data: WantedPage | null }
  | { kind: 'success'; data: WantedPage };

const SKELETON_ROWS = 10;
const berries = new Intl.NumberFormat('es-PE');

function buildQuery(p: WantedParams): string {
  const qs = new URLSearchParams({ page: String(p.page), size: String(p.size), sort: p.sort });
  if (p.status) qs.set('status', p.status);
  if (p.crewId) qs.set('crewId', p.crewId);
  if (p.fruit) qs.set('fruit', p.fruit);
  if (p.q) qs.set('q', p.q);
  return qs.toString();
}

export default function WantedListPage() {
  const { params, update } = useWantedParams();
  const [state, setState] = useState<ListState>({ kind: 'loading', data: null });
  const [retryCount, setRetryCount] = useState(0);
  const [crews, setCrews] = useState<Crew[]>([]);

  // Búsqueda: el input tiene estado local y la URL se actualiza solo tras el debounce.
  const [qInput, setQInput] = useState(params.q);
  const debouncedQ = useDebounce(qInput, 400);
  const urlQ = useRef(params.q);
  urlQ.current = params.q;

  // Atrás/adelante cambia la URL → el input refleja ese valor.
  useEffect(() => {
    setQInput(params.q);
  }, [params.q]);

  useEffect(() => {
    const q = debouncedQ.trim();
    if (q !== urlQ.current) update({ q });
  }, [debouncedQ, update]);

  // Tripulaciones para el filtro.
  useEffect(() => {
    const controller = new AbortController();
    apiGet<Crew[]>('/crews', controller.signal)
      .then(setCrews)
      .catch(() => {
        // Sin tripulaciones el filtro queda vacío; el listado sigue funcionando.
      });
    return () => controller.abort();
  }, []);

  // Listado. Cada cambio aborta la request anterior: una respuesta vieja nunca se pinta.
  const query = buildQuery(params);
  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ kind: 'loading', data: prev.data }));

    apiGet<WantedPage>(`/wanted?${query}`, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        // La página pedida ya no existe (p. ej. URL vieja): ir a la última que sí existe.
        const lastPage = Math.max(data.totalPages - 1, 0);
        if (data.page > lastPage) {
          update({ page: lastPage }, { replace: true });
          return;
        }
        setState({ kind: 'success', data });
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setState((prev) => ({ kind: 'error', data: prev.data }));
      });

    return () => controller.abort();
  }, [query, retryCount, update]);

  const data = state.data;
  const isLoading = state.kind === 'loading';
  const totalPages = Math.max(data?.totalPages ?? 1, 1);

  return (
    <section className="mx-auto max-w-5xl p-4">
      <header className="mb-4 flex items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold">Se Busca</h1>
        <p className="text-sm text-gray-500" aria-live="polite">
          {data ? `${data.totalElements} carteles` : ' '}
        </p>
      </header>

      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <input
          type="search"
          aria-label="Buscar por nombre o epíteto"
          className="rounded border p-2 sm:col-span-2 lg:col-span-1"
          placeholder="Nombre o epíteto…"
          maxLength={100}
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
        />

        <select
          aria-label="Estado"
          className="rounded border p-2"
          value={params.status}
          onChange={(e) => update({ status: e.target.value as WantedParams['status'] })}
        >
          <option value="">Todos los estados</option>
          {WANTED_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>

        <select
          aria-label="Tripulación"
          className="rounded border p-2"
          value={params.crewId}
          onChange={(e) => update({ crewId: e.target.value })}
        >
          <option value="">Todas las tripulaciones</option>
          {/* Si la URL trae un crewId que aún no está en la lista, igual se muestra como seleccionado. */}
          {params.crewId && !crews.some((c) => c.id === params.crewId) && (
            <option value={params.crewId}>{params.crewId}</option>
          )}
          {crews.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Fruta del diablo"
          className="rounded border p-2"
          value={params.fruit}
          onChange={(e) => update({ fruit: e.target.value as WantedParams['fruit'] })}
        >
          <option value="">Todas las frutas</option>
          {FRUIT_TYPES.map((f) => (
            <option key={f} value={f}>
              {FRUIT_LABELS[f]}
            </option>
          ))}
        </select>

        <select
          aria-label="Ordenar por"
          className="rounded border p-2"
          value={params.sort}
          onChange={(e) => update({ sort: e.target.value as WantedParams['sort'] })}
        >
          {WANTED_SORTS.map((s) => (
            <option key={s} value={s}>
              {SORT_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {/* Altura mínima fija: loading, error y vacío no mueven el layout. */}
      <div className="relative min-h-[36rem]" aria-busy={isLoading}>
        {state.kind === 'error' && (
          <div role="alert" className="mb-2 flex items-center justify-between rounded border border-red-300 bg-red-50 p-3 text-red-800">
            <span>No se pudieron cargar los carteles.</span>
            <button
              type="button"
              className="rounded border border-red-400 px-3 py-1 hover:bg-red-100"
              onClick={() => setRetryCount((n) => n + 1)}
            >
              Reintentar
            </button>
          </div>
        )}

        {!data && isLoading && (
          <ul className="grid gap-2">
            {Array.from({ length: SKELETON_ROWS }, (_, i) => (
              <li key={i} className="h-14 animate-pulse rounded bg-gray-200" />
            ))}
          </ul>
        )}

        {data && data.content.length === 0 && state.kind === 'success' && (
          <p className="p-12 text-center text-gray-500">No hay carteles con estos filtros.</p>
        )}

        {data && data.content.length > 0 && (
          <ul className={`grid gap-2 transition-opacity ${isLoading ? 'opacity-50' : ''}`}>
            {data.content.map((w) => (
              <li key={w.id}>
                <Link
                  to={`/wanted/${w.id}`}
                  className="flex items-center justify-between gap-4 rounded border p-3 hover:bg-gray-50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {w.name} <span className="font-normal text-gray-500">“{w.epithet}”</span>
                    </p>
                    <p className="truncate text-sm text-gray-500">
                      {w.crew.name} · {STATUS_LABELS[w.status]} ·{' '}
                      {w.devilFruit ? `${w.devilFruit.name} (${FRUIT_LABELS[w.devilFruit.type]})` : 'Sin fruta'}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono">฿ {berries.format(w.bounty)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <select
          aria-label="Carteles por página"
          className="rounded border p-2"
          value={params.size}
          onChange={(e) => update({ size: Number(e.target.value) as WantedParams['size'] })}
        >
          {WANTED_SIZES.map((s) => (
            <option key={s} value={s}>
              {s} por página
            </option>
          ))}
        </select>

        <nav className="flex items-center gap-2" aria-label="Paginación">
          <button
            type="button"
            className="rounded border px-3 py-1 disabled:opacity-40"
            disabled={params.page === 0}
            onClick={() => update({ page: params.page - 1 })}
          >
            Anterior
          </button>
          <span className="tabular-nums">
            Página {params.page + 1} de {totalPages}
          </span>
          <button
            type="button"
            className="rounded border px-3 py-1 disabled:opacity-40"
            disabled={params.page >= totalPages - 1}
            onClick={() => update({ page: params.page + 1 })}
          >
            Siguiente
          </button>
        </nav>
      </footer>
    </section>
  );
}
