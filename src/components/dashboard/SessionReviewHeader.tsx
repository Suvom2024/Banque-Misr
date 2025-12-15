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
      <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">
        <div>
          <nav className="flex items-center text-sm text-bm-text-secondary mb-1">
            <Link href="/training-hub/new-session" className="hover:text-bm-maroon transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Back to Scenario List
            </Link>
          </nav>
          <h1 className="text-2xl font-extrabold text-bm-maroon tracking-tight">Session Review: {sessionTitle}</h1>
        </div>
        <div className="flex items-center gap-6">
          <button className="relative p-2 text-bm-text-secondary hover:text-bm-maroon transition-colors rounded-full hover:bg-gray-100">
            <span className="material-symbols-outlined text-[28px]">notifications</span>
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-bm-maroon border-2 border-white rounded-full"></span>
          </button>
          <div className="h-8 w-px bg-gray-200"></div>
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-bm-text-primary">{userName}</p>
              <p className="text-xs text-bm-text-secondary">{userRole}</p>
            </div>
            {userAvatar ? (
              <img
                alt={userName}
                className="w-12 h-12 rounded-full border-2 border-bm-gold object-cover shadow-sm"
                src={userAvatar}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-bm-grey flex items-center justify-center border-2 border-bm-gold shadow-sm">
                <span className="material-symbols-outlined text-bm-text-secondary">person</span>
              </div>
            )}
            <span className="material-symbols-outlined text-bm-text-subtle cursor-pointer hover:text-bm-maroon">expand_more</span>
          </div>
        </div>
      </div>
    </header>
  )
}

