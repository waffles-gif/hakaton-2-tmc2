// Tipos de las sagas, copiados del contrato de Swagger (/docs)

export interface Palette {
  background: string
  surface: string
  primary: string
  accent: string
  text: string // buen contraste sobre background
}

export interface SagaSummary {
  id: string
  order: number // orden cronológico, desde 1
  title: string
  subtitle: string
  synopsis: string
  stageCount: number
  totalDistanceNm: number
  firstIsland: string
  lastIsland: string
  palette: Palette
}

export type StageMetricKey = 'distanceNm' | 'crewMorale' | 'bountyPool' | 'marineThreat'

// Todas las etapas traen las mismas 4 métricas, en el mismo orden
export interface StageMetric {
  key: StageMetricKey
  label: string
  value: number
  unit: string
}

export interface SagaStage {
  id: string
  order: number // desde 1, ya vienen ordenadas
  slug: string // único dentro de la saga
  title: string
  narrative: string[]
  island: { id: string; name: string; x: number; y: number } // x, y dentro de map.width/height
  palette: Palette
  metrics: StageMetric[]
}

export interface SagaStory {
  saga: SagaSummary & { intro: string }
  map: { width: number; height: number }
  stages: SagaStage[] // la ruta une las islas en este orden
}

// Nombre compartido de la View Transition entre la tarjeta del resumen y el encabezado de la historia.
// Las dos pantallas deben usar el mismo nombre para que el navegador anime de una a otra.
export function sagaTransitionName(id: string): string {
  return `saga-${id}`
}
