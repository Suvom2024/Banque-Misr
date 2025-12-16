'use client'

import React, { useCallback, useRef, useEffect, useState, useMemo } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
  EdgeTypes,
  BackgroundVariant,
  useReactFlow,
} from 'reactflow'
import { AgentFlowNode } from './AgentFlowNode'
import { ScenarioFlowNode } from './ScenarioFlowNode'
import { CustomEdge } from './CustomEdge'

const nodeTypes: NodeTypes = {
  agentNode: AgentFlowNode,
  scenarioNode: ScenarioFlowNode,
}

const edgeTypes: EdgeTypes = {
  default: CustomEdge,
}

interface ReactFlowCanvasInnerProps {
  initialNodes: Node[]
  initialEdges: Edge[]
  onNodesChange?: (nodes: Node[]) => void
  onEdgesChange?: (edges: Edge[]) => void
  onNodeClick?: (nodeId: string) => void
  onConnect?: (connection: Connection) => void
  onDrop?: (event: React.DragEvent, position: { x: number; y: number }) => void
  onDragOver?: (event: React.DragEvent) => void
  viewMode?: 'mesh' | 'scenario'
}

function ReactFlowCanvasInner({
  initialNodes,
  initialEdges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onConnect,
  onDrop,
  onDragOver,
  viewMode = 'mesh',
}: ReactFlowCanvasInnerProps) {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges)
  const [zoomLevel, setZoomLevel] = useState(100)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { project, fitView, zoomIn, zoomOut, getZoom } = useReactFlow()

  // Sync external nodes/edges changes
  const prevNodesLengthRef = useRef(initialNodes.length)
  const prevNodesIdsRef = useRef<string[]>([])
  
  useEffect(() => {
    const currentIds = initialNodes.map(n => n.id).sort().join(',')
    const prevIds = prevNodesIdsRef.current.sort().join(',')
    
    // Update if nodes changed (length or IDs)
    if (initialNodes.length !== prevNodesLengthRef.current || currentIds !== prevIds) {
      prevNodesLengthRef.current = initialNodes.length
      prevNodesIdsRef.current = initialNodes.map(n => n.id)
      setNodes(initialNodes)
      // Trigger fitView after nodes are updated if we have nodes
      if (initialNodes.length > 0) {
        setTimeout(() => {
          fitView({ padding: 0.2, duration: 300 })
        }, 100)
      }
    }
  }, [initialNodes, setNodes, fitView])

  useEffect(() => {
    setEdges(initialEdges)
  }, [initialEdges, setEdges])

  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChangeInternal(changes)
      // Get current nodes after applying changes
      const currentNodes = nodes.map((node) => {
        const change = changes.find((c: any) => c.id === node.id)
        if (change) {
          if (change.type === 'position' && change.position) {
            return { ...node, position: change.position }
          }
          if (change.type === 'remove') {
            return null
          }
        }
        return node
      }).filter(Boolean) as Node[]
      
      onNodesChange?.(currentNodes)
    },
    [nodes, onNodesChange, onNodesChangeInternal]
  )

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChangeInternal(changes)
      onEdgesChange?.(edges)
    },
    [edges, onEdgesChange, onEdgesChangeInternal]
  )

  const handleConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        const newEdge = addEdge(params, edges)
        setEdges(newEdge)
        onConnect?.(params)
      }
    },
    [edges, setEdges, onConnect]
  )

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeClick?.(node.id)
    },
    [onNodeClick]
  )

  const onDropHandler = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      event.stopPropagation()

      if (!reactFlowWrapper.current) return

      // Reset cursor
      reactFlowWrapper.current.style.cursor = 'grab'

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
      const agentData = event.dataTransfer.getData('application/json')

      if (agentData) {
        // Get the position relative to the ReactFlow viewport
        const position = project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        })
        onDrop?.(event, position)
      }
    },
    [onDrop, project]
  )

  const onDragOverHandler = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      event.stopPropagation()
      // Check if we have agent data
      const hasAgentData = event.dataTransfer.types.includes('application/json')
      if (hasAgentData) {
        event.dataTransfer.dropEffect = 'copy'
        // Add visual feedback by changing cursor
        if (reactFlowWrapper.current) {
          reactFlowWrapper.current.style.cursor = 'copy'
        }
      } else {
        event.dataTransfer.dropEffect = 'none'
      }
      onDragOver?.(event)
    },
    [onDragOver]
  )

  const handleDragLeave = useCallback(() => {
    if (reactFlowWrapper.current) {
      reactFlowWrapper.current.style.cursor = 'grab'
    }
  }, [])

  const handleZoomIn = useCallback(() => {
    zoomIn()
    setTimeout(() => setZoomLevel(Math.round(getZoom() * 100)), 100)
  }, [zoomIn, getZoom])

  const handleZoomOut = useCallback(() => {
    zoomOut()
    setTimeout(() => setZoomLevel(Math.round(getZoom() * 100)), 100)
  }, [zoomOut, getZoom])

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2, duration: 300 })
    setTimeout(() => setZoomLevel(Math.round(getZoom() * 100)), 350)
  }, [fitView, getZoom])

  // Update zoom level when zoom changes
  useEffect(() => {
    const handleZoomChange = () => {
      setZoomLevel(Math.round(getZoom() * 100))
    }
    // Use a small delay to ensure zoom has updated
    const timeoutId = setTimeout(handleZoomChange, 50)
    return () => clearTimeout(timeoutId)
  }, [getZoom, nodes])

  return (
    <div 
      ref={reactFlowWrapper} 
      className="w-full h-full absolute inset-0 canvas-grid cursor-grab active:cursor-grabbing"
      onDrop={onDropHandler}
      onDragOver={onDragOverHandler}
      onDragLeave={handleDragLeave}
      style={{ pointerEvents: 'auto' }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView={false}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        className="bg-slate-50"
        style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
        deleteKeyCode={null}
        multiSelectionKeyCode={null}
      >
        <defs>
          <linearGradient id="grad-gold-maroon" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9B2C3A" />
            <stop offset="100%" stopColor="#E6B328" />
          </linearGradient>
          <linearGradient id="grad-flow-anim" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E6B328" stopOpacity="0" />
            <stop offset="50%" stopColor="#E6B328" stopOpacity="1" />
            <stop offset="100%" stopColor="#9B2C3A" stopOpacity="0" />
          </linearGradient>
          <marker
            id="arrowhead-end"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L6,3 L0,6" fill="#7A1A25" />
          </marker>
        </defs>
        <Background variant={BackgroundVariant.Lines} gap={20} size={1} color="#E2E8F0" lineWidth={1} />
      </ReactFlow>
      {/* Custom Zoom Controls positioned at bottom-left */}
      <div className="absolute bottom-6 left-6 z-40 flex gap-2">
        <div className="bg-white rounded-lg shadow-md border border-slate-200 p-1 flex items-center">
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-slate-50 rounded-md text-slate-500 hover:text-bm-maroon transition-colors"
            title="Zoom Out"
          >
            <span className="material-symbols-outlined text-xl">remove</span>
          </button>
          <span className="text-xs font-bold text-slate-600 w-12 text-center select-none">{zoomLevel}%</span>
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-slate-50 rounded-md text-slate-500 hover:text-bm-maroon transition-colors"
            title="Zoom In"
          >
            <span className="material-symbols-outlined text-xl">add</span>
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md border border-slate-200 p-1 flex items-center">
          <button
            onClick={handleFitView}
            className="p-2 hover:bg-slate-50 rounded-md text-slate-500 hover:text-bm-maroon transition-colors"
            title="Fit to Screen"
          >
            <span className="material-symbols-outlined text-xl">center_focus_strong</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export { ReactFlowCanvasInner }

