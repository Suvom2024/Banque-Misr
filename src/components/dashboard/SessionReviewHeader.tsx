'use client'

import Link from 'next/link'

interface SessionReviewHeaderProps {
  userName: string
  userRole?: string
  userAvatar?: string
  sessionTitle: string
}

export function SessionReviewHeader({
  userName,
  userRole = 'Senior Relationship Manager',
  userAvatar,
  sessionTitle,
}: SessionReviewHeaderProps) {
  return (
    <header className="bg-white sticky top-0 z-40 border-b border-bm-grey shadow-sm">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
        <div className="flex-shrink-0 min-w-0 max-w-[50%]">
          <nav className="flex items-center text-[10px] lg:text-xs text-bm-text-secondary mb-0.5">
            <Link href="/training-hub/new-session" className="hover:text-bm-maroon transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">arrow_back</span>
              <span className="hidden sm:inline">Back to Scenario List</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </nav>
          <h1 className="text-base lg:text-lg font-bold text-bm-maroon tracking-tight truncate">Session Review: {sessionTitle}</h1>
        </div>
        <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
          <button className="relative p-1.5 text-bm-text-secondary hover:text-bm-maroon transition-colors rounded-full hover:bg-gray-100 flex-shrink-0">
            <span className="material-symbols-outlined text-base lg:text-lg">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-bm-maroon border-2 border-white rounded-full"></span>
          </button>
          <div className="h-5 lg:h-6 w-px bg-gray-200 hidden sm:block"></div>
          <div className="flex items-center gap-2 lg:gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs lg:text-sm font-bold text-bm-text-primary truncate max-w-[100px]">{userName}</p>
              <p className="text-[10px] lg:text-xs text-bm-text-secondary truncate">{userRole}</p>
            </div>
            {userAvatar ? (
              <img
                alt={userName}
                className="w-7 h-7 lg:w-8 lg:h-8 rounded-full border-2 border-bm-gold object-cover shadow-sm flex-shrink-0"
                src={userAvatar}
              />
            ) : (
              <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-bm-grey flex items-center justify-center border-2 border-bm-gold shadow-sm flex-shrink-0">
                <span className="material-symbols-outlined text-slate-500 text-xs lg:text-sm">person</span>
              </div>
            )}
            <span className="material-symbols-outlined text-bm-text-subtle text-sm cursor-pointer hover:text-bm-maroon hidden lg:block">expand_more</span>
          </div>
        </div>
      </div>
    </header>
  )
}

