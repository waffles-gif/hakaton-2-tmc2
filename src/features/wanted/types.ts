// Tipos tomados del contrato de Swagger (/openapi.json).

export const WANTED_STATUSES = ['AT_LARGE', 'CAPTURED', 'MISSING'] as const;
export type WantedStatus = (typeof WANTED_STATUSES)[number];

export const FRUIT_TYPES = ['PARAMECIA', 'ZOAN', 'LOGIA', 'NONE'] as const;
export type FruitType = (typeof FRUIT_TYPES)[number];

export const WANTED_SIZES = [10, 20, 50] as const;
export type WantedSize = (typeof WANTED_SIZES)[number];

export const WANTED_SORTS = ['bounty,desc', 'name,asc', 'updatedAt,desc'] as const;
export type WantedSort = (typeof WANTED_SORTS)[number];

export const STATUS_LABELS: Record<WantedStatus, string> = {
  AT_LARGE: 'Prófugo',
  CAPTURED: 'Capturado',
  MISSING: 'Desaparecido',
};

export const FRUIT_LABELS: Record<FruitType, string> = {
  PARAMECIA: 'Paramecia',
  ZOAN: 'Zoan',
  LOGIA: 'Logia',
  NONE: 'Sin fruta',
};

export const SORT_LABELS: Record<WantedSort, string> = {
  'bounty,desc': 'Mayor recompensa',
  'name,asc': 'Nombre (A-Z)',
  'updatedAt,desc': 'Más recientes',
};

export type CrewRole =
  | 'CAPTAIN'
  | 'FIRST_MATE'
  | 'NAVIGATOR'
  | 'SNIPER'
  | 'COOK'
  | 'DOCTOR'
  | 'SHIPWRIGHT'
  | 'MUSICIAN'
  | 'ARCHAEOLOGIST'
  | 'HELMSMAN'
  | 'FIGHTER';

export interface CrewRef {
  id: string;
  name: string;
}

export interface Crew extends CrewRef {
  shipName: string;
  jollyRogerColor: string;
  memberCount: number;
  totalBounty: number;
}

export interface DevilFruit {
  name: string;
  type: FruitType;
}

export interface WantedSummary {
  id: string;
  name: string;
  epithet: string;
  bounty: number;
  status: WantedStatus;
  crew: CrewRef;
  role: CrewRole;
  devilFruit: DevilFruit | null;
  threatLevel: number;
  lastSeenIsland: string;
  updatedAt: string;
}

export interface WantedPage {
  content: WantedSummary[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}
