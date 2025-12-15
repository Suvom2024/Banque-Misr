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
      <div className="w-full px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-bm-maroon tracking-tighter leading-tight">Welcome back, {userName}</h1>
          <p className="text-bm-text-secondary text-sm mt-1.5 leading-relaxed">Here is your executive training overview for today.</p>
        </div>
        <div className="flex items-center space-x-8">
          {/* Notifications */}
          <div className="relative group">
            <button className="relative text-bm-text-secondary hover:text-bm-maroon transition-colors p-2 rounded-full hover:bg-bm-grey/50">
              <span className="material-symbols-outlined text-2xl">notifications</span>
              <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
            </button>
          </div>
          <div className="h-8 w-px bg-bm-grey"></div>
          {/* User Profile */}
          <div className="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="text-right hidden md:block">
              <p className="font-bold text-sm text-bm-text-primary">{userName}</p>
              <p className="text-xs text-bm-text-secondary font-medium">{userRole}</p>
            </div>
            <div className="relative">
              {userAvatar ? (
                <Image
                  alt="User profile"
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-bm-maroon/10"
                  src={userAvatar}
                  width={48}
                  height={48}
                  priority={false}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-bm-grey flex items-center justify-center border-2 border-white shadow-md ring-2 ring-bm-maroon/10">
                  <span className="material-symbols-outlined text-bm-text-secondary">person</span>
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            {/* Message Icon */}
            <button className="relative text-bm-text-secondary hover:text-bm-maroon transition-colors p-2 rounded-full hover:bg-bm-grey/50">
              <span className="material-symbols-outlined text-2xl">mail</span>
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white"></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export const DashboardHeader = memo(DashboardHeaderComponent)



