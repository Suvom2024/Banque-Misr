'use client'

import { memo } from 'react'
import { useRouter } from 'next/navigation'

interface QuickAction {
  label: string
  icon: string
  href: string
  color: string
}

function QuickActionsComponent() {
  const router = useRouter()

  const actions: QuickAction[] = [
    {
      label: 'Start New Session',
      icon: 'play_circle',
      href: '/training-hub/new-session',
      color: 'bg-bm-maroon hover:bg-bm-maroon-light',
    },
    {
      label: 'View Reports',
      icon: 'assessment',
      href: '/analytics',
      color: 'bg-bm-gold hover:bg-bm-gold-hover',
    },
    {
      label: 'Set Goal',
      icon: 'flag',
      href: '/development-goals',
      color: 'bg-bm-info hover:bg-blue-600',
    },
    {
      label: 'Browse Scenarios',
      icon: 'menu_book',
      href: '/training-hub',
      color: 'bg-bm-success hover:bg-green-600',
    },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-card border border-white p-6">
      <h2 className="text-base font-bold text-bm-text-primary tracking-tight flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-bm-maroon text-base">bolt</span>
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => router.push(action.href)}
            className={`${action.color} text-white rounded-xl p-4 flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-lg group`}
          >
            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">
              {action.icon}
            </span>
            <span className="text-xs font-bold text-center">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export const QuickActions = memo(QuickActionsComponent)

