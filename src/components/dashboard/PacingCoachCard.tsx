'use client'

interface PacingCoachCardProps {
  status: string
  averageWPM: number
  description: string
}

export function PacingCoachCard({ status, averageWPM, description }: PacingCoachCardProps) {
  return (
    <div className="bg-bm-white rounded-xl shadow-card border border-bm-grey/60 overflow-hidden hover:shadow-card-hover transition-all">
      <div className="border-l-[6px] border-l-feedback-positive p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-50 p-2 rounded-lg text-feedback-positive">
              <span className="material-symbols-outlined">speed</span>
            </div>
            <div>
              <h4 className="font-bold text-bm-text-primary">Pacing Coach</h4>
              <p className="text-xs text-bm-text-secondary">Speech Rate & Pause Analysis</p>
            </div>
          </div>
          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-feedback-positive ring-1 ring-inset ring-green-600/20">
            {status}
          </span>
        </div>
        <p className="text-sm text-bm-text-secondary">
          Your pacing was steady at an average of {averageWPM} words per minute. {description}
        </p>
      </div>
    </div>
  )
}

