'use client'

interface AgentCardProps {
  agentType: 'empathy' | 'policy' | 'pacing' | 'tone'
  title: string
  description: string
  badge?: {
    text: string
    type: 'hint' | 'critical' | 'success'
  }
  timestamp?: string
}

export function AgentCard({ agentType, title, description, badge, timestamp }: AgentCardProps) {
  const getAgentConfig = () => {
    switch (agentType) {
      case 'empathy':
        return {
          borderColor: 'border-l-bm-gold',
          icon: 'psychology',
          iconBg: 'bg-bm-gold/10',
          iconColor: 'text-bm-gold-dark',
          label: 'EMPATHY AGENT',
          labelColor: 'text-bm-gold-dark',
        }
      case 'policy':
        return {
          borderColor: 'border-l-bm-maroon',
          icon: 'gavel',
          iconBg: 'bg-red-50',
          iconColor: 'text-bm-maroon',
          label: 'POLICY COMPLIANCE',
          labelColor: 'text-bm-maroon',
        }
      case 'pacing':
        return {
          borderColor: 'border-l-feedback-positive',
          icon: 'speed',
          iconBg: 'bg-green-50',
          iconColor: 'text-feedback-positive',
          label: 'PACING COACH',
          labelColor: 'text-feedback-positive',
        }
      case 'tone':
        return {
          borderColor: 'border-l-bm-text-subtle',
          icon: 'graphic_eq',
          iconBg: 'bg-gray-100',
          iconColor: 'text-bm-text-subtle',
          label: 'TONE ANALYZER',
          labelColor: 'text-bm-text-subtle',
        }
    }
  }

  const config = getAgentConfig()

  return (
    <div
      className={`bg-white rounded-xl shadow-card p-0 border border-bm-grey/60 ${config.borderColor} border-l-[6px] relative overflow-hidden transition-all hover:shadow-card-hover group ${
        agentType === 'tone' ? 'opacity-75 hover:opacity-100' : ''
      }`}
    >
      <div className="absolute top-0 right-0 p-3 opacity-100">
        <div className={`${config.iconBg} ${config.iconColor} p-1.5 rounded-lg`}>
          <span className="material-symbols-outlined text-lg">{config.icon}</span>
        </div>
      </div>
      <div className="p-4 pt-5">
        <h3 className={`text-xs font-extrabold ${config.labelColor} uppercase tracking-widest mb-2`}>
          {config.label}
        </h3>
        <p className="text-sm font-bold text-bm-text-primary mb-1">{title}</p>
        <p className="text-xs text-bm-text-secondary leading-relaxed mb-3 pr-8">{description}</p>
        {badge && (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold ring-1 ring-inset ${
                badge.type === 'critical'
                  ? 'bg-red-50 text-bm-maroon ring-red-600/20'
                  : badge.type === 'success'
                    ? 'bg-green-50 text-feedback-positive ring-green-600/20'
                    : 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
              }`}
            >
              <span className="material-symbols-outlined text-[10px]">
                {badge.type === 'critical' ? 'warning' : badge.type === 'success' ? 'check_circle' : 'lightbulb'}
              </span>
              {badge.text}
            </span>
          </div>
        )}
        {timestamp && (
          <div className="mt-2 text-[10px] text-bm-text-subtle font-medium">{timestamp}</div>
        )}
      </div>
    </div>
  )
}



