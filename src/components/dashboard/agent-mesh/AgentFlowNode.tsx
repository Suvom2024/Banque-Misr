'use client'

import { Handle, Position, NodeProps } from 'reactflow'
import { NodeConnector } from './NodeConnector'

interface AgentFlowNodeData {
  agentType: 'persona' | 'policy' | 'coaching' | 'summarizer' | 'integrator' | 'trigger'
  title: string
  subtitle?: string
  description?: string
  goal?: string
  model?: string
  nodeType?: 'trigger' | 'primary' | 'validator' | 'feedback' | 'processor' | 'integrator'
  isSelected?: boolean
  isActive?: boolean
}

export function AgentFlowNode({ data, selected }: NodeProps<AgentFlowNodeData>) {
  const { agentType, title, subtitle, model, goal, nodeType, isActive } = data
  const isSelected = selected

  const getAgentConfig = () => {
    switch (agentType) {
      case 'persona':
        return {
          icon: 'face',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
        }
      case 'policy':
        return {
          icon: 'gavel',
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-700',
        }
      case 'coaching':
        return {
          icon: 'school',
          bgColor: 'bg-emerald-100',
          textColor: 'text-emerald-700',
        }
      case 'summarizer':
        return {
          icon: 'summarize',
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-700',
        }
      case 'integrator':
        return {
          icon: 'hub',
          bgColor: 'bg-indigo-100',
          textColor: 'text-indigo-700',
        }
      case 'trigger':
        return {
          icon: 'mic',
          bgColor: 'bg-slate-100',
          textColor: 'text-slate-600',
        }
      default:
        return {
          icon: 'smart_toy',
          bgColor: 'bg-slate-100',
          textColor: 'text-slate-600',
        }
    }
  }

  const config = getAgentConfig()
  const nodeLabel = nodeType ? nodeType.toUpperCase() : ''

  return (
    <div
      className={`bg-white rounded-xl shadow-premium border-2 ${
        isSelected ? 'border-bm-maroon shadow-node-active' : 'border-slate-200'
      } hover:border-bm-maroon/50 transition-all hover:-translate-y-0.5 group ${isActive ? 'ai-sparkle' : ''}`}
      style={{ minWidth: nodeType === 'trigger' ? '192px' : '224px' }}
    >
      {nodeType !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !bg-white !border-2 !border-slate-300 !rounded-full hover:!border-bm-maroon hover:!scale-125 transition-all"
        />
      )}
      <div
        className={`p-3 border-b ${
          isSelected ? 'border-bm-maroon/10 bg-gradient-to-r from-bm-maroon/5 to-transparent' : 'border-slate-100 bg-slate-50'
        } rounded-t-xl flex items-center justify-between`}
      >
        {nodeLabel && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{nodeLabel}</span>}
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
          <span className="material-symbols-outlined text-slate-400 text-sm hover:text-bm-maroon cursor-pointer">
            more_horiz
          </span>
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
      </div>
      {nodeType !== 'integrator' && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !bg-white !border-2 !border-slate-300 !rounded-full hover:!border-bm-maroon hover:!scale-125 transition-all"
        />
      )}
      {nodeType === 'primary' && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-white !border-2 !border-slate-300 !rounded-full hover:!border-bm-maroon hover:!scale-125 transition-all"
          id="aux-output"
        />
      )}
    </div>
  )
}

