'use client'

interface MultiAgenticExecutiveSummaryProps {
  overallScore: number
  rating: string
  description: string
  executiveSummary: string
  topStrength: string
  keyOpportunity: string
  duration: string
}

export function MultiAgenticExecutiveSummary({
  overallScore,
  rating,
  description,
  executiveSummary,
  topStrength,
  keyOpportunity,
  duration,
}: MultiAgenticExecutiveSummaryProps) {
  const radius = 64
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (overallScore / 100) * circumference

  return (
    <div className="bg-bm-white rounded-2xl shadow-card p-6 border-l-8 border-l-bm-gold relative overflow-hidden">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-shrink-0 flex flex-col items-center justify-center bg-bm-light-grey/50 p-6 rounded-xl w-full md:w-64 border border-bm-grey">
          <div className="relative w-32 h-32 mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-bm-grey"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              ></path>
              <path
                className="text-bm-gold"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray={`${overallScore}, 100`}
                strokeWidth="3"
              ></path>
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="text-3xl font-extrabold text-bm-text-primary">{overallScore}%</span>
              <span className="block text-xs font-bold text-bm-gold-dark uppercase tracking-wide">Score</span>
            </div>
          </div>
          <div className="text-center">
            <h3 className="font-bold text-bm-maroon text-lg">{rating}</h3>
            <p className="text-xs text-bm-text-secondary mt-1">{description}</p>
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-bm-gold-dark text-2xl">auto_awesome</span>
            <h2 className="text-xl font-bold text-bm-text-primary">Executive Summary</h2>
          </div>
          <p className="text-bm-text-secondary leading-relaxed">{executiveSummary}</p>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-feedback-positive-bg p-3 rounded-lg border border-green-100">
              <p className="text-xs text-feedback-positive font-bold uppercase mb-1">Top Strength</p>
              <p className="text-sm font-bold text-bm-text-primary">{topStrength}</p>
            </div>
            <div className="bg-feedback-warning-bg p-3 rounded-lg border border-bm-gold/20">
              <p className="text-xs text-bm-gold-dark font-bold uppercase mb-1">Key Opportunity</p>
              <p className="text-sm font-bold text-bm-text-primary">{keyOpportunity}</p>
            </div>
            <div className="bg-bm-light-grey p-3 rounded-lg border border-bm-grey">
              <p className="text-xs text-bm-text-subtle font-bold uppercase mb-1">Duration</p>
              <p className="text-sm font-bold text-bm-text-primary">{duration}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

