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
      <div className="w-full px-8">
        <div className="flex items-center justify-between h-20">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-bm-text-secondary">
                {sessionDate} • {sessionTime}
              </span>
              <span className="text-bm-grey">|</span>
              <span className="text-sm font-semibold text-bm-text-secondary">{sessionNumber}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-bm-maroon tracking-tight leading-tight">
              Post-Session Report: {sessionTitle}
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <button className="relative text-bm-text-secondary hover:text-bm-maroon transition-colors p-2 bg-bm-light-grey rounded-full">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-2 block h-2.5 w-2.5 rounded-full bg-bm-maroon ring-2 ring-bm-white"></span>
            </button>
            <div className="flex items-center space-x-3 pl-6 border-l border-bm-grey">
              {userAvatar ? (
                <img
                  alt="User profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-bm-maroon"
                  src={userAvatar}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-bm-grey flex items-center justify-center border-2 border-bm-maroon">
                  <span className="material-symbols-outlined text-bm-text-secondary">person</span>
                </div>
              )}
              <div>
                <p className="font-bold text-sm text-bm-text-primary">{userName}</p>
                <p className="text-xs text-bm-text-secondary">{userRole}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

