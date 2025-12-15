'use client'

import { useState, useRef, useEffect } from 'react'
import { NodeConnector } from './NodeConnector'

interface AgentNodeProps {
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
  connectionMode?: {
    fromNodeId: string
    fromConnectorType: 'input' | 'output'
    fromPosition: string
    fromPositionCoords: { x: number; y: number }
  } | null
  onClick?: () => void
  onConnectorClick?: (connectorType: 'input' | 'output', position: string) => void
  onDragStart?: (nodeId: string, e: React.MouseEvent) => void
  onDrag?: (nodeId: string, position: { x: number; y: number }) => void
  onDragEnd?: (nodeId: string) => void
}

export function AgentNode({
  id,
  agentType,
  title,
  subtitle,
  description,
  goal,
  model,
  position,
  isSelected = false,
  isActive = false,
  nodeType,
  connectionMode,
  onClick,
  onConnectorClick,
  onDragStart,
  onDrag,
  onDragEnd,
}: AgentNodeProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const nodeRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const getAgentConfig = () => {
    switch (agentType) {
      case 'persona':
        return {
          icon: 'face',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          borderColor: isSelected ? 'border-bm-maroon' : 'border-slate-200',
        }
      case 'policy':
        return {
          icon: 'gavel',
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-700',
          borderColor: isSelected ? 'border-bm-maroon' : 'border-slate-200',
        }
      case 'coaching':
        return {
          icon: 'school',
          bgColor: 'bg-emerald-100',
          textColor: 'text-emerald-700',
          borderColor: isSelected ? 'border-bm-maroon' : 'border-slate-200',
        }
      case 'summarizer':
        return {
          icon: 'summarize',
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-700',
          borderColor: isSelected ? 'border-bm-maroon' : 'border-slate-200',
        }
      case 'integrator':
        return {
          icon: 'hub',
          bgColor: 'bg-indigo-100',
          textColor: 'text-indigo-700',
          borderColor: isSelected ? 'border-bm-maroon' : 'border-slate-200',
        }
      case 'trigger':
        return {
          icon: 'mic',
          bgColor: 'bg-slate-100',
          textColor: 'text-slate-600',
          borderColor: isSelected ? 'border-bm-maroon' : 'border-slate-200',
        }
      default:
        return {
          icon: 'smart_toy',
          bgColor: 'bg-slate-100',
          textColor: 'text-slate-600',
          borderColor: isSelected ? 'border-bm-maroon' : 'border-slate-200',
        }
    }
  }

  const config = getAgentConfig()
  const nodeLabel = nodeType ? nodeType.toUpperCase() : ''

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return // Only handle left mouse button
    if ((e.target as HTMLElement).closest('.node-connector')) return // Don't drag when clicking connectors
    
    const rect = nodeRef.current?.getBoundingClientRect()
    if (!rect) return

    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top
    
    setDragOffset({ x: offsetX, y: offsetY })
    setIsDragging(true)
    isDraggingRef.current = true
    onDragStart?.(id, e)
    
    e.preventDefault()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current) return

    const canvas = nodeRef.current?.closest('section')
    if (!canvas) return

    const canvasRect = canvas.getBoundingClientRect()
    const scrollLeft = canvas.scrollLeft
    const scrollTop = canvas.scrollTop

    const newX = e.clientX - canvasRect.left + scrollLeft - dragOffset.x
    const newY = e.clientY - canvasRect.top + scrollTop - dragOffset.y

    // Constrain to canvas bounds
    const minX = 0
    const minY = 0
    const maxX = Math.max(canvas.scrollWidth - (nodeType === 'trigger' ? 192 : 224), 0)
    const maxY = Math.max(canvas.scrollHeight - 200, 0)

    const constrainedX = Math.max(minX, Math.min(newX, maxX))
    const constrainedY = Math.max(minY, Math.min(newY, maxY))

    onDrag?.(id, { x: constrainedX, y: constrainedY })
  }

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return
    
    setIsDragging(false)
    isDraggingRef.current = false
    onDragEnd?.(id)
  }

  // Attach global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  const handleClick = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      e.stopPropagation()
      return
    }
    onClick?.()
  }

  return (
    <div
      ref={nodeRef}
      className={`absolute bg-white rounded-xl shadow-premium border-2 ${config.borderColor} hover:border-bm-maroon/50 transition-all hover:-translate-y-0.5 z-30 group ${
        isSelected ? 'shadow-node-active' : ''
      } ${isDragging ? 'cursor-grabbing opacity-90' : 'cursor-move'} ${
        isActive ? 'ai-sparkle' : ''
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        minWidth: nodeType === 'trigger' ? '192px' : '224px',
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      {nodeType !== 'trigger' && (
        <NodeConnector
          type="input"
          position="top"
          isActive={isSelected}
          isInConnectionMode={!!connectionMode}
          canConnect={!!connectionMode && connectionMode.fromConnectorType === 'output' && connectionMode.fromNodeId !== id}
          onClick={() => onConnectorClick?.('input', 'top')}
        />
      )}
      <div className={`p-3 border-b ${isSelected ? 'border-bm-maroon/10 bg-gradient-to-r from-bm-maroon/5 to-transparent' : 'border-slate-100 bg-slate-50'} rounded-t-xl flex items-center justify-between`}>
        {nodeLabel && (
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{nodeLabel}</span>
        )}
        {isSelected && (
          <span className="text-[10px] font-bold text-bm-maroon uppercase tracking-wider flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">edit</span>
            Selected
          </span>
        )}
        {isActive && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">Active</span>
        )}
        {!nodeLabel && !isSelected && !isActive && (
          <span className="material-symbols-outlined text-slate-400 text-sm hover:text-bm-maroon cursor-pointer">more_horiz</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-lg ${config.bgColor} ${config.textColor} flex items-center justify-center shadow-sm`}>
            <span className="material-symbols-outlined">{config.icon}</span>
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">{title}</h4>
            {model && <p className="text-[10px] text-slate-500">{model}</p>}
            {subtitle && <p className="text-[10px] text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {goal && (
          <div className="bg-slate-50 rounded p-2 border border-slate-100">
            <p className="text-[10px] text-slate-500 leading-tight">
              <span className="font-bold text-slate-700">Goal:</span> {goal}
            </p>
          </div>
        )}
        {description && <p className="text-xs text-slate-600 mt-2">{description}</p>}
      </div>
      {nodeType !== 'integrator' && (
        <NodeConnector
          type="output"
          position="bottom"
          isActive={isSelected}
          isInConnectionMode={!!connectionMode}
          canConnect={false}
          onClick={() => onConnectorClick?.('output', 'bottom')}
        />
      )}
      {nodeType === 'primary' && (
        <NodeConnector
          type="output"
          position="right"
          isActive={isSelected}
          isInConnectionMode={!!connectionMode}
          canConnect={false}
          onClick={() => onConnectorClick?.('output', 'right')}
          title="Aux Input"
        />
      )}
    </div>
  )
}

