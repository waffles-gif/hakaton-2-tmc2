// Tipos tomados del contrato de Swagger (/openapi.json).

export const NEWS_TYPES = ['BOUNTY_UPDATE', 'BATTLE', 'MARINE_OPERATION', 'WORLD_GOVERNMENT', 'DISCOVERY'] as const
export type NewsType = (typeof NEWS_TYPES)[number]

export const NEWS_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const
export type NewsPriority = (typeof NEWS_PRIORITIES)[number]

export const NEWS_STATUSES = ['RUMOR', 'CONFIRMED', 'DEBUNKED'] as const
export type NewsStatus = (typeof NEWS_STATUSES)[number]

export const TYPE_LABELS: Record<NewsType, string> = {
  BOUNTY_UPDATE: 'Recompensas',
  BATTLE: 'Batallas',
  MARINE_OPERATION: 'Operación de la Marina',
  WORLD_GOVERNMENT: 'Gobierno Mundial',
  DISCOVERY: 'Descubrimientos',
}

export const PRIORITY_LABELS: Record<NewsPriority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
}

export const STATUS_LABELS: Record<NewsStatus, string> = {
  RUMOR: 'Rumor',
  CONFIRMED: 'Confirmada',
  DEBUNKED: 'Desmentida',
}

export interface NewsItem {
  id: string
  type: NewsType
  priority: NewsPriority
  status: NewsStatus
  title: string
  summary: string
  source: string
  island: string
  relatedWanted: { id: string; name: string } | null
  publishedAt: string
  updatedAt: string
  verifiedAt: string | null
}

export interface NewsFeed {
  items: NewsItem[]
  nextCursor: string | null
  hasMore: boolean
}

// Lo que el feed le pasa al detalle (/news/:id) por <Outlet context>
export interface NewsOutletContext {
  updateItem: (item: NewsItem) => void
}
