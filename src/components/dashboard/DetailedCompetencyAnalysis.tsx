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
      <h3 className="text-lg font-bold text-bm-text-primary mb-4 flex items-center gap-2 tracking-tight leading-tight">
        <span className="material-symbols-outlined text-bm-maroon">analytics</span>
        Detailed Competency Analysis
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {competencies.map((competency) => {
          const styles = getScoreStyles(competency.scoreType)

          return (
            <div
              key={competency.id}
              className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 ${styles.border} border-l-4 hover:shadow-card transition-all duration-300 group`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-bm-text-primary">{competency.name}</h4>
                  <span className="text-xs text-bm-text-secondary">{competency.subtitle}</span>
                </div>
                <span className={`${styles.badge} text-sm font-bold px-2 py-1 rounded-md`}>
                  {competency.score}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4 overflow-hidden">
                <div className={`${styles.progress} h-1.5 rounded-full`} style={{ width: `${competency.score}%` }}></div>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-xs text-bm-text-secondary">
                  <span className={`material-symbols-outlined text-sm ${styles.iconColor} mt-0.5`}>
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

