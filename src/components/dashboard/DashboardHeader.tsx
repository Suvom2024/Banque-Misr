'use client'

import { memo } from 'react'
import Image from 'next/image'

interface DashboardHeaderProps {
  userName: string
  userRole?: string
  userAvatar?: string
}

function DashboardHeaderComponent({ userName, userRole = 'Branch Manager', userAvatar }: DashboardHeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-30 border-b border-bm-grey-dark/30 shadow-sm">
      <div className="w-full px-4 lg:px-6 flex items-center justify-between h-16">
        <div className="flex-shrink-0 min-w-0 max-w-[50%]">
          <h1 className="text-base lg:text-lg font-bold text-bm-maroon tracking-tight leading-tight truncate">Welcome back, {userName}</h1>
          <p className="text-bm-text-secondary text-[10px] lg:text-xs mt-0.5 leading-tight truncate">Here is your executive training overview for today.</p>
        </div>
        <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
          {/* Notifications */}
          <button className="relative text-bm-text-secondary p-1.5 hover:text-bm-maroon transition-colors flex-shrink-0">
            <span className="material-symbols-outlined text-lg lg:text-xl">notifications</span>
            <span className="absolute top-1.5 right-1.5 block h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
          <div className="h-5 lg:h-6 w-px bg-bm-grey hidden sm:block"></div>
          {/* User Profile */}
          <div className="flex items-center gap-2 lg:gap-3 cursor-pointer">
            <div className="text-right hidden md:block">
              <p className="font-bold text-xs lg:text-sm text-bm-text-primary truncate max-w-[100px]">{userName}</p>
              <p className="text-[10px] lg:text-xs text-bm-text-secondary font-medium truncate">{userRole}</p>
            </div>
            <div className="relative flex-shrink-0">
              {userAvatar ? (
                <Image
                  alt="User profile"
                  className="w-7 h-7 lg:w-8 lg:h-8 rounded-full object-cover border-2 border-white shadow-sm ring-2 ring-bm-maroon/10"
                  src={userAvatar}
                  width={32}
                  height={32}
                  priority={false}
                />
              ) : (
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-bm-grey flex items-center justify-center border-2 border-white shadow-sm ring-2 ring-bm-maroon/10">
                  <span className="material-symbols-outlined text-slate-500 text-xs lg:text-sm">person</span>
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            {/* Message Icon */}
            <button className="relative text-bm-text-secondary p-1.5 hover:text-bm-maroon transition-colors flex-shrink-0 hidden lg:block">
              <span className="material-symbols-outlined text-lg lg:text-xl">mail</span>
              <span className="absolute top-1 right-1 block h-1.5 w-1.5 rounded-full bg-green-500 ring-2 ring-white"></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export const DashboardHeader = memo(DashboardHeaderComponent)



