'use client'

import { Node, Edge, Connection, ReactFlowProvider } from 'reactflow'
import 'reactflow/dist/style.css'
import { ReactFlowCanvasInner } from './ReactFlowCanvasInner'

interface ReactFlowCanvasProps {
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

export function ReactFlowCanvas({ viewMode, ...props }: ReactFlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <ReactFlowCanvasInner viewMode={viewMode} {...props} />
    </ReactFlowProvider>
  )
}

