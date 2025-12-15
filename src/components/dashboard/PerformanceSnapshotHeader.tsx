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
      <div className="w-full px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex flex-col justify-center">
            <Link
              href={`/training-hub/session/${sessionId}`}
              className="flex items-center gap-1.5 text-xs text-bm-text-secondary hover:text-bm-maroon font-semibold mb-0.5 transition-colors group"
            >
              <span className="material-symbols-outlined text-sm group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
              Back to Scenario
            </Link>
            <h1 className="text-2xl font-bold text-bm-maroon tracking-tight leading-tight">Performance Snapshot</h1>
          </div>
          <div className="flex items-center space-x-8">
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-bm-grey text-bm-text-secondary hover:text-bm-maroon hover:border-bm-maroon transition-all text-xs font-semibold bg-white">
                <span className="material-symbols-outlined text-lg">share</span>
                Share Report
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-bm-grey text-bm-text-secondary hover:text-bm-maroon hover:border-bm-maroon transition-all text-xs font-semibold bg-white">
                <span className="material-symbols-outlined text-lg">edit_note</span>
                Add Reflection
              </button>
            </div>
            <div className="h-8 w-px bg-bm-grey"></div>
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

