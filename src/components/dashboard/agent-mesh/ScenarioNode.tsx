'use client'

interface ScenarioNodeProps {
  id: string
  type: 'ai-persona' | 'trainee-response' | 'ai-response'
  title: string
  content: string
  position: { x: number; y: number }
  isSelected?: boolean
  responseType?: 'positive' | 'negative'
  logicRule?: string
  onClick?: () => void
}

export function ScenarioNode({
  id,
  type,
  title,
  content,
  position,
  isSelected = false,
  responseType,
  logicRule,
  onClick,
}: ScenarioNodeProps) {
  const getNodeConfig = () => {
    switch (type) {
      case 'ai-persona':
        return {
          bgColor: 'bg-bm-white',
          borderColor: isSelected ? 'border-bm-maroon' : 'border-bm-maroon/20',
          headerBg: 'bg-bm-maroon/5',
          headerBorder: 'border-bm-maroon/10',
          icon: 'smart_toy',
          iconColor: 'text-bm-maroon',
        }
      case 'trainee-response':
        return {
          bgColor: 'bg-bm-white',
          borderColor: isSelected ? 'border-bm-gold' : 'border-bm-gold',
          headerBg: 'bg-bm-gold/10',
          headerBorder: 'border-bm-gold/20',
          icon: 'record_voice_over',
          iconColor: 'text-bm-gold-dark',
        }
      case 'ai-response':
        return {
          bgColor: responseType === 'positive' ? 'bg-feedback-positive-bg' : 'bg-feedback-negative-bg',
          borderColor: responseType === 'positive' ? 'border-green-200' : 'border-red-200',
          headerBg: responseType === 'positive' ? 'bg-green-50' : 'bg-red-50',
          headerBorder: responseType === 'positive' ? 'border-green-100' : 'border-red-100',
          icon: responseType === 'positive' ? 'sentiment_satisfied' : 'warning',
          iconColor: responseType === 'positive' ? 'text-green-600' : 'text-red-600',
        }
      default:
        return {
          bgColor: 'bg-bm-white',
          borderColor: 'border-slate-200',
          headerBg: 'bg-slate-50',
          headerBorder: 'border-slate-100',
          icon: 'smart_toy',
          iconColor: 'text-slate-600',
        }
    }
  }

  const config = getNodeConfig()

  return (
    <div
      className={`absolute ${config.bgColor} rounded-xl border-2 ${config.borderColor} shadow-soft cursor-grab active:cursor-grabbing node-card z-10`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: type === 'trainee-response' ? '384px' : '320px',
      }}
      onClick={onClick}
    >
      {/* Top connector */}
      {type !== 'ai-persona' && (
        <div className="h-2 w-2 bg-bm-grey rounded-full absolute -top-1 left-1/2 -translate-x-1/2 border border-white"></div>
      )}
      <div className={`p-3 rounded-t-xl border-b ${config.headerBorder} flex justify-between items-center ${config.headerBg}`}>
        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined ${config.iconColor} text-lg`}>{config.icon}</span>
          <span className={`font-bold text-sm ${type === 'ai-response' ? (responseType === 'positive' ? 'text-green-800' : 'text-red-800') : 'text-bm-maroon'}`}>
            {title}
          </span>
        </div>
        {type === 'trainee-response' && (
          <span className="bg-bm-gold text-bm-maroon text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Logic Node
          </span>
        )}
        {type !== 'trainee-response' && (
          <span className="material-symbols-outlined text-bm-text-subtle text-lg cursor-pointer">more_horiz</span>
        )}
      </div>
      <div className="p-4">
        {type === 'trainee-response' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-bm-text-secondary">Expected Intent:</span>
              <span className="font-semibold text-bm-maroon">Empathy & Solution</span>
            </div>
            {logicRule && (
              <div className="w-full bg-bm-light-grey rounded p-2 text-xs text-bm-text-subtle border border-dashed border-bm-grey">
                <span className="font-bold">Logic:</span> {logicRule}
              </div>
            )}
          </div>
        ) : (
          <p className={`text-sm ${type === 'ai-response' ? 'text-bm-text-secondary' : 'text-bm-text-secondary italic'}`}>
            {content}
          </p>
        )}
      </div>
      {/* Bottom connector */}
      {type !== 'ai-response' && (
        <div className="h-2 w-2 bg-bm-grey rounded-full absolute -bottom-1 left-1/2 -translate-x-1/2 border border-white"></div>
      )}
    </div>
  )
}

