'use client'

import { Handle, Position, NodeProps } from 'reactflow'

interface ScenarioFlowNodeData {
  type: 'ai-persona' | 'trainee-response' | 'ai-response-positive' | 'ai-response-negative'
  title: string
  content: string
  logicRule?: string
  expectedIntent?: string
  branchLabel?: 'Correct' | 'Incorrect'
}

export function ScenarioFlowNode({ data, selected }: NodeProps<ScenarioFlowNodeData>) {
  const { type, title, content, logicRule, expectedIntent, branchLabel } = data
  const isSelected = selected

  const getNodeStyles = () => {
    switch (type) {
      case 'ai-persona':
        return {
          bgColor: 'bg-bm-white',
          borderColor: isSelected ? 'border-bm-maroon' : 'border-bm-maroon/20',
          headerBg: 'bg-bm-maroon/5',
          headerBorder: 'border-bm-maroon/10',
          iconColor: 'text-bm-maroon',
          titleColor: 'text-bm-maroon',
        }
      case 'trainee-response':
        return {
          bgColor: 'bg-bm-white',
          borderColor: isSelected ? 'border-bm-gold' : 'border-bm-gold',
          headerBg: 'bg-bm-gold/10',
          headerBorder: 'border-bm-gold/20',
          iconColor: 'text-bm-gold-dark',
          titleColor: 'text-bm-text-primary',
        }
      case 'ai-response-positive':
        return {
          bgColor: 'bg-feedback-positive-bg',
          borderColor: isSelected ? 'border-green-600' : 'border-green-200',
          headerBg: 'bg-white',
          headerBorder: 'border-green-100',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800',
        }
      case 'ai-response-negative':
        return {
          bgColor: 'bg-feedback-negative-bg',
          borderColor: isSelected ? 'border-red-600' : 'border-red-200',
          headerBg: 'bg-white',
          headerBorder: 'border-red-100',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
        }
      default:
        return {
          bgColor: 'bg-bm-white',
          borderColor: 'border-slate-200',
          headerBg: 'bg-slate-50',
          headerBorder: 'border-slate-100',
          iconColor: 'text-slate-600',
          titleColor: 'text-slate-800',
        }
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'ai-persona':
        return 'smart_toy'
      case 'trainee-response':
        return 'record_voice_over'
      case 'ai-response-positive':
        return 'sentiment_satisfied'
      case 'ai-response-negative':
        return 'warning'
      default:
        return 'circle'
    }
  }

  const styles = getNodeStyles()
  const icon = getIcon()

  return (
    <div
      className={`${styles.bgColor} rounded-xl border-2 ${styles.borderColor} p-0 shadow-soft cursor-grab active:cursor-grabbing ${
        type === 'trainee-response' ? 'shadow-glow' : ''
      }`}
      style={{ minWidth: type === 'trainee-response' ? '384px' : '320px' }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-bm-grey !border-2 !border-white !rounded-full hover:!border-bm-maroon hover:!scale-125 transition-all"
      />
      <div className={`${styles.headerBg} p-3 rounded-t-xl border-b ${styles.headerBorder} flex justify-between items-center`}>
        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined ${styles.iconColor} text-lg`}>{icon}</span>
          <span className={`font-bold text-sm ${styles.titleColor}`}>{title}</span>
        </div>
        {type === 'trainee-response' && (
          <span className="bg-bm-gold text-bm-maroon text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Logic Node
          </span>
        )}
        {!type.includes('response') && (
          <span className="material-symbols-outlined text-bm-text-subtle text-lg cursor-pointer">more_horiz</span>
        )}
      </div>
      <div className="p-4">
        {type === 'trainee-response' ? (
          <div className="space-y-3">
            {expectedIntent && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-bm-text-secondary">Expected Intent:</span>
                <span className="font-semibold text-bm-maroon">{expectedIntent}</span>
              </div>
            )}
            {logicRule && (
              <div className="w-full bg-bm-light-grey rounded p-2 text-xs text-bm-text-subtle border border-dashed border-bm-grey">
                <span className="font-bold">Logic:</span> {logicRule}
              </div>
            )}
          </div>
        ) : (
          <p className={`text-sm ${type.includes('response') ? 'text-bm-text-secondary' : 'text-bm-text-secondary italic'}`}>
            {content}
          </p>
        )}
      </div>
      {type !== 'ai-persona' && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-2 !h-2 !bg-bm-grey !border-2 !border-white !rounded-full hover:!border-bm-maroon hover:!scale-125 transition-all"
        />
      )}
      {type === 'trainee-response' && (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="correct"
            className="!w-2 !h-2 !bg-green-500 !border-2 !border-white !rounded-full"
            style={{ left: '30%' }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="incorrect"
            className="!w-2 !h-2 !bg-red-500 !border-2 !border-white !rounded-full"
            style={{ left: '70%' }}
          />
        </>
      )}
    </div>
  )
}

