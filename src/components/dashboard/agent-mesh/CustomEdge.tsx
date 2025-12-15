'use client'

import { BaseEdge, EdgeProps, getBezierPath } from 'reactflow'

export function CustomEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, animated }: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <>
      {/* Background path for better visibility */}
      <path
        id={`${id}-bg`}
        className="react-flow__edge-path"
        d={edgePath}
        fill="none"
        stroke="#E2E8F0"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Active path */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{ ...style, stroke: 'url(#grad-gold-maroon)', strokeWidth: '2.5' }}
        markerEnd={markerEnd}
      />
      {/* Animated flow path for active connections */}
      {animated && (
        <path
          id={`${id}-flow`}
          className="react-flow__edge-path"
          d={edgePath}
          fill="none"
          stroke="url(#grad-flow-anim)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="6 6"
          style={{
            animation: 'flowDash 1s linear infinite',
            opacity: 0.8,
          }}
        />
      )}
    </>
  )
}

