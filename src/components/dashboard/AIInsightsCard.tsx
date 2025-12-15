'use client'

export interface AIInsight {
  type: 'opportunity' | 'recognition' | 'alert'
  icon: string
  title: string
  description: string
  action?: string
  onAction?: () => void
}

interface AIInsightsCardProps {
  insights?: AIInsight[]
}

const defaultInsights: AIInsight[] = [
  {
    type: 'opportunity',
    icon: 'stars',
    title: 'Targeted Training Opportunity',
    description:
      'Consider scheduling a "De-escalation Workshop" for Team B. Their sentiment scores drop 15% after minute 3 of calls.',
    action: 'Schedule Now',
  },
  {
    type: 'recognition',
    icon: 'emoji_events',
    title: 'Recognition Alert',
    description: 'Fatima has shown consistent improvement (5 weeks streak) in Negotiation. Worth a commendation.',
  },
]

export function AIInsightsCard({ insights = defaultInsights }: AIInsightsCardProps) {
  const getIconColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'opportunity':
        return 'text-bm-gold'
      case 'recognition':
        return 'text-bm-success'
      case 'alert':
        return 'text-bm-danger'
      default:
        return 'text-bm-text-subtle'
    }
  }

  return (
    <div className="bg-gradient-to-b from-bm-white to-bm-light-grey rounded-2xl shadow-card border border-bm-gold/30 p-6 relative overflow-hidden card-transition group">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-bm-gold/10 rounded-full blur-3xl group-hover:bg-bm-gold/20 transition-all"></div>
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-bm-maroon">lightbulb</span>
        <h2 className="text-lg font-bold text-bm-maroon">AI Strategic Insights</h2>
      </div>
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index}>
            {index > 0 && <div className="w-full h-px bg-bm-grey/60 mb-4"></div>}
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <span className={`material-symbols-outlined text-xl ${getIconColor(insight.type)}`}>
                  {insight.icon}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-bm-text-primary font-semibold">{insight.title}</p>
                <p className="text-xs text-bm-text-secondary mt-1 leading-relaxed">{insight.description}</p>
                {insight.action && (
                  <button
                    className="mt-2 text-xs font-bold text-bm-maroon hover:text-bm-maroon-dark flex items-center gap-1 transition-colors"
                    onClick={insight.onAction}
                  >
                    {insight.action} <span className="material-symbols-outlined text-[10px]">arrow_forward_ios</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

