'use client'

interface AssessmentResultsCardProps {
  score: number
  correct: number
  incorrect: number
  quizCount: number
  onReviewAnswers?: () => void
}

export function AssessmentResultsCard({
  score,
  correct,
  incorrect,
  quizCount,
  onReviewAnswers,
}: AssessmentResultsCardProps) {
  const radius = 64
  const circumference = 2 * Math.PI * radius
  const scorePercentage = score
  const strokeDasharray = `${(scorePercentage / 100) * circumference}, ${circumference}`

  return (
    <div className="bg-white rounded-2xl shadow-card border border-bm-grey/60 p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-bm-text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-bm-maroon">quiz</span>
          Assessment Results
        </h3>
        <span className="px-2.5 py-1 rounded-full bg-bm-light-grey text-xs font-bold text-bm-text-secondary border border-bm-grey">
          {quizCount} Quiz{quizCount !== 1 ? 'zes' : ''}
        </span>
      </div>
      <div className="flex items-center gap-8 mb-6">
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <circle
              className="text-bm-grey"
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            ></circle>
            <circle
              className="text-feedback-positive"
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${(score / 100) * 100.5}, 100.5`}
            ></circle>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold text-bm-text-primary">{score}%</span>
            <span className="text-[10px] font-bold text-bm-text-subtle uppercase">Score</span>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-feedback-positive"></div>
              <span className="text-bm-text-secondary font-medium">Correct</span>
            </div>
            <span className="font-bold text-bm-text-primary">{correct}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-feedback-negative"></div>
              <span className="text-bm-text-secondary font-medium">Incorrect</span>
            </div>
            <span className="font-bold text-bm-text-primary">{incorrect}</span>
          </div>
        </div>
      </div>
      <button
        onClick={onReviewAnswers}
        className="mt-auto w-full py-2.5 rounded-xl border border-bm-grey text-bm-text-secondary font-bold text-sm hover:bg-bm-light-grey hover:border-bm-maroon hover:text-bm-maroon transition-colors flex items-center justify-center gap-2 group"
      >
        <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">visibility</span>
        Review Quiz Answers
      </button>
    </div>
  )
}

