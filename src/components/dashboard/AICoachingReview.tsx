'use client'

export interface AICoachingRecommendation {
  id: string
  icon: string
  title: string
  description: string
  actionType: 'drill' | 'resource'
  actionLabel: string
}

interface AICoachingReviewProps {
  recommendations: AICoachingRecommendation[]
  onStartDrill?: (id: string) => void
  onViewResource?: (id: string) => void
}

export function AICoachingReview({
  recommendations,
  onStartDrill,
  onViewResource,
}: AICoachingReviewProps) {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="material-symbols-outlined text-bm-gold text-2xl">auto_awesome</span>
        <h3 className="font-bold text-lg text-bm-text-primary tracking-tight leading-tight">AI Coaching</h3>
      </div>
      <div className="space-y-4">
        {recommendations.map((recommendation) => (
          <div
            key={recommendation.id}
            className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:border-bm-gold/50 transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="bg-white p-2 rounded-lg shadow-sm text-bm-maroon border border-gray-100">
                <span className="material-symbols-outlined">{recommendation.icon}</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-bm-text-primary">{recommendation.title}</h4>
                <p className="text-xs text-bm-text-secondary mt-1 leading-snug">{recommendation.description}</p>
              </div>
            </div>
            {recommendation.actionType === 'drill' ? (
              <button
                onClick={() => onStartDrill?.(recommendation.id)}
                className="mt-3 w-full py-2 bg-bm-gold/10 text-bm-maroon hover:bg-bm-gold hover:text-bm-maroon-dark text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                {recommendation.actionLabel}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            ) : (
              <button
                onClick={() => onViewResource?.(recommendation.id)}
                className="mt-3 w-full py-2 bg-bm-gold/10 text-bm-maroon hover:bg-bm-gold hover:text-bm-maroon-dark text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                {recommendation.actionLabel}
                <span className="material-symbols-outlined text-sm">visibility</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

