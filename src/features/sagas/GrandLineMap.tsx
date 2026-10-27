import type { SagaMap, SagaStage } from './types'

interface GrandLineMapProps {
  map: SagaMap
  stages: SagaStage[]
  activeIndex: number
  className?: string
}

// Mapa del Grand Line en SVG: islas, ruta recorrida hasta la etapa activa y el barco en su isla.
// Los colores salen de las variables CSS de la paleta activa (--saga-*).
export default function GrandLineMap({ map, stages, activeIndex, className = '' }: GrandLineMapProps) {
  const islands = stages.map((stage) => stage.island)
  const ship = islands[activeIndex]

  // Largo de cada tramo entre islas, para dibujar solo la parte recorrida
  const segments = islands.slice(1).map((island, i) => Math.hypot(island.x - islands[i].x, island.y - islands[i].y))
  const totalLength = segments.reduce((sum, length) => sum + length, 0)
  const traveledLength = segments.slice(0, activeIndex).reduce((sum, length) => sum + length, 0)
  const routePath = islands.map((island, i) => `${i === 0 ? 'M' : 'L'} ${island.x} ${island.y}`).join(' ')

  // Unidad base proporcional al mapa, para que todo escale con map.width/height
  const unit = Math.max(map.width, map.height) / 100

  return (
    <svg
      viewBox={`0 0 ${map.width} ${map.height}`}
      className={className}
      role="img"
      aria-label={`Mapa del Grand Line: el barco está en ${ship.name}, etapa ${activeIndex + 1} de ${stages.length}`}
    >
      <rect width={map.width} height={map.height} rx={unit * 2} style={{ fill: 'var(--saga-surface)' }} />

      {/* Ruta completa (punteada) y ruta recorrida (sólida) */}
      <path
        d={routePath}
        fill="none"
        strokeWidth={unit * 0.35}
        strokeDasharray={`${unit} ${unit}`}
        style={{ stroke: 'var(--saga-text)', opacity: 0.35 }}
      />
      <path
        className="saga-route"
        d={routePath}
        fill="none"
        strokeWidth={unit * 0.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={totalLength}
        strokeDashoffset={totalLength - traveledLength}
        style={{ stroke: 'var(--saga-primary)' }}
      />

      {islands.map((island, i) => {
        const isActive = i === activeIndex
        // Etiquetas alternadas arriba/abajo para que islas cercanas no se encimen
        const labelAbove = island.y > unit * 8 && (i % 2 === 1 || island.y > map.height - unit * 8)
        // Cerca de los bordes, alinear el texto hacia adentro para que no se corte
        const anchor = island.x < map.width * 0.12 ? 'start' : island.x > map.width * 0.88 ? 'end' : 'middle'
        return (
          <g key={stages[i].id}>
            <circle
              cx={island.x}
              cy={island.y}
              r={unit * (isActive ? 2 : 1.4)}
              strokeWidth={unit * 0.3}
              style={{
                fill: i <= activeIndex ? 'var(--saga-primary)' : 'var(--saga-bg)',
                stroke: 'var(--saga-text)',
              }}
            />
            <text
              x={island.x}
              y={labelAbove ? island.y - unit * 3.5 : island.y + unit * 5.5}
              textAnchor={anchor}
              fontSize={unit * (isActive ? 2.8 : 2.3)}
              fontWeight={isActive ? 700 : 400}
              // En pantallas chicas solo se nombra la isla activa
              className={isActive ? undefined : 'max-lg:hidden'}
              style={{ fill: 'var(--saga-text)', opacity: isActive ? 1 : 0.75 }}
            >
              {island.name}
            </text>
          </g>
        )
      })}

      {/* Barco: se mueve con transform; la transición se apaga con prefers-reduced-motion */}
      <g className="saga-ship" style={{ transform: `translate(${ship.x}px, ${ship.y}px)` }} aria-hidden="true">
        <g transform={`translate(0 ${-unit * 1.2}) scale(${unit / 7})`}>
          <path d="M -16 2 L 16 2 L 10 11 L -10 11 Z" style={{ fill: 'var(--saga-accent)' }} />
          <path d="M 0 2 L 0 -22" strokeWidth={2} style={{ stroke: 'var(--saga-text)' }} />
          <path d="M 2 -20 L 14 -3 L 2 -3 Z" style={{ fill: 'var(--saga-text)' }} />
          <path d="M -2 -18 L -11 -3 L -2 -3 Z" style={{ fill: 'var(--saga-text)', opacity: 0.8 }} />
        </g>
      </g>
    </svg>
  )
}
