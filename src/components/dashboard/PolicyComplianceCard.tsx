'use client'

interface PolicyComplianceCardProps {
  criticalAlerts: number
  findings: {
    type: 'positive' | 'critical'
    text: string
  }[]
  recommendation: string
  adherenceMetrics: {
    label: string
    current: number
    total: number
  }[]
}

export function PolicyComplianceCard({
  criticalAlerts,
  findings,
  recommendation,
  adherenceMetrics,
}: PolicyComplianceCardProps) {
  return (
    <div className="bg-bm-white rounded-xl shadow-card border border-bm-grey/60 overflow-hidden hover:shadow-card-hover transition-all">
      <div className="border-l-[6px] border-l-bm-maroon p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2.5">
            <div className="bg-red-50 p-1.5 rounded-lg text-bm-maroon">
              <span className="material-symbols-outlined text-lg">gavel</span>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-bm-text-primary">Policy Compliance</h4>
              <p className="text-[10px] text-bm-text-secondary">Regulatory & Script Adherence</p>
            </div>
          </div>
          <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-medium text-bm-maroon ring-1 ring-inset ring-red-600/20">
            {criticalAlerts} Critical Alert{criticalAlerts !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <h5 className="text-[10px] font-bold text-bm-text-subtle uppercase mb-2">Findings</h5>
            <ul className="space-y-1.5 text-xs text-bm-text-secondary">
              {findings.map((finding, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span
                    className={`material-symbols-outlined text-xs mt-0.5 ${
                      finding.type === 'positive' ? 'text-green-500' : 'text-bm-maroon'
                    }`}
                  >
                    {finding.type === 'positive' ? 'check_circle' : 'error'}
                  </span>
                  <span dangerouslySetInnerHTML={{ __html: finding.text }}></span>
                </li>
              ))}
            </ul>
            <h5 className="text-[10px] font-bold text-bm-text-subtle uppercase mt-3 mb-2">Recommendations</h5>
            <div className="bg-bm-light-grey p-2.5 rounded-lg text-xs text-bm-text-primary border border-bm-grey/50">
              <p>"{recommendation}"</p>
            </div>
          </div>
          <div className="flex flex-col justify-end">
            <h5 className="text-[10px] font-bold text-bm-text-subtle uppercase mb-2">Script Adherence Rate</h5>
            <div className="bg-bm-light-grey rounded-lg p-3">
              {adherenceMetrics.map((metric, index) => {
                const percentage = (metric.current / metric.total) * 100
                return (
                  <div key={index} className={index > 0 ? 'mt-3' : ''}>
                    <div className="flex justify-between text-[10px] font-bold mb-1 text-bm-text-primary">
                      <span>{metric.label}</span>
                      <span>
                        {metric.current}/{metric.total}
                      </span>
                    </div>
                    <div className="progress-bar-container h-2 w-full">
                      <div
                        className={`progress-bar-fill h-full ${
                          percentage === 100 ? 'bg-feedback-positive' : 'bg-bm-maroon'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

