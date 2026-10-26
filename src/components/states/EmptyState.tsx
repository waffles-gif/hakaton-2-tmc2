import type { ReactNode } from 'react'

// Estado vacío: la request salió bien pero no hay datos que mostrar
export default function EmptyState({
  title,
  children,
  minHeight = 'min-h-48',
}: {
  title: string
  children?: ReactNode
  minHeight?: string
}) {
  return (
    <div
      role="status"
      className={`flex ${minHeight} flex-col items-center justify-center gap-2 rounded border border-dashed border-slate-300 p-6 text-center text-slate-600`}
    >
      <p className="font-semibold text-slate-800">{title}</p>
      {children}
    </div>
  )
}
