'use client'

export interface Competency {
  id: string
  name: string
  icon: string
  score: number
  feedback: string
  feedbackType: 'positive' | 'neutral' | 'negative'
}

interface CompetencyBreakdownProps {
  competencies: Competency[]
  onViewFullMetrics?: () => void
}

export function CompetencyBreakdown({ competencies, onViewFullMetrics }: CompetencyBreakdownProps) {
  const getFeedbackStyles = (type: 'positive' | 'neutral' | 'negative') => {
    switch (type) {
      case 'positive':
        return {
          bg: 'bg-feedback-positive-bg/50',
          border: 'border-feedback-positive-bg',
          icon: 'thumb_up',
          iconColor: 'text-feedback-positive',
        }
      case 'neutral':
        return {
          bg: 'bg-feedback-neutral-bg',
          border: 'border-feedback-neutral/20',
          icon: 'lightbulb',
          iconColor: 'text-feedback-neutral',
        }
      case 'negative':
        return {
          bg: 'bg-feedback-negative-bg',
          border: 'border-feedback-negative/10',
          icon: 'warning',
          iconColor: 'text-feedback-negative',
        }
    }
  }

  const getScoreColor = (score: number, type: 'positive' | 'neutral' | 'negative') => {
    if (type === 'neutral') return 'text-bm-gold-dark'
    if (score >= 90) return 'text-bm-maroon'
    if (score >= 80) return 'text-bm-text-primary'
    return 'text-bm-text-primary'
  }

  const getProgressColor = (score: number, type: 'positive' | 'neutral' | 'negative') => {
    if (type === 'neutral') return 'bg-bm-gold'
    if (score >= 90) return 'bg-feedback-positive'
    if (score >= 80) return 'bg-bm-maroon'
    return 'bg-bm-maroon'
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-bm-text-primary tracking-tight leading-tight">Competency Breakdown</h3>
        {onViewFullMetrics && (
          <button
            onClick={onViewFullMetrics}
            className="text-sm text-bm-maroon font-semibold hover:underline flex items-center gap-1"
          >
            View Full Metrics <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {competencies.map((competency) => {
          const styles = getFeedbackStyles(competency.feedbackType)
          const scoreColor = getScoreColor(competency.score, competency.feedbackType)
          const progressColor = getProgressColor(competency.score, competency.feedbackType)

          return (
            <div
              key={competency.id}
              className={`bg-white rounded-2xl shadow-card border border-bm-grey/60 p-5 flex flex-col justify-between hover:border-bm-gold/50 transition-all ${
                competency.feedbackType === 'neutral' ? 'border-l-4 border-l-bm-gold' : ''
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-bm-light-grey rounded-lg text-bm-maroon">
                      <span className="material-symbols-outlined text-[20px]">{competency.icon}</span>
                    </div>
                    <span className="font-bold text-bm-text-primary">{competency.name}</span>
                  </div>
                  <span className={`text-xl font-black ${scoreColor}`}>{competency.score}%</span>
                </div>
                <div className="w-full bg-bm-grey/40 rounded-full h-2 mb-4 overflow-hidden">
                  <div className={`${progressColor} h-2 rounded-full`} style={{ width: `${competency.score}%` }}></div>
                </div>
                <div className={`flex items-start gap-2 ${styles.bg} p-2.5 rounded-lg border ${styles.border}`}>
                  <span className={`material-symbols-filled ${styles.iconColor} text-sm mt-0.5`}>{styles.icon}</span>
                  <p className="text-xs text-bm-text-secondary font-medium leading-snug">{competency.feedback}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

