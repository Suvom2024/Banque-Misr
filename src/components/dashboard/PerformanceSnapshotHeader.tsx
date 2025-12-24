'use client'

import Link from 'next/link'

interface PerformanceSnapshotHeaderProps {
  userName: string
  userRole?: string
  userAvatar?: string
  sessionId: string
}

export function PerformanceSnapshotHeader({
  userName,
  userRole = 'Branch Manager',
  userAvatar,
  sessionId,
}: PerformanceSnapshotHeaderProps) {
  return (
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-10 border-b border-bm-grey/80 shadow-sm flex-shrink-0">
      <div className="w-full px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex flex-col justify-center flex-shrink-0 min-w-0 max-w-[40%]">
            <Link
              href={`/training-hub/session/${sessionId}`}
              className="flex items-center gap-1 text-[10px] lg:text-xs text-bm-text-secondary hover:text-bm-maroon font-semibold mb-0.5 transition-colors group"
            >
              <span className="material-symbols-outlined text-xs group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
              <span className="hidden sm:inline">Back to Scenario</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <h1 className="text-base lg:text-lg font-bold text-bm-maroon tracking-tight leading-tight truncate">Performance Snapshot</h1>
          </div>
          <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
            <div className="flex gap-1.5 lg:gap-2">
              <button className="flex items-center gap-1 px-2 lg:px-2.5 py-1.5 rounded-md border border-bm-grey text-bm-text-secondary hover:text-bm-maroon hover:border-bm-maroon transition-all text-[11px] lg:text-xs font-semibold bg-white whitespace-nowrap">
                <span className="material-symbols-outlined text-sm lg:text-base">share</span>
                <span className="hidden sm:inline">Share</span>
              </button>
              <button className="flex items-center gap-1 px-2 lg:px-2.5 py-1.5 rounded-md border border-bm-grey text-bm-text-secondary hover:text-bm-maroon hover:border-bm-maroon transition-all text-[11px] lg:text-xs font-semibold bg-white whitespace-nowrap">
                <span className="material-symbols-outlined text-sm lg:text-base">edit_note</span>
                <span className="hidden sm:inline">Reflect</span>
              </button>
            </div>
            <div className="h-5 lg:h-6 w-px bg-bm-grey hidden sm:block"></div>
            <button className="relative text-bm-text-secondary hover:text-bm-maroon transition-colors group p-1.5 rounded-full hover:bg-bm-light-grey flex-shrink-0">
              <span className="material-symbols-outlined text-base lg:text-lg group-hover:animate-pulse">notifications</span>
              <span className="absolute top-1.5 right-1.5 block h-1.5 w-1.5 rounded-full bg-bm-maroon ring-2 ring-white"></span>
            </button>
            <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-bm-grey">
              <div className="text-right hidden md:block">
                <p className="font-bold text-xs lg:text-sm text-bm-text-primary leading-tight truncate max-w-[100px]">{userName}</p>
                <p className="text-[10px] lg:text-xs text-bm-text-secondary font-medium truncate">{userRole}</p>
              </div>
              {userAvatar ? (
                <img
                  alt="User profile"
                  className="w-7 h-7 lg:w-8 lg:h-8 rounded-full object-cover border-2 border-bm-white ring-2 ring-bm-grey/50 shadow-sm flex-shrink-0"
                  src={userAvatar}
                />
              ) : (
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-bm-grey flex items-center justify-center border-2 border-bm-white ring-2 ring-bm-grey/50 shadow-sm flex-shrink-0">
                  <span className="material-symbols-outlined text-slate-500 text-xs lg:text-sm">person</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

