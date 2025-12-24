'use client'

export interface DetailedCompetency {
  id: string
  name: string
  subtitle: string
  score: number
  feedback: string
  scoreType: 'green' | 'yellow' | 'red'
}

interface DetailedCompetencyAnalysisProps {
  competencies: DetailedCompetency[]
}

export function DetailedCompetencyAnalysis({ competencies }: DetailedCompetencyAnalysisProps) {
  const getScoreStyles = (type: 'green' | 'yellow' | 'red') => {
    switch (type) {
      case 'green':
        return {
          border: 'border-l-score-green',
          badge: 'bg-green-100 text-green-700',
          progress: 'bg-score-green',
          icon: 'check_circle',
          iconColor: 'text-score-green',
        }
      case 'yellow':
        return {
          border: 'border-l-score-yellow',
          badge: 'bg-yellow-100 text-yellow-700',
          progress: 'bg-score-yellow',
          icon: 'arrow_circle_up',
          iconColor: 'text-bm-maroon',
        }
      case 'red':
        return {
          border: 'border-l-score-red',
          badge: 'bg-red-100 text-red-700',
          progress: 'bg-score-red',
          icon: 'warning',
          iconColor: 'text-bm-maroon',
        }
    }
  }

  return (
    <div>
      <h3 className="text-base font-bold text-bm-text-primary mb-4 flex items-center gap-2 tracking-tight leading-tight">
        <span className="material-symbols-outlined text-bm-maroon text-lg">analytics</span>
        Detailed Competency Analysis
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {competencies.map((competency) => {
          const styles = getScoreStyles(competency.scoreType)

          return (
            <div
              key={competency.id}
              className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 ${styles.border} border-l-4 hover:shadow-card transition-all duration-300 group`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-sm text-bm-text-primary">{competency.name}</h4>
                  <span className="text-[10px] text-bm-text-secondary">{competency.subtitle}</span>
                </div>
                <span className={`${styles.badge} text-xs font-bold px-2 py-0.5 rounded-md`}>
                  {competency.score}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3 overflow-hidden">
                <div className={`${styles.progress} h-1.5 rounded-full`} style={{ width: `${competency.score}%` }}></div>
              </div>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2 text-[10px] text-bm-text-secondary">
                  <span className={`material-symbols-outlined text-xs ${styles.iconColor} mt-0.5`}>
                    {styles.icon}
                  </span>
                  {competency.feedback}
                </li>
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}

