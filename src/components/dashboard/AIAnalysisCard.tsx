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
    <div className="lg:col-span-2 relative bg-gradient-to-br from-bm-maroon to-bm-maroon-dark text-white rounded-2xl shadow-xl overflow-hidden p-8 border border-white/10">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-bm-gold opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-white opacity-5 rounded-full blur-2xl"></div>
      <div className="relative z-10 flex flex-col justify-center h-full">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-bm-gold mb-3">
              <span className="material-symbols-outlined text-sm animate-pulse">auto_awesome</span>
              AI Analysis Complete
            </div>
            <h2 className="text-3xl font-extrabold leading-tight mb-2">
              {userName}, {message}
            </h2>
          </div>
          <div className="hidden xl:block">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <span className="text-3xl font-bold text-bm-gold">{grade}</span>
            </div>
          </div>
        </div>
        <div className="mt-6 bg-black/20 rounded-xl p-4 backdrop-blur-sm border border-white/5">
          <div className="flex justify-between items-end mb-2">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-white/60 block mb-1">Current Goal</span>
              <span className="text-sm font-bold text-white">{currentGoal.title}</span>
            </div>
            <span className="text-xl font-bold text-bm-gold">{currentGoal.progress}%</span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-bm-gold rounded-full shadow-[0_0_10px_rgba(255,199,44,0.5)]"
              style={{ width: `${currentGoal.progress}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-white/50 mt-2 text-right">
            +{currentGoal.changeFromSession}% from this session
          </p>
        </div>
      </div>
    </div>
  )
}

