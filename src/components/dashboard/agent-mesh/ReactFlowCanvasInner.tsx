'use client'

import React, { useCallback, useRef, useEffect } from 'react'
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
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { project, fitView } = useReactFlow()

  // Sync external nodes/edges changes
  useEffect(() => {
    setNodes(initialNodes)
    // Trigger fitView after nodes are updated
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 300 })
    }, 100)
  }, [initialNodes, setNodes, fitView])

  useEffect(() => {
    setEdges(initialEdges)
  }, [initialEdges, setEdges])

  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChangeInternal(changes)
      // Notify parent of changes
      const updatedNodes = nodes.map((node) => {
        const change = changes.find((c: any) => c.id === node.id)
        if (change && change.type === 'position' && change.position) {
          return { ...node, position: change.position }
        }
        return node
      })
      onNodesChange?.(updatedNodes)
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

      if (!reactFlowWrapper.current) return

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
      const agentData = event.dataTransfer.getData('application/json')

      if (agentData) {
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
      event.dataTransfer.dropEffect = 'copy'
      onDragOver?.(event)
    },
    [onDragOver]
  )

  return (
    <div ref={reactFlowWrapper} className="w-full h-full absolute inset-0">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        onDrop={onDropHandler}
        onDragOver={onDragOverHandler}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        className="bg-slate-50"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          {React.createElement('linearGradient', { id: 'grad-gold-maroon', x1: '0%', y1: '0%', x2: '100%', y2: '0%' },
            React.createElement('stop', { offset: '0%', stopColor: '#FFC72C' }),
            React.createElement('stop', { offset: '100%', stopColor: '#7A1A25' })
          )}
          {React.createElement('linearGradient', { id: 'grad-flow-anim', x1: '0%', y1: '0%', x2: '100%', y2: '0%' },
            React.createElement('stop', { offset: '0%', stopColor: '#FFC72C', stopOpacity: 0.8 }),
            React.createElement('stop', { offset: '50%', stopColor: '#FFC72C', stopOpacity: 1 }),
            React.createElement('stop', { offset: '100%', stopColor: '#7A1A25', stopOpacity: 0.8 })
          )}
          {React.createElement('marker', {
            id: 'arrowhead-end',
            markerWidth: '10',
            markerHeight: '10',
            refX: '9',
            refY: '3',
            orient: 'auto',
            markerUnits: 'strokeWidth'
          },
            React.createElement('path', { d: 'M0,0 L0,6 L9,3 z', fill: '#7A1A25' })
          )}
        </defs>
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#E2E8F0" />
        <Controls className="bg-white border border-slate-200 rounded-lg shadow-md" />
      </ReactFlow>
    </div>
  )
}

export { ReactFlowCanvasInner }

