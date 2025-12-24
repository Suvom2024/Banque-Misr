'use client'

interface ExecutiveSummaryCardProps {
  overallScore: number
  trend: string
  executiveSummary: string
  keyTakeaways: string[]
}

export function ExecutiveSummaryCard({
  overallScore = 85,
  trend = '+12% vs Last Session',
  executiveSummary = "Impressive progress, Ahmed. The AI analysis indicates you've significantly improved your empathy markers during objection handling. While your tone remained professional, there were moments where pacing accelerated under pressure. Focusing on pause utilization will push this score into the 90s.",
  keyTakeaways = ['Strong Tone', 'Clear Articulation', 'Pace Regulation Needed'],
}: ExecutiveSummaryCardProps) {
  const circumference = 2 * Math.PI * 70
  const strokeDashoffset = circumference - (overallScore / 100) * circumference

  return (
    <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <span className="material-symbols-outlined text-7xl text-bm-maroon">psychology</span>
      </div>
      <div className="flex flex-col md:flex-row gap-6 items-center relative z-10">
        {/* Circular Gauge */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" fill="none" r="56" stroke="#F3F4F6" strokeWidth="10"></circle>
            <circle
              className="drop-shadow-md"
              cx="64"
              cy="64"
              fill="none"
              r="56"
              stroke="#7A1A25"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              strokeWidth="10"
            ></circle>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-bm-text-primary tracking-tighter">
              {overallScore}
              <span className="text-lg">%</span>
            </span>
            <span className="text-[10px] font-bold text-bm-text-secondary uppercase tracking-wider mt-1">Score</span>
          </div>
        </div>

        {/* Summary Content */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-bm-text-primary tracking-tight leading-tight">Executive Summary</h2>
            <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-green-100">
              <span className="material-symbols-outlined text-xs">trending_up</span>
              {trend}
            </div>
          </div>
          <p className="text-bm-text-secondary leading-relaxed text-xs">
            <span className="font-bold text-bm-maroon">Impressive progress, Ahmed.</span>{' '}
            {executiveSummary.replace('Impressive progress, Ahmed. ', '')}
          </p>
          <div className="flex gap-3 pt-1">
            {keyTakeaways.map((takeaway, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    index === keyTakeaways.length - 1 ? 'bg-bm-maroon' : 'bg-bm-gold'
                  }`}
                ></span>
                <span className="text-[10px] font-medium text-bm-text-secondary">{takeaway}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

