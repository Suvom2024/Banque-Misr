'use client'

interface MultiAgenticReportHeaderProps {
  userName: string
  userRole?: string
  userAvatar?: string
  sessionTitle: string
  sessionDate: string
  sessionTime: string
  sessionNumber: string
}

export function MultiAgenticReportHeader({
  userName,
  userRole = 'Branch Manager',
  userAvatar,
  sessionTitle,
  sessionDate,
  sessionTime,
  sessionNumber,
}: MultiAgenticReportHeaderProps) {
  return (
    <header className="bg-bm-white border-b border-bm-grey flex-shrink-0 z-10">
      <div className="w-full px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 min-w-0 max-w-[50%]">
            <div className="flex items-center gap-1.5 text-[10px] lg:text-xs">
              <span className="text-bm-text-secondary">
                {sessionDate} • {sessionTime}
              </span>
              <span className="text-bm-grey">|</span>
              <span className="font-semibold text-bm-text-secondary">{sessionNumber}</span>
            </div>
            <h1 className="text-base lg:text-lg font-bold text-bm-maroon tracking-tight leading-tight truncate">
              Post-Session Report: {sessionTitle}
            </h1>
          </div>
          <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
            <button className="relative text-bm-text-secondary hover:text-bm-maroon transition-colors p-1.5 bg-bm-light-grey rounded-full flex-shrink-0">
              <span className="material-symbols-outlined text-base lg:text-lg">notifications</span>
              <span className="absolute top-1.5 right-1.5 block h-1.5 w-1.5 rounded-full bg-bm-maroon ring-2 ring-bm-white"></span>
            </button>
            <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-bm-grey">
              {userAvatar ? (
                <img
                  alt="User profile"
                  className="w-7 h-7 lg:w-8 lg:h-8 rounded-full object-cover border-2 border-bm-maroon flex-shrink-0"
                  src={userAvatar}
                />
              ) : (
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-bm-grey flex items-center justify-center border-2 border-bm-maroon flex-shrink-0">
                  <span className="material-symbols-outlined text-slate-500 text-xs lg:text-sm">person</span>
                </div>
              )}
              <div className="hidden md:block">
                <p className="font-bold text-xs lg:text-sm text-bm-text-primary truncate max-w-[100px]">{userName}</p>
                <p className="text-[10px] lg:text-xs text-bm-text-secondary truncate">{userRole}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

