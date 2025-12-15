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
      <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-bm-text-secondary mb-1">
            <Link href="/training-hub/new-session" className="hover:text-bm-maroon transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Training Hub
            </Link>
            <span className="text-bm-grey-dark">/</span>
            <span className="text-bm-maroon">Session Report</span>
          </div>
          <h1 className="text-2xl font-extrabold text-bm-maroon tracking-tighter leading-tight">{sessionTitle}</h1>
        </div>
        <div className="flex items-center gap-6">
          <button className="relative p-2 rounded-full hover:bg-bm-light-grey transition-colors text-bm-text-secondary hover:text-bm-maroon group">
            <span className="material-symbols-outlined group-hover:animate-pulse">notifications</span>
            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-bm-maroon border-2 border-white"></span>
          </button>
          <div className="h-8 w-px bg-bm-grey"></div>
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-bm-text-primary">{userName}</p>
              <p className="text-xs text-bm-text-secondary font-medium">{userRole}</p>
            </div>
            {userAvatar ? (
              <img
                alt="Profile"
                className="h-11 w-11 rounded-full border-2 border-white shadow-sm object-cover ring-2 ring-bm-grey/50"
                src={userAvatar}
              />
            ) : (
              <div className="h-11 w-11 rounded-full bg-bm-grey flex items-center justify-center ring-2 ring-bm-grey/50">
                <span className="material-symbols-outlined text-bm-text-secondary">person</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

