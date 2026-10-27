import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Detecta qué etapa está activa mientras se hace scroll.
 * La activa es la sección que cruza una línea horizontal al 60 % de la altura de la pantalla
 * (más abajo que el centro para que en mobile no quede detrás del panel fijo del mapa).
 * Devuelve null hasta que el observer reporta por primera vez.
 */
export function useActiveStage(count: number) {
  const sectionsRef = useRef<(HTMLElement | null)[]>([])
  const [observedIndex, setObservedIndex] = useState<number | null>(null)

  useEffect(() => {
    if (count === 0) return

    // rootMargin -60% arriba y -40% abajo: el área observada es solo esa línea
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || !(entry.target instanceof HTMLElement)) continue
          setObservedIndex(Number(entry.target.dataset.index))
        }
      },
      { rootMargin: '-60% 0px -40% 0px' },
    )

    sectionsRef.current.slice(0, count).forEach((section) => {
      if (section) observer.observe(section)
    })
    return () => observer.disconnect()
  }, [count])

  const setSectionRef = useCallback(
    (index: number) => (element: HTMLElement | null) => {
      sectionsRef.current[index] = element
    },
    [],
  )

  return { observedIndex, sectionsRef, setSectionRef }
}
