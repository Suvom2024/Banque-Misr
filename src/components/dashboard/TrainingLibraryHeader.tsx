'use client'

interface TrainingLibraryHeaderProps {
  userName: string
  userRole?: string
  userAvatar?: string
}

export function TrainingLibraryHeader({ userName, userRole = 'Branch Manager', userAvatar }: TrainingLibraryHeaderProps) {
  return (
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100 shadow-sm">
      <div className="w-full px-8 h-24 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-bm-maroon tracking-tight flex items-center gap-2">
            Training Library
            <span className="px-2 py-1 rounded-md bg-bm-gold/20 text-bm-gold-dark text-xs font-bold uppercase tracking-wider">PRO</span>
          </h1>
          <p className="text-bm-text-secondary text-sm mt-0.5">Explore AI-driven scenarios tailored for your growth.</p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="relative group hidden lg:block w-80">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-bm-maroon transition-colors">
              search
            </span>
            <input
              className="w-full bg-bm-light-grey border-transparent rounded-full pl-12 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-bm-maroon/20 focus:border-bm-maroon focus:bg-white transition-all shadow-inner"
              placeholder="Search scenarios, skills..."
              type="text"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="text-xs bg-white border border-gray-200 rounded px-1.5 py-0.5 text-gray-400">⌘K</span>
            </div>
          </div>
          <button className="relative p-2 rounded-full hover:bg-gray-100 text-bm-text-secondary hover:text-bm-maroon transition-colors">
            <span className="material-symbols-outlined text-[28px]">notifications</span>
            <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-bm-maroon ring-2 ring-white animate-pulse"></span>
          </button>
        </div>
      </div>
    </header>
  )
}

