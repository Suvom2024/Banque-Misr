'use client'

interface LearningPathItem {
  id: string
  title: string
  status: 'completed' | 'in-progress' | 'locked'
  progress?: number
  completedModules?: number
  totalModules?: number
}

interface LearningPathSidebarProps {
  items: LearningPathItem[]
  onViewAll?: () => void
}

export function LearningPathSidebar({ items, onViewAll }: LearningPathSidebarProps) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-4 border border-gray-100 relative overflow-hidden w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-bm-maroon text-sm">Learning Path</h3>
        <button onClick={onViewAll} className="text-[10px] font-semibold text-bm-text-subtle hover:text-bm-maroon">
          View All
        </button>
      </div>
      <div className="space-y-4 relative z-10">
        {items.map((item, index) => (
          <div key={item.id} className="flex gap-3 relative">
            <div className="flex flex-col items-center">
              {item.status === 'completed' ? (
                <div className="w-6 h-6 rounded-full bg-feedback-positive text-white flex items-center justify-center shadow-lg shadow-green-200 z-10">
                  <span className="material-symbols-outlined text-xs">check</span>
                </div>
              ) : item.status === 'in-progress' ? (
                <div className="w-6 h-6 rounded-full bg-white border-2 border-bm-gold flex items-center justify-center shadow-lg shadow-yellow-100 z-10 group-hover:scale-110 transition-transform">
                  <div className="w-2 h-2 bg-bm-gold rounded-full animate-pulse"></div>
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-300 text-gray-400 flex items-center justify-center z-10">
                  <span className="material-symbols-outlined text-xs">lock</span>
                </div>
              )}
              {index < items.length - 1 && <div className="w-0.5 h-full bg-gray-200 absolute top-6"></div>}
            </div>
            <div className={`flex-1 ${item.status === 'in-progress' ? 'bg-bm-light-grey p-2.5 rounded-xl -mt-1 group-hover:bg-white group-hover:shadow-md transition-all border border-transparent group-hover:border-bm-gold/30' : 'pt-0.5'}`}>
              <p
                className={`text-xs font-bold ${item.status === 'completed' ? 'text-bm-text-primary line-through opacity-50' : item.status === 'in-progress' ? 'text-bm-maroon' : 'text-bm-text-primary'}`}
              >
                {item.title}
              </p>
              {item.status === 'completed' && <p className="text-[10px] text-green-600 font-medium">Completed</p>}
              {item.status === 'in-progress' && item.progress !== undefined && (
                <>
                  <div className="w-full bg-gray-200 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-bm-gold h-full rounded-full" style={{ width: `${item.progress}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[9px] text-gray-500">
                      {item.completedModules}/{item.totalModules} Modules
                    </span>
                    <span className="text-[9px] font-bold text-bm-maroon">Continue →</span>
                  </div>
                </>
              )}
              {item.status === 'locked' && <p className="text-[10px] text-gray-500">Locked</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

