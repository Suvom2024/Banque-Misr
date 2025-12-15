'use client'

import { useRef, useState, useEffect } from 'react'
import { AgentNode } from './AgentNode'
import { ConnectionPath } from './ConnectionPath'
import { ZoomControls } from './ZoomControls'

interface Node {
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
  nodeType?: 'trigger' | 'primary' | 'validator' | 'feedback' | 'processor' | 'integrator'
}

interface Connection {
  id: string
  fromNodeId: string
  toNodeId: string
  fromPosition: { x: number; y: number }
  toPosition: { x: number; y: number }
  isActive?: boolean
  hasFlow?: boolean
}

interface WorkflowCanvasProps {
  nodes: Node[]
  connections: Connection[]
  connectionMode?: {
    fromNodeId: string
    fromConnectorType: 'input' | 'output'
    fromPosition: string
    fromPositionCoords: { x: number; y: number }
  } | null
  onNodeClick?: (nodeId: string) => void
  onNodeDrag?: (nodeId: string, position: { x: number; y: number }) => void
  onNodeDragStart?: (nodeId: string, e: React.MouseEvent) => void
  onNodeDragEnd?: (nodeId: string) => void
  onConnectorClick?: (nodeId: string, connectorType: 'input' | 'output', position: string) => void
  onAgentDrop?: (agent: any, position: { x: number; y: number }) => void
}

export function WorkflowCanvas({
  nodes,
  connections,
  connectionMode,
  onNodeClick,
  onNodeDrag,
  onNodeDragStart,
  onNodeDragEnd,
  onConnectorClick,
  onAgentDrop,
}: WorkflowCanvasProps) {
  const canvasRef = useRef<HTMLElement>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const agentData = e.dataTransfer.getData('application/json')
    if (agentData && canvasRef.current) {
      const agent = JSON.parse(agentData)
      const canvasRect = canvasRef.current.getBoundingClientRect()
      const scrollLeft = canvasRef.current.scrollLeft
      const scrollTop = canvasRef.current.scrollTop
      
      const x = e.clientX - canvasRect.left + scrollLeft - 112 // Center of node (half width)
      const y = e.clientY - canvasRect.top + scrollTop - 100 // Center of node (half height)
      
      onAgentDrop?.(agent, { x: Math.max(0, x), y: Math.max(0, y) })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (connectionMode && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect()
      const scrollLeft = canvasRef.current.scrollLeft
      const scrollTop = canvasRef.current.scrollTop
      setMousePosition({
        x: e.clientX - canvasRect.left + scrollLeft,
        y: e.clientY - canvasRect.top + scrollTop,
      })
    }
  }

  const handleMouseLeave = () => {
    if (connectionMode) {
      setMousePosition(null)
    }
  }

  useEffect(() => {
    if (!connectionMode) {
      setMousePosition(null)
    }
  }, [connectionMode])

  return (
    <section
      ref={canvasRef}
      className={`flex-1 relative bg-slate-50 overflow-auto custom-scrollbar canvas-grid ${
        connectionMode ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        if (connectionMode) {
          // Cancel connection mode on canvas click
          onConnectorClick?.(connectionMode.fromNodeId, connectionMode.fromConnectorType, connectionMode.fromPosition)
        }
      }}
      style={{
        backgroundSize: '20px 20px',
        backgroundImage: 'linear-gradient(to right, #E2E8F0 1px, transparent 1px), linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)',
      }}
    >
      {/* SVG Overlay for Connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ minWidth: '1200px', minHeight: '800px' }}>
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
        {/* Preview connection line during connection mode */}
        {connectionMode && mousePosition && (
          <ConnectionPath
            id="preview-connection"
            from={connectionMode.fromPositionCoords}
            to={mousePosition}
            isActive={true}
            hasFlow={false}
          />
        )}
      </svg>

      {/* Nodes */}
      <div className="absolute inset-0 z-10" style={{ minWidth: '1200px', minHeight: '800px' }}>
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
            connectionMode={connectionMode}
            onClick={() => onNodeClick?.(node.id)}
            onConnectorClick={(connectorType, position) => onConnectorClick?.(node.id, connectorType, position)}
            onDragStart={onNodeDragStart}
            onDrag={onNodeDrag}
            onDragEnd={onNodeDragEnd}
          />
        ))}
      </div>

      {/* Zoom Controls */}
      <ZoomControls />
    </section>
  )
}

