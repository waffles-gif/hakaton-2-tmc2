// Tipos copiados del contrato de Swagger para /sagas y /sagas/{id}/story.

// Colores hexadecimales de una saga o de una etapa
export interface Palette {
  background: string
  surface: string
  primary: string
  accent: string
  text: string
}

export interface SagaSummary {
  id: string
  order: number
  title: string
  subtitle: string
  synopsis: string
  stageCount: number
  totalDistanceNm: number
  firstIsland: string
  lastIsland: string
  palette: Palette
}

// Todas las etapas traen estas 4 métricas, en el mismo orden
export type StageMetricKey = 'distanceNm' | 'crewMorale' | 'bountyPool' | 'marineThreat'

export interface StageMetric {
  key: StageMetricKey
  label: string
  value: number
  unit: string
}

// Posición dentro de map.width × map.height (y = 0 arriba)
export interface Island {
  id: string
  name: string
  x: number
  y: number
}

export interface SagaStage {
  id: string
  order: number
  slug: string
  title: string
  narrative: string[]
  island: Island
  palette: Palette
  metrics: StageMetric[]
}

export interface SagaMap {
  width: number
  height: number
}

export interface SagaStory {
  saga: SagaSummary & { intro: string }
  map: SagaMap
  stages: SagaStage[]
}
