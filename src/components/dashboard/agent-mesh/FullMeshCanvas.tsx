'use client'

import { AgentNode } from './AgentNode'
import { ConnectionPath } from './ConnectionPath'
import { ZoomControls } from './ZoomControls'

interface FullMeshNode {
  id: string
  agentType: 'persona' | 'policy' | 'coaching' | 'summarizer' | 'integrator' | 'trigger'
  title: string
  subtitle?: string
  description?: string
  goal?: string
  model?: string
  position: { x: number; y: number }
  isSelected?: boolean
  isActive?: boolean
  nodeType: 'trigger' | 'primary' | 'validator' | 'feedback' | 'processor' | 'integrator'
}

interface FullMeshConnection {
  id: string
  fromNodeId: string
  toNodeId: string
  fromPosition: { x: number; y: number }
  toPosition: { x: number; y: number }
  isActive?: boolean
  hasFlow?: boolean
}

interface FullMeshCanvasProps {
  nodes: FullMeshNode[]
  connections: FullMeshConnection[]
  onNodeClick?: (nodeId: string) => void
}

export function FullMeshCanvas({ nodes, connections, onNodeClick }: FullMeshCanvasProps) {
  return (
    <section
      className="flex-1 relative bg-slate-50 overflow-auto custom-scrollbar cursor-grab active:cursor-grabbing canvas-grid"
      style={{
        backgroundSize: '40px 40px',
        backgroundImage: 'linear-gradient(to right, #F1F5F9 1px, transparent 1px), linear-gradient(to bottom, #F1F5F9 1px, transparent 1px)',
      }}
    >
      {/* SVG Overlay for Connections */}
      <svg className="absolute top-0 left-0 w-[1200px] h-[950px] pointer-events-none z-0">
        <defs>
          <linearGradient id="grad-gold-maroon" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#9B2C3A', stopOpacity: 1 }}></stop>
            <stop offset="100%" style={{ stopColor: '#E6B328', stopOpacity: 1 }}></stop>
          </linearGradient>
          <linearGradient id="grad-flow-anim" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#E6B328', stopOpacity: 0 }}></stop>
            <stop offset="50%" style={{ stopColor: '#E6B328', stopOpacity: 1 }}></stop>
            <stop offset="100%" style={{ stopColor: '#9B2C3A', stopOpacity: 0 }}></stop>
          </linearGradient>
          <marker id="arrowhead-end" markerHeight="6" markerWidth="6" orient="auto" refX="5" refY="3">
            <path d="M0,0 L6,3 L0,6" fill="#7A1A25"></path>
          </marker>
        </defs>
        {connections.map((connection) => (
          <ConnectionPath
            key={connection.id}
            id={connection.id}
            from={connection.fromPosition}
            to={connection.toPosition}
            isActive={connection.isActive}
            hasFlow={connection.hasFlow}
          />
        ))}
      </svg>

      {/* Nodes */}
      <div className="absolute inset-0 z-10 w-[1200px] h-[950px]">
        {nodes.map((node) => (
          <AgentNode
            key={node.id}
            id={node.id}
            agentType={node.agentType}
            title={node.title}
            subtitle={node.subtitle}
            description={node.description}
            goal={node.goal}
            model={node.model}
            position={node.position}
            isSelected={node.isSelected}
            isActive={node.isActive}
            nodeType={node.nodeType}
            onClick={() => onNodeClick?.(node.id)}
          />
        ))}
      </div>

      {/* Zoom Controls */}
      <ZoomControls />
    </section>
  )
}

