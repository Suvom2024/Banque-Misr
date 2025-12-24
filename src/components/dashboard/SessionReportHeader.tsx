'use client'

import Link from 'next/link'

interface SessionReportHeaderProps {
  userName: string
  userRole?: string
  userAvatar?: string
  sessionTitle: string
}

export function SessionReportHeader({
  userName,
  userRole = 'Branch Manager',
  userAvatar,
  sessionTitle,
}: SessionReportHeaderProps) {
  return (
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-20 border-b border-bm-grey/60">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
        <div className="flex-shrink-0 min-w-0 max-w-[50%]">
          <div className="flex items-center gap-1.5 text-[10px] lg:text-xs font-medium text-bm-text-secondary mb-0.5">
            <Link href="/training-hub/new-session" className="hover:text-bm-maroon transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">arrow_back</span>
              <span className="hidden sm:inline">Training Hub</span>
              <span className="sm:hidden">Hub</span>
            </Link>
            <span className="text-bm-grey-dark">/</span>
            <span className="text-bm-maroon">Session Report</span>
          </div>
          <h1 className="text-base lg:text-lg font-bold text-bm-maroon tracking-tight leading-tight truncate">{sessionTitle}</h1>
        </div>
        <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
          <button className="relative p-1.5 rounded-full hover:bg-bm-light-grey transition-colors text-bm-text-secondary hover:text-bm-maroon group flex-shrink-0">
            <span className="material-symbols-outlined text-base lg:text-lg group-hover:animate-pulse">notifications</span>
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-bm-maroon border-2 border-white"></span>
          </button>
          <div className="h-5 lg:h-6 w-px bg-bm-grey hidden sm:block"></div>
          <div className="flex items-center gap-2 lg:gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs lg:text-sm font-bold text-bm-text-primary truncate max-w-[100px]">{userName}</p>
              <p className="text-[10px] lg:text-xs text-bm-text-secondary font-medium truncate">{userRole}</p>
            </div>
            {userAvatar ? (
              <img
                alt="Profile"
                className="h-7 w-7 lg:h-8 lg:w-8 rounded-full border-2 border-white shadow-sm object-cover ring-2 ring-bm-grey/50 flex-shrink-0"
                src={userAvatar}
              />
            ) : (
              <div className="h-7 w-7 lg:h-8 lg:w-8 rounded-full bg-bm-grey flex items-center justify-center ring-2 ring-bm-grey/50 flex-shrink-0">
                <span className="material-symbols-outlined text-slate-500 text-xs lg:text-sm">person</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

