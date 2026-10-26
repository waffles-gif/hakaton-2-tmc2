// Formatos compartidos para mostrar datos de la API

const berries = new Intl.NumberFormat('es-PE')

export function formatBerries(amount: number): string {
  return `฿ ${berries.format(amount)}`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' })
}

export const STATUS_LABEL = {
  AT_LARGE: 'Prófugo',
  CAPTURED: 'Capturado',
  MISSING: 'Desaparecido',
} as const

export const FRUIT_LABEL = {
  PARAMECIA: 'Paramecia',
  ZOAN: 'Zoan',
  LOGIA: 'Logia',
  NONE: 'Sin fruta',
} as const
