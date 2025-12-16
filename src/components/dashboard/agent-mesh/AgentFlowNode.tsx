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

  // Get node-specific styling based on nodeType
  const getNodeStyle = () => {
    switch (nodeType) {
      case 'trigger':
        return {
          container: `bg-white rounded-xl shadow-premium border border-slate-200 ${
            isSelected ? 'border-bm-maroon/30 shadow-node-active' : ''
          } hover:border-bm-maroon/50 group transition-all`,
          header: 'bg-slate-50 border-b border-slate-100',
          minWidth: '192px',
        }
      case 'primary':
        return {
          container: `bg-white rounded-xl shadow-premium border-2 ${
            isSelected ? 'border-bm-maroon/20 shadow-node-active' : 'border-slate-200'
          } hover:border-bm-maroon hover:shadow-glow group transition-all`,
          header: isSelected
            ? 'border-b border-bm-maroon/10 bg-gradient-to-r from-bm-maroon/5 to-transparent'
            : 'border-b border-slate-100 bg-slate-50',
          minWidth: '224px',
        }
      case 'validator':
        return {
          container: `bg-white rounded-xl shadow-premium border border-purple-200 ${
            isSelected ? 'border-purple-400 shadow-node-active' : ''
          } hover:border-purple-400 hover:shadow-card-depth group transition-all`,
          header: 'border-b border-purple-100 bg-purple-50/30',
          minWidth: '224px',
        }
      case 'feedback':
        return {
          container: `bg-white rounded-xl shadow-premium border border-emerald-200 ${
            isSelected ? 'border-emerald-400 shadow-node-active' : ''
          } hover:border-emerald-400 hover:shadow-card-depth group transition-all ${isActive ? 'ring-2 ring-emerald-200/50' : ''}`,
          header: 'border-b border-emerald-100 bg-emerald-50/30',
          minWidth: '224px',
        }
      case 'processor':
        return {
          container: `bg-white rounded-xl shadow-premium border border-amber-200 ${
            isSelected ? 'border-amber-400 shadow-node-active' : ''
          } hover:border-amber-400 hover:shadow-card-depth group transition-all`,
          header: 'border-b border-amber-100 bg-amber-50/30',
          minWidth: '224px',
        }
      case 'integrator':
        return {
          container: `bg-white rounded-xl shadow-premium border border-indigo-200 ${
            isSelected ? 'border-indigo-400 shadow-node-active' : ''
          } hover:border-[#6264A7] hover:shadow-lg group transition-all`,
          header: 'border-b border-indigo-50 bg-indigo-50/50',
          minWidth: '208px',
        }
      default:
        return {
          container: `bg-white rounded-xl shadow-premium border-2 ${
            isSelected ? 'border-bm-maroon shadow-node-active' : 'border-slate-200'
          } hover:border-bm-maroon/50 group transition-all`,
          header: 'border-b border-slate-100 bg-slate-50',
          minWidth: '224px',
        }
    }
  }

  const nodeStyle = getNodeStyle()

  return (
    <div
      className={nodeStyle.container}
      style={{ minWidth: nodeStyle.minWidth }}
    >
      {nodeType !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Top}
          className={`!w-3 !h-3 !bg-white !border-2 !rounded-full hover:!border-bm-maroon transition-all ${
            nodeType === 'primary' && isSelected
              ? '!border-bm-maroon !bg-bm-gold'
              : nodeType === 'integrator'
              ? '!border-indigo-400 !bg-indigo-100'
              : '!border-slate-300'
          }`}
        />
      )}
      <div className={`p-3 border-b ${nodeStyle.header} rounded-t-xl flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          {nodeLabel && (
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                nodeType === 'validator'
                  ? 'text-purple-600'
                  : nodeType === 'feedback'
                  ? 'text-emerald-600'
                  : nodeType === 'processor'
                  ? 'text-amber-600'
                  : nodeType === 'integrator'
                  ? 'text-[#6264A7]'
                  : 'text-slate-500'
              }`}
            >
              {nodeLabel}
            </span>
          )}
          {nodeType === 'trigger' && isActive && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isSelected && nodeType === 'primary' && (
            <span className="text-[10px] font-bold text-bm-maroon uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">edit</span>
              Selected
            </span>
          )}
          {isActive && nodeType !== 'trigger' && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
              Active
            </span>
          )}
          {nodeType === 'integrator' && (
            <span className="material-symbols-outlined text-[#6264A7] text-sm">cloud_done</span>
          )}
          {!nodeLabel && !isSelected && !isActive && nodeType !== 'integrator' && (
            <span className="material-symbols-outlined text-slate-400 text-sm hover:text-bm-maroon cursor-pointer">
              more_horiz
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-10 h-10 rounded-lg ${config.bgColor} ${config.textColor} flex items-center justify-center shadow-sm border ${
              nodeType === 'primary'
                ? 'bg-bm-maroon text-white border-bm-maroon'
                : nodeType === 'integrator'
                ? 'bg-[#6264A7] text-white border-[#6264A7]'
                : nodeType === 'feedback' && isActive
                ? 'border-emerald-200 relative overflow-hidden'
                : ''
            } transition-colors`}
          >
            {nodeType === 'feedback' && isActive && (
              <div className="absolute inset-0 bg-white/40 animate-pulse" style={{ animationDuration: '3s' }}></div>
            )}
            <span
              className={`material-symbols-outlined ${nodeType === 'feedback' && isActive ? 'relative z-10' : ''}`}
              style={nodeType === 'integrator' ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {nodeType === 'integrator' ? 'groups' : config.icon}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-slate-900">{title}</h4>
            {model && <p className="text-[10px] text-slate-500">Model: {model}</p>}
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
          className={`!w-3 !h-3 !bg-white !border-2 !rounded-full hover:!border-bm-maroon transition-all ${
            nodeType === 'primary' && isSelected
              ? '!border-bm-maroon !bg-bm-gold'
              : nodeType === 'validator'
              ? '!border-purple-400'
              : nodeType === 'feedback'
              ? '!border-emerald-500'
              : nodeType === 'processor'
              ? '!border-amber-400'
              : '!border-slate-300'
          }`}
        />
      )}
      {nodeType === 'primary' && (
        <Handle
          type="source"
          position={Position.Right}
          className={`!w-3 !h-3 !bg-white !border-2 !rounded-full hover:!border-bm-maroon transition-all ${
            isSelected ? '!border-bm-maroon !bg-bm-gold' : '!border-slate-300'
          }`}
          id="aux-output"
        />
      )}
      {nodeType === 'integrator' && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !bg-indigo-100 !border-2 !border-indigo-400 !rounded-full hover:!border-[#6264A7] transition-all"
        />
      )}
    </div>
  )
}


