import type { Team } from './api'
import type { Crew, WantedSummary } from './wanted'

// Respuesta de GET /dashboard/summary
export interface DashboardSummary {
  team: Team
  wanted: {
    total: number // si es 0, el workspace está vacío
    totalBounty: number
    averageBounty: number
    byStatus: { AT_LARGE: number; CAPTURED: number; MISSING: number }
    byFruit: { PARAMECIA: number; ZOAN: number; LOGIA: number; NONE: number }
  }
  crews: {
    total: number
    mostWanted: Crew | null
  }
  topBounties: WantedSummary[] // hasta 5
  generatedAt: string
}
