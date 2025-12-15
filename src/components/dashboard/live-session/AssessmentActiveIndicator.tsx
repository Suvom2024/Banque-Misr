'use client'

export function AssessmentActiveIndicator() {
  return (
    <div className="flex justify-center my-4 animate-slide-up">
      <div className="bg-bm-gold/10 border border-bm-gold/40 text-bm-maroon px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bm-maroon opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-bm-maroon"></span>
        </span>
        Assessment Active: Waiting for your input...
      </div>
    </div>
  )
}



