import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { sagaTransitionName } from '../../types/saga'
import GrandLineMap from './GrandLineMap'
import type { SagaStory } from './types'
import { useActiveStage } from './useActiveStage'
import './saga-story.css'

const numberFormat = new Intl.NumberFormat('es-PE')

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Scrollytelling de una saga: etapas activadas por scroll + mapa, progreso y métricas fijos al costado.
export default function SagaStoryView({ story }: { story: SagaStory }) {
  const { saga, map, stages } = story
  const [searchParams, setSearchParams] = useSearchParams()

  // ?stage=<slug> al abrir la URL → empezar en esa etapa (si no existe, la primera)
  const urlIndex = stages.findIndex((stage) => stage.slug === searchParams.get('stage'))
  const [initialIndex] = useState(() => Math.max(urlIndex, 0))

  const { observedIndex, sectionsRef, setSectionRef } = useActiveStage(stages.length)
  const activeIndex = observedIndex ?? initialIndex
  const active = stages[activeIndex]

  // Abrir la URL de una etapa lleva directo a ella
  useEffect(() => {
    if (initialIndex > 0) sectionsRef.current[initialIndex]?.scrollIntoView({ block: 'start' })
  }, [initialIndex, sectionsRef])

  // La URL siempre indica la etapa activa (replace: no llena el historial al hacer scroll)
  useEffect(() => {
    if (observedIndex === null || searchParams.get('stage') === active.slug) return
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('stage', active.slug)
        return next
      },
      { replace: true, preventScrollReset: true },
    )
  }, [observedIndex, active.slug, searchParams, setSearchParams])

  const goTo = useCallback(
    (index: number) => {
      const target = sectionsRef.current[Math.min(Math.max(index, 0), stages.length - 1)]
      if (!target) return
      target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
      // Mover el foco a la etapa para que lectores de pantalla y Tab sigan desde ahí
      target.focus({ preventScroll: true })
    },
    [sectionsRef, stages.length],
  )

  // Teclado: ← → o j/k cambian de etapa (↑ ↓ siguen haciendo scroll normal, no se salta texto)
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey) return
      if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable]')) return
      if (event.key === 'ArrowRight' || event.key === 'j') {
        event.preventDefault()
        goTo(activeIndex + 1)
      } else if (event.key === 'ArrowLeft' || event.key === 'k') {
        event.preventDefault()
        goTo(activeIndex - 1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeIndex, goTo])

  // Paleta de la etapa activa como variables CSS
  const palette = active.palette
  const themeVars = {
    '--saga-bg': palette.background,
    '--saga-surface': palette.surface,
    '--saga-primary': palette.primary,
    '--saga-accent': palette.accent,
    '--saga-text': palette.text,
    '--saga-progress': String((activeIndex + 1) / stages.length),
  } as CSSProperties

  return (
    <div className="saga-root rounded-xl bg-[var(--saga-bg)] px-4 text-[var(--saga-text)] sm:px-6" style={themeVars}>
      <header className="py-10">
        <Link to="/sagas" viewTransition className="text-sm underline underline-offset-4 focus-visible:outline-2">
          ← Todas las sagas
        </Link>
        <p className="mt-6 text-sm uppercase tracking-widest text-[var(--saga-accent)]">
          Saga {saga.order} · {saga.firstIsland} → {saga.lastIsland}
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-5xl" style={{ viewTransitionName: sagaTransitionName(saga.id) }}>
          {saga.title}
        </h1>
        <p className="mt-2 text-lg opacity-85">{saga.subtitle}</p>
        <p className="mt-6 max-w-2xl leading-relaxed">{saga.intro}</p>
        <p className="mt-4 text-sm opacity-85">
          {stages.length} etapas · {numberFormat.format(saga.totalDistanceNm)} millas náuticas. Usa ← → (o j / k) para
          cambiar de etapa.
        </p>
      </header>

      <div className="grid gap-x-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        {/* Panel fijo: arriba en mobile, a la derecha en desktop */}
        <aside
          aria-label="Recorrido de la saga"
          className="sticky top-0 z-10 -mx-4 self-start bg-[var(--saga-bg)] px-4 py-3 sm:-mx-6 sm:px-6 lg:order-2 lg:top-4 lg:mx-0 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:px-0"
        >
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="tabular-nums">
              Etapa {activeIndex + 1} de {stages.length}
            </span>
            <span className="truncate font-semibold">{active.island.name}</span>
          </div>
          <div
            role="progressbar"
            aria-label="Progreso del recorrido"
            aria-valuemin={1}
            aria-valuemax={stages.length}
            aria-valuenow={activeIndex + 1}
            className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--saga-surface)]"
          >
            <div className="saga-progress-fill h-full w-full bg-[var(--saga-primary)]" />
          </div>

          <GrandLineMap
            map={map}
            stages={stages}
            activeIndex={activeIndex}
            className="mt-3 max-h-[18vh] w-full lg:max-h-none"
          />

          <dl className="mt-3 grid grid-cols-2 gap-2" aria-live="polite">
            {active.metrics.map((metric) => (
              <div key={metric.key} className="min-w-0 rounded bg-[var(--saga-surface)] px-2 py-1 lg:p-3">
                <dt className="truncate text-[0.65rem] uppercase tracking-wide opacity-85 lg:text-xs">{metric.label}</dt>
                <dd className="break-words text-sm font-semibold tabular-nums lg:text-lg">
                  {numberFormat.format(metric.value)} <span className="text-xs font-normal">{metric.unit}</span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              disabled={activeIndex === 0}
              className="flex-1 rounded border border-current px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40"
            >
              ← Anterior
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              disabled={activeIndex === stages.length - 1}
              className="flex-1 rounded border border-current px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40"
            >
              Siguiente →
            </button>
          </div>

          <ol className="mt-4 hidden space-y-1 text-sm lg:block">
            {stages.map((stage, i) => (
              <li key={stage.id}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={i === activeIndex ? 'step' : undefined}
                  className={`w-full rounded px-2 py-1 text-left focus-visible:outline-2 ${
                    i === activeIndex ? 'bg-[var(--saga-primary)] font-semibold text-[var(--saga-bg)]' : 'hover:underline'
                  }`}
                >
                  {stage.order}. {stage.title}
                </button>
              </li>
            ))}
          </ol>
        </aside>

        {/* Etapas: cada una ocupa casi una pantalla; el padding final deja que la última llegue al centro */}
        <div className="saga-stages pb-[40vh] lg:order-1">
          {stages.map((stage, i) => (
            <section
              key={stage.id}
              ref={setSectionRef(i)}
              id={`etapa-${stage.slug}`}
              data-index={i}
              data-active={i === activeIndex}
              tabIndex={-1}
              aria-labelledby={`etapa-${stage.slug}-titulo`}
              className="saga-stage flex min-h-[80vh] scroll-mt-[46vh] flex-col justify-center py-12 outline-none focus-visible:ring-2 focus-visible:ring-[var(--saga-accent)] lg:scroll-mt-8"
            >
              <div className="saga-stage-body rounded-lg bg-[var(--saga-surface)] p-6">
                <p className="text-sm text-[var(--saga-accent)]">
                  Etapa {stage.order} de {stages.length} · {stage.island.name}
                </p>
                <h2 id={`etapa-${stage.slug}-titulo`} className="mt-1 text-2xl font-bold">
                  {stage.title}
                </h2>
                {stage.narrative.map((paragraph, j) => (
                  <p key={j} className="mt-4 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
