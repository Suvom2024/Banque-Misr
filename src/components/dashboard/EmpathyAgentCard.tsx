'use client'

interface EmpathyAgentCardProps {
  score: number
  findings: {
    type: 'positive' | 'warning'
    text: string
  }[]
  recommendation: string
  empathyChart: number[]
}

export function EmpathyAgentCard({ score, findings, recommendation, empathyChart }: EmpathyAgentCardProps) {
  return (
    <div className="bg-bm-white rounded-xl shadow-card border border-bm-grey/60 overflow-hidden hover:shadow-card-hover transition-all">
      <div className="border-l-[6px] border-l-bm-gold p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-bm-gold/10 p-2 rounded-lg text-bm-gold-dark">
              <span className="material-symbols-outlined">psychology</span>
            </div>
            <div>
              <h4 className="font-bold text-bm-text-primary">Empathy Agent</h4>
              <p className="text-xs text-bm-text-secondary">Tone & Sentiment Analysis</p>
            </div>
          </div>
          <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
            Score: {score}/100
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-xs font-bold text-bm-text-subtle uppercase mb-2">Findings</h5>
            <ul className="space-y-2 text-sm text-bm-text-secondary">
              {findings.map((finding, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span
                    className={`material-symbols-outlined text-sm mt-0.5 ${
                      finding.type === 'positive' ? 'text-green-500' : 'text-bm-gold-dark'
                    }`}
                  >
                    {finding.type === 'positive' ? 'check_circle' : 'warning'}
                  </span>
                  <span>{finding.text}</span>
                </li>
              ))}
            </ul>
            <h5 className="text-xs font-bold text-bm-text-subtle uppercase mt-4 mb-2">Recommendations</h5>
            <div className="bg-bm-light-grey p-3 rounded-lg text-sm text-bm-text-primary border border-bm-grey/50">
              <p>"{recommendation}"</p>
            </div>
          </div>
          <div className="flex flex-col justify-end">
            <h5 className="text-xs font-bold text-bm-text-subtle uppercase mb-2">Empathy Over Session</h5>
            <div className="h-24 w-full flex items-end justify-between gap-1 pb-2 border-b border-bm-grey">
              {empathyChart.map((value, index) => (
                <div
                  key={index}
                  className="w-full bg-bm-gold/20 hover:bg-bm-gold/40 rounded-t-sm transition-all"
                  style={{ height: `${value}%` }}
                  title={index === 3 ? 'Peak Empathy' : index === 0 ? 'Start' : ''}
                ></div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-bm-text-subtle mt-1">
              <span>Start</span>
              <span>Middle</span>
              <span>End</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

