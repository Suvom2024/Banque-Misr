'use client'

import { ScenarioNode } from './ScenarioNode'
import { ZoomControls } from './ZoomControls'

interface ScenarioNodeData {
  id: string
  type: 'ai-persona' | 'trainee-response' | 'ai-response'
  title: string
  content: string
  position: { x: number; y: number }
  isSelected?: boolean
  responseType?: 'positive' | 'negative'
  logicRule?: string
}

interface ScenarioCanvasProps {
  nodes: ScenarioNodeData[]
  onNodeClick?: (nodeId: string) => void
}

export function ScenarioCanvas({ nodes, onNodeClick }: ScenarioCanvasProps) {
  return (
    <section className="flex-grow relative bg-slate-50 overflow-hidden flex flex-col group">
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundSize: '20px 20px',
          backgroundImage: 'radial-gradient(#E5E7EB 1px, transparent 1px)',
        }}
      ></div>
      {/* Canvas Toolbar */}
      <div className="absolute top-6 left-6 z-10 flex gap-2">
        <div className="bg-bm-white shadow-card rounded-lg p-1.5 flex gap-1 border border-bm-grey">
          <button className="flex items-center gap-2 px-3 py-2 rounded hover:bg-bm-light-grey text-bm-text-secondary font-semibold text-sm transition-colors">
            <span className="material-symbols-outlined text-[20px]">add_box</span>
            Add Step
          </button>
          <div className="w-px bg-bm-grey my-1"></div>
          <button className="flex items-center gap-2 px-3 py-2 rounded hover:bg-bm-light-grey text-bm-text-secondary font-semibold text-sm transition-colors">
            <span className="material-symbols-outlined text-[20px]">call_split</span>
            Add Branch
          </button>
          <div className="w-px bg-bm-grey my-1"></div>
          <button className="flex items-center gap-2 px-3 py-2 rounded hover:bg-bm-light-grey text-bm-text-secondary font-semibold text-sm transition-colors">
            <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            AI Generate
          </button>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-6 left-6 z-10">
        <div className="bg-bm-white shadow-card rounded-lg flex flex-col border border-bm-grey overflow-hidden">
          <button className="p-2 hover:bg-bm-light-grey text-bm-text-secondary">
            <span className="material-symbols-outlined">add</span>
          </button>
          <button className="p-2 hover:bg-bm-light-grey text-bm-text-secondary">
            <span className="material-symbols-outlined">remove</span>
          </button>
          <button className="p-2 hover:bg-bm-light-grey text-bm-text-secondary border-t border-bm-grey">
            <span className="material-symbols-outlined">center_focus_strong</span>
          </button>
        </div>
      </div>

      {/* Minimap */}
      <div className="absolute bottom-6 right-6 z-10 w-48 h-32 bg-bm-white shadow-card border-2 border-bm-grey rounded-lg overflow-hidden opacity-90 hover:opacity-100 transition-opacity">
        <div className="w-full h-full bg-slate-100 relative">
          <div className="absolute top-4 left-10 w-8 h-6 bg-bm-maroon/20 rounded-sm"></div>
          <div className="absolute top-14 left-10 w-8 h-6 bg-bm-grey rounded-sm"></div>
          <div className="absolute top-24 left-4 w-8 h-6 bg-green-200 rounded-sm"></div>
          <div className="absolute top-24 left-16 w-8 h-6 bg-red-200 rounded-sm"></div>
          <div className="absolute top-0 left-0 w-32 h-24 border-2 border-bm-gold bg-bm-gold/10 rounded-sm"></div>
        </div>
      </div>

      {/* Canvas with nodes */}
      <div className="w-full h-full relative overflow-auto" id="scenario-canvas">
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" style={{ minWidth: '1000px', minHeight: '800px' }}>
          <defs>
            <marker id="arrowhead-scenario" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
              <polygon fill="#9CA3AF" points="0 0, 10 3.5, 0 7"></polygon>
            </marker>
          </defs>
          {/* Connection paths */}
          <path
            d="M 500 180 C 500 230, 500 230, 500 280"
            fill="none"
            markerEnd="url(#arrowhead-scenario)"
            stroke="#9CA3AF"
            strokeWidth="2"
          ></path>
          <path
            className="connector-path"
            d="M 500 420 C 500 470, 300 470, 300 520"
            fill="none"
            markerEnd="url(#arrowhead-scenario)"
            stroke="#9CA3AF"
            strokeWidth="2"
            style={{
              strokeDasharray: '10',
              animation: 'dash 30s linear infinite',
            }}
          ></path>
          <path
            d="M 500 420 C 500 470, 700 470, 700 520"
            fill="none"
            markerEnd="url(#arrowhead-scenario)"
            stroke="#9CA3AF"
            strokeWidth="2"
          ></path>
          {/* Branch labels */}
          <rect fill="white" height="24" rx="12" stroke="#E5E7EB" width="80" x="360" y="460"></rect>
          <text fill="#16A34A" fontFamily="Manrope" fontSize="11" fontWeight="bold" textAnchor="middle" x="400" y="476">
            Correct
          </text>
          <rect fill="white" height="24" rx="12" stroke="#E5E7EB" width="80" x="560" y="460"></rect>
          <text fill="#DC2626" fontFamily="Manrope" fontSize="11" fontWeight="bold" textAnchor="middle" x="600" y="476">
            Incorrect
          </text>
        </svg>
        <div className="absolute inset-0 z-10" style={{ minWidth: '1000px', minHeight: '800px' }}>
          {nodes.map((node) => (
            <ScenarioNode
              key={node.id}
              id={node.id}
              type={node.type}
              title={node.title}
              content={node.content}
              position={node.position}
              isSelected={node.isSelected}
              responseType={node.responseType}
              logicRule={node.logicRule}
              onClick={() => onNodeClick?.(node.id)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

