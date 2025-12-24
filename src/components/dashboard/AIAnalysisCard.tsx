'use client'

interface AIAnalysisCardProps {
  userName: string
  grade: string
  message: string
  currentGoal: {
    title: string
    progress: number
    changeFromSession: number
  }
}

export function AIAnalysisCard({ userName, grade, message, currentGoal }: AIAnalysisCardProps) {
  return (
    <div className="lg:col-span-2 relative bg-gradient-to-br from-bm-maroon to-bm-maroon-dark text-white rounded-2xl shadow-xl overflow-hidden p-6 border border-white/10">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-bm-gold opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-white opacity-5 rounded-full blur-2xl"></div>
      <div className="relative z-10 flex flex-col justify-center h-full">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold text-bm-gold mb-2">
              <span className="material-symbols-outlined text-xs animate-pulse">auto_awesome</span>
              AI Analysis Complete
            </div>
            <h2 className="text-xl font-extrabold leading-tight mb-1.5">
              {userName}, {message}
            </h2>
          </div>
          <div className="hidden xl:block">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <span className="text-2xl font-bold text-bm-gold">{grade}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 bg-black/20 rounded-xl p-3 backdrop-blur-sm border border-white/5">
          <div className="flex justify-between items-end mb-1.5">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-white/60 block mb-0.5">Current Goal</span>
              <span className="text-xs font-bold text-white">{currentGoal.title}</span>
            </div>
            <span className="text-base font-bold text-bm-gold">{currentGoal.progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-bm-gold rounded-full shadow-[0_0_10px_rgba(255,199,44,0.5)]"
              style={{ width: `${currentGoal.progress}%` }}
            ></div>
          </div>
          <p className="text-[9px] text-white/50 mt-1.5 text-right">
            +{currentGoal.changeFromSession}% from this session
          </p>
        </div>
      </div>
    </div>
  )
}

