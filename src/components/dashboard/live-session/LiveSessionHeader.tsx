'use client'

import Link from 'next/link'

interface LiveSessionHeaderProps {
  userName: string
  userRole?: string
  userAvatar?: string
  scenarioTitle: string
  showLiveBadge?: boolean
}

export function LiveSessionHeader({
  userName,
  userRole = 'Branch Manager',
  userAvatar,
  scenarioTitle,
  showLiveBadge = false,
}: LiveSessionHeaderProps) {
  return (
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-10 border-b border-bm-grey/80 shadow-sm flex-shrink-0">
      <div className="w-full px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex flex-col justify-center">
            <Link
              href="/training-hub"
              className="flex items-center gap-1.5 text-xs text-bm-text-secondary hover:text-bm-maroon font-semibold mb-0.5 transition-colors group"
            >
              <span className="material-symbols-outlined text-sm group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
              Back to Hub
            </Link>
            <div className="flex items-center gap-3">
              {showLiveBadge && (
                <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10 animate-pulse">
                  LIVE SESSION
                </span>
              )}
              {showLiveBadge && <span className="text-sm text-bm-text-secondary">Scenario #241</span>}
              <h1 className="text-2xl font-bold text-bm-maroon tracking-tight leading-tight">{scenarioTitle}</h1>
            </div>
          </div>
          <div className="flex items-center space-x-8">
            <button className="relative text-bm-text-secondary hover:text-bm-maroon transition-colors group p-2 rounded-full hover:bg-bm-light-grey">
              <span className="material-symbols-outlined text-[26px] group-hover:animate-pulse">notifications</span>
              <span className="absolute top-2 right-2.5 block h-2 w-2 rounded-full bg-bm-maroon ring-2 ring-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-8 border-l border-bm-grey h-10">
              <div className="text-right hidden md:block">
                <p className="font-bold text-sm text-bm-text-primary leading-tight">{userName}</p>
                <p className="text-xs text-bm-text-secondary font-medium">{userRole}</p>
              </div>
              {userAvatar ? (
                <img
                  alt="User profile"
                  className="w-11 h-11 rounded-full object-cover border-2 border-bm-white ring-2 ring-bm-grey/50 shadow-sm"
                  src={userAvatar}
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-bm-grey flex items-center justify-center border-2 border-bm-white ring-2 ring-bm-grey/50 shadow-sm">
                  <span className="material-symbols-outlined text-bm-text-secondary">person</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}



