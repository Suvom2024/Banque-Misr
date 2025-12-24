'use client'

interface TrainingLibraryHeaderProps {
  userName: string
  userRole?: string
  userAvatar?: string
}

export function TrainingLibraryHeader({ userName, userRole = 'Branch Manager', userAvatar }: TrainingLibraryHeaderProps) {
  return (
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100 shadow-sm">
      <div className="w-full px-4 lg:px-6 h-16 flex items-center justify-between">
        <div className="flex-shrink-0 min-w-0 max-w-[50%]">
          <h1 className="text-base lg:text-lg font-bold text-bm-maroon tracking-tight flex items-center gap-1.5 truncate">
            <span className="truncate">Training Library</span>
            <span className="px-1.5 py-0.5 rounded-md bg-bm-gold/20 text-bm-gold-dark text-[10px] lg:text-xs font-bold uppercase tracking-wider flex-shrink-0">PRO</span>
          </h1>
          <p className="text-bm-text-secondary text-[10px] lg:text-xs mt-0.5 truncate">Explore AI-driven scenarios tailored for your growth.</p>
        </div>
        <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
          <div className="relative group hidden lg:block w-64 xl:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base group-focus-within:text-bm-maroon transition-colors">
              search
            </span>
            <input
              className="w-full bg-bm-light-grey border-transparent rounded-full pl-10 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-bm-maroon/20 focus:border-bm-maroon focus:bg-white transition-all shadow-inner"
              placeholder="Search scenarios, skills..."
              type="text"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="text-[10px] bg-white border border-gray-200 rounded px-1 py-0.5 text-gray-400">⌘K</span>
            </div>
          </div>
          <button className="relative p-1.5 rounded-full hover:bg-gray-100 text-bm-text-secondary hover:text-bm-maroon transition-colors flex-shrink-0">
            <span className="material-symbols-outlined text-base lg:text-lg">notifications</span>
            <span className="absolute top-1.5 right-1.5 block h-1.5 w-1.5 rounded-full bg-bm-maroon ring-2 ring-white animate-pulse"></span>
          </button>
        </div>
      </div>
    </header>
  )
}

