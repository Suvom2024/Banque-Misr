'use client'

export function AssessmentActiveIndicator() {
  return (
    <div className="flex justify-center my-3 animate-slide-up">
      <div className="bg-bm-gold/10 border border-bm-gold/40 text-bm-maroon px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bm-maroon opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-bm-maroon"></span>
        </span>
        Assessment Active: Waiting for your input...
      </div>
    </div>
  )
}



