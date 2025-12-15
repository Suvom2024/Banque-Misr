'use client'

interface ScenarioProgressBarProps {
  currentTurn: number
  totalTurns: number
  isQuizActive?: boolean
  quizNumber?: number
  totalQuizzes?: number
}

export function ScenarioProgressBar({
  currentTurn,
  totalTurns,
  isQuizActive = false,
  quizNumber,
  totalQuizzes,
}: ScenarioProgressBarProps) {
  const segments = Array.from({ length: totalTurns }, (_, i) => i + 1)
  const isActive = (index: number) => index === currentTurn
  const isCompleted = (index: number) => index < currentTurn

  return (
    <div className="mb-6 px-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-bm-maroon uppercase tracking-wider">Scenario Progress</span>
          {isQuizActive && (
            <span className="px-2 py-0.5 rounded-full bg-bm-gold/20 text-bm-maroon text-[10px] font-bold border border-bm-gold/30">
              Quiz Active
            </span>
          )}
        </div>
        <span className="text-xs font-semibold text-bm-text-secondary">
          Turn {currentTurn} of {totalTurns}
          {isQuizActive && quizNumber && totalQuizzes && (
            <span className="text-bm-maroon font-bold"> • Quiz {quizNumber}/{totalQuizzes}</span>
          )}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {segments.map((segment, index) => {
          const segmentIndex = index + 1
          const completed = isCompleted(segmentIndex)
          const active = isActive(segmentIndex)
          const isQuizSegment = isQuizActive && active

          return (
            <div
              key={segment}
              className={`h-2 flex-1 ${
                segmentIndex === 1
                  ? 'rounded-l-full'
                  : segmentIndex === totalTurns
                    ? 'rounded-r-full'
                    : ''
              } ${
                completed
                  ? 'bg-bm-maroon'
                  : isQuizSegment
                    ? 'bg-bm-gold animate-pulse relative overflow-hidden'
                    : 'bg-bm-grey'
              }`}
            >
              {isQuizSegment && (
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}



