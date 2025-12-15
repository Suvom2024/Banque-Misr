'use client'

import { memo } from 'react'

interface Recommendation {
  title: string
  description: string
  icon: string
  tags: string[]
}

interface RecommendedFocusProps {
  recommendation?: Recommendation
}

const defaultRecommendation: Recommendation = {
  title: 'Handling Objections',
  description: 'Detected hesitation in pricing discussions. Improve confidence in high-stakes negotiation.',
  icon: 'handshake',
  tags: ['NEGOTIATION', '5 MIN MODULE'],
}

function RecommendedFocusComponent({ recommendation = defaultRecommendation }: RecommendedFocusProps) {
  return (
    <div className="xl:col-span-5 bg-gradient-to-br from-bm-maroon to-bm-maroon-dark rounded-2xl shadow-card text-white p-8 relative overflow-hidden flex flex-col">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
        <svg className="w-64 h-64" viewBox="0 0 100 100">
          <circle cx="100" cy="0" fill="none" r="80" stroke="white" strokeWidth="20"></circle>
          <circle cx="100" cy="0" fill="none" r="50" stroke="white" strokeWidth="10"></circle>
        </svg>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h2 className="text-xl font-bold tracking-tight leading-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-bm-gold">assistant</span>
            Recommended Focus
          </h2>
          <p className="text-white/70 text-sm mt-1">AI-curated based on your recent gaps.</p>
        </div>
        <button className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors">
          <span className="material-symbols-outlined">refresh</span>
        </button>
      </div>

      {/* Recommendation Card */}
      <div className="flex-grow flex flex-col justify-center relative z-10">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/15 transition-all cursor-pointer group mb-4">
          <div className="flex items-start gap-4">
            <div className="bg-bm-gold text-bm-maroon p-3 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-2xl">{recommendation.icon}</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg text-white mb-1 group-hover:text-bm-gold transition-colors">
                {recommendation.title}
              </h4>
              <p className="text-white/80 text-sm leading-relaxed mb-3">{recommendation.description}</p>
              <div className="flex items-center gap-2">
                {recommendation.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-[10px] font-bold bg-black/20 px-2 py-1 rounded text-white/90"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <span className="material-symbols-outlined text-white/50 group-hover:text-bm-gold group-hover:translate-x-1 transition-all">
              chevron_right
            </span>
          </div>
        </div>
      </div>

      {/* Footer with Indicators and Link */}
      <div className="flex items-center justify-between mt-auto pt-2">
        <div className="flex -space-x-2">
          <div className="w-2 h-2 rounded-full bg-bm-gold"></div>
          <div className="w-2 h-2 rounded-full bg-white/30 ml-3"></div>
          <div className="w-2 h-2 rounded-full bg-white/30 ml-3"></div>
        </div>
        <button className="text-xs font-bold text-bm-gold hover:text-white transition-colors flex items-center gap-1 uppercase tracking-wide">
          View All Suggestions <span className="material-symbols-outlined text-sm">arrow_right_alt</span>
        </button>
      </div>
    </div>
  )
}

export const RecommendedFocus = memo(RecommendedFocusComponent)



