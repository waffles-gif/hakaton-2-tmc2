import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, getApiError } from '../../api/client'
import EmptyState from '../../components/states/EmptyState'
import ErrorState from '../../components/states/ErrorState'
import LoadingState from '../../components/states/LoadingState'
import type { ApiError } from '../../types/api'
import SagaStoryView from './SagaStoryView'
import type { SagaStory } from './types'

// key = a qué request corresponde el resultado (id de la saga + número de reintento)
interface StoryResult {
  key: string
  story: SagaStory | null
  error: ApiError | null
}

// /sagas/:id → pide la historia y muestra carga, error o la historia completa
export default function SagaStoryPage() {
  const { id = '' } = useParams()
  const [retryCount, setRetryCount] = useState(0)
  const [result, setResult] = useState<StoryResult>({ key: '', story: null, error: null })
  const requestKey = `${id}#${retryCount}`

  useEffect(() => {
    const controller = new AbortController()
    api
      .get<SagaStory>(`/sagas/${encodeURIComponent(id)}/story`, { signal: controller.signal })
      .then(({ data }) => {
        if (controller.signal.aborted) return
        setResult({ key: requestKey, story: data, error: null })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setResult({ key: requestKey, story: null, error: getApiError(error) })
      })
    return () => controller.abort()
  }, [id, requestKey])

  if (result.key !== requestKey) {
    return <LoadingState label="Descifrando el Poneglyph..." minHeight="min-h-[60vh]" />
  }

  if (result.error?.status === 404) {
    return (
      <EmptyState title="Esta saga no existe" minHeight="min-h-[60vh]">
        <Link to="/sagas" className="underline">
          Ver todas las sagas
        </Link>
      </EmptyState>
    )
  }

  if (result.error) {
    return <ErrorState error={result.error} onRetry={() => setRetryCount((n) => n + 1)} minHeight="min-h-[60vh]" />
  }

  if (!result.story || result.story.stages.length === 0) {
    return <EmptyState title="Esta saga todavía no tiene etapas" minHeight="min-h-[60vh]" />
  }

  // key: al cambiar de saga se reinicia el estado de la etapa activa
  return <SagaStoryView key={result.story.saga.id} story={result.story} />
}
