'use client'

interface AIExecutiveSummaryProps {
  overallScore: number
  trend: string
  aiSummary: string
  generatedAt?: string
}

export function AIExecutiveSummary({
  overallScore = 85,
  trend = '+5% vs Last',
  aiSummary = "You demonstrated exceptional empathy and rapport building. Your ability to acknowledge the employee's feelings created a safe environment for feedback. While your clarity was strong, focusing on objection handling techniques like the A-R-C model will refine your approach to resistance.",
  generatedAt = 'Generated just now',
}: AIExecutiveSummaryProps) {
  const circumference = 2 * Math.PI * 80
  const strokeDashoffset = circumference - (overallScore / 100) * circumference
  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Very Good'
    if (score >= 70) return 'Good'
    if (score >= 60) return 'Fair'
    return 'Needs Improvement'
  }

  return (
    <section className="bg-white rounded-2xl shadow-card border border-bm-grey/60 p-0 overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
        <span className="material-symbols-outlined text-[120px] text-bm-maroon">workspace_premium</span>
      </div>
      <div className="p-6 flex flex-col md:flex-row items-center gap-6 z-10 relative">
        {/* Circular Gauge */}
        <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              className="text-bm-grey/30"
              cx="72"
              cy="72"
              fill="transparent"
              r="64"
              stroke="currentColor"
              strokeWidth="6"
            ></circle>
            <circle
              className="text-bm-maroon drop-shadow-md"
              cx="72"
              cy="72"
              fill="transparent"
              r="64"
              stroke="currentColor"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              strokeWidth="6"
            ></circle>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-bm-text-primary tracking-tighter">{overallScore}%</span>
            <span className="text-[10px] font-bold text-bm-text-subtle uppercase tracking-wider mt-0.5">{getScoreLabel(overallScore)}</span>
          </div>
          <div className="absolute -bottom-1.5 bg-white shadow-md border border-bm-grey/50 rounded-full px-2 py-0.5 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-xs text-feedback-positive font-bold">trending_up</span>
            <span className="text-[10px] font-bold text-bm-text-primary">{trend}</span>
          </div>
        </div>

        {/* Summary Content */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center gap-1.5 justify-center md:justify-start mb-1.5">
            <span className="bg-gradient-to-r from-bm-maroon to-bm-maroon-light text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
              AI Executive Summary
            </span>
            <span className="text-[10px] text-bm-text-subtle">{generatedAt}</span>
          </div>
          <h2 className="text-lg font-bold text-bm-text-primary mb-2 leading-tight tracking-tight">
            Impressive leadership presence, Ahmed.
          </h2>
          <p className="text-bm-text-secondary leading-relaxed text-xs">
            {aiSummary.includes('objection handling') ? (
              <>
                {aiSummary.split('objection handling')[0]}
                <span className="font-semibold text-bm-maroon">objection handling</span>
                {aiSummary.split('objection handling')[1]}
              </>
            ) : (
              aiSummary
            )}
          </p>
        </div>
      </div>
    </section>
  )
}

