'use client'

interface ConnectionPathProps {
  id: string
  from: { x: number; y: number }
  to: { x: number; y: number }
  isActive?: boolean
  hasFlow?: boolean
}

export function ConnectionPath({ from, to, isActive = false, hasFlow = false }: ConnectionPathProps) {
  // Calculate bezier curve control points for smoother curves
  const dx = to.x - from.x
  const dy = to.y - from.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  const curvature = Math.min(distance * 0.3, 100) // Adaptive curvature based on distance

  const midX = (from.x + to.x) / 2
  const controlY1 = from.y + (to.y > from.y ? curvature : -curvature)
  const controlY2 = to.y + (to.y > from.y ? -curvature : curvature)

  const pathD = `M ${from.x} ${from.y} C ${midX} ${controlY1}, ${midX} ${controlY2}, ${to.x} ${to.y}`

  return (
    <g>
      {/* Background path for better visibility */}
      <path
        d={pathD}
        fill="none"
        stroke="#E2E8F0"
        strokeWidth="4"
        strokeLinecap="round"
        className="connector-path-bg"
      />
      {/* Active path */}
      {isActive && (
        <path
          d={pathD}
          fill="none"
          stroke={hasFlow ? 'url(#grad-flow-anim)' : 'url(#grad-gold-maroon)'}
          strokeWidth="2.5"
          strokeLinecap="round"
          markerEnd="url(#arrowhead-end)"
          className="connector-path-active"
          style={{
            filter: hasFlow ? 'none' : 'drop-shadow(0px 2px 3px rgba(122, 26, 37, 0.2))',
            transition: 'all 0.3s ease',
          }}
        />
      )}
      {/* Flow animation path */}
      {hasFlow && (
        <path
          d={pathD}
          fill="none"
          stroke="url(#grad-flow-anim)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="6 6"
          className="connector-path-flow"
          style={{
            animation: 'flowDash 1s linear infinite',
            opacity: 0.8,
            mixBlendMode: 'multiply',
          }}
        />
      )}
    </g>
  )
}

