import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  NEWS_PRIORITIES,
  NEWS_STATUSES,
  NEWS_TYPES,
  type NewsPriority,
  type NewsStatus,
  type NewsType,
} from './types'

export interface NewsFilters {
  type: NewsType | ''
  priority: NewsPriority | ''
  status: NewsStatus | ''
}

// Si la URL trae un valor inválido, se ignora: la vista no se rompe
function oneOf<T extends string>(allowed: readonly T[], value: string | null): T | '' {
  return allowed.find((a) => a === value) ?? ''
}

// Los filtros viven en la URL: recargar o compartir el link muestra lo mismo
export function useNewsFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo<NewsFilters>(
    () => ({
      type: oneOf(NEWS_TYPES, searchParams.get('type')),
      priority: oneOf(NEWS_PRIORITIES, searchParams.get('priority')),
      status: oneOf(NEWS_STATUSES, searchParams.get('status')),
    }),
    [searchParams],
  )

  const setFilter = useCallback(
    (key: keyof NewsFilters, value: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      })
    },
    [setSearchParams],
  )

  return { filters, setFilter }
}
