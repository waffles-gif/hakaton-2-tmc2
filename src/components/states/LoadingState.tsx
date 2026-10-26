// Estado de carga. minHeight reserva el espacio para que el layout no salte.
export default function LoadingState({
  label = 'Cargando...',
  minHeight = 'min-h-48',
}: {
  label?: string
  minHeight?: string
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex ${minHeight} items-center justify-center gap-3 text-slate-600`}
    >
      <span
        aria-hidden="true"
        className="h-5 w-5 rounded-full border-2 border-slate-300 border-t-slate-900 motion-safe:animate-spin"
      />
      {label}
    </div>
  )
}
