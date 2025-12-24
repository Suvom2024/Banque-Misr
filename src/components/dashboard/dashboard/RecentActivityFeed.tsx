'use client'

import { memo, useMemo } from 'react'
import Link from 'next/link'
import type { Activity } from '@/types/dashboard'

interface RecentActivityFeedProps {
  activities: Activity[]
  limit?: number
  isLoading?: boolean
}

function RecentActivityFeedComponent({ activities, limit = 5, isLoading }: RecentActivityFeedProps) {
  // Show more activities to fill space better (up to 6-7 items)
  const displayLimit = Math.max(limit, 6)
  const displayActivities = useMemo(() => activities.slice(0, displayLimit), [activities, displayLimit])

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return time.toLocaleDateString()
  }

  const getActivityIconBg = (activityType: string, icon: string) => {
    // Match exact design from screenshot
    if (icon === 'check_circle' || activityType === 'session_completed') {
      return 'bg-green-100 text-green-600'
    }
    if (icon === 'play_circle' || activityType === 'session_started') {
      return 'bg-blue-50 text-blue-600'
    }
    if (icon === 'emoji_events' || activityType === 'achievement') {
      return 'bg-bm-gold text-bm-maroon'
    }
    if (icon === 'flag' || activityType === 'goal_set' || activityType === 'goal_created') {
      return 'bg-bm-maroon/10 text-bm-maroon'
    }
    return 'bg-bm-grey/30 text-bm-text-secondary'
  }

  const formatActivityTitle = (activity: Activity): string => {
    // Format titles to match screenshot: "Completed: [name]... Achieved a score of 92%"
    if (activity.activityType === 'session_completed' && activity.score) {
      const sessionName = activity.title.replace('Completed: ', '').replace('Session', '').trim()
      return `Completed: ${sessionName}... Achieved a score of ${activity.score}%`
    }
    if (activity.activityType === 'session_started') {
      return `Started: ${activity.title.replace('Started: ', '').replace('Session', '').trim()}... Session in progress`
    }
    if (activity.activityType === 'achievement') {
      return activity.description || activity.title
    }
    if (activity.activityType === 'goal_set' || activity.activityType === 'goal_created') {
      return `Created Goal: ${activity.title}... Target: ${activity.description || 'N/A'}`
    }
    return activity.title
  }

  if (isLoading) {
    return (
      <div className="lg:col-span-3 bg-white rounded-2xl shadow-card border border-white p-6 flex flex-col h-full animate-pulse">
        <div className="h-64 bg-gray-100 rounded-lg"></div>
      </div>
    )
  }

  if (displayActivities.length === 0) {
    return (
      <div className="lg:col-span-3 bg-white rounded-2xl shadow-card border border-white p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-bm-maroon flex items-center gap-2">
            <span className="material-symbols-outlined">history</span>
            Recent Activity
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center flex-grow">
          <span className="material-symbols-outlined text-4xl text-bm-text-subtle mb-2">inbox</span>
          <p className="text-sm text-bm-text-secondary">No recent activity</p>
        </div>
      </div>
    )
  }

  return (
    <div className="lg:col-span-3 bg-white rounded-2xl shadow-card border border-white p-6 flex flex-col h-full transition-all hover:shadow-card-hover group">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-bm-maroon flex items-center gap-2">
          <span className="material-symbols-outlined">history</span>
          Recent Activity
        </h3>
        {activities.length > limit && (
          <button className="text-xs font-bold text-bm-maroon bg-bm-gold/10 hover:bg-bm-gold hover:text-bm-maroon-dark px-3 py-1.5 rounded-lg transition-colors">
            View All
          </button>
        )}
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar min-h-0">
        {displayActivities.map((activity) => {
          const linkHref = activity.relatedSessionId
            ? `/training-hub/session/${activity.relatedSessionId}`
            : activity.relatedGoalId
              ? `/development-goals`
              : '#'

          const isAchievement = activity.activityType === 'achievement'
          const iconBg = getActivityIconBg(activity.activityType || '', activity.icon || '')
          const formattedTitle = formatActivityTitle(activity)

          const content = (
            <div className={`group/item flex gap-3 items-start p-3 rounded-xl transition-all ${
              isAchievement
                ? 'bg-gradient-to-br from-bm-gold/5 to-white border border-bm-gold/20 hover:border-bm-gold/40 shadow-sm'
                : 'hover:bg-bm-light-grey/50 border border-transparent hover:border-bm-grey/50'
            }`}>
              <div className="flex-shrink-0 mt-0.5">
                <div className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center shadow-sm group-hover/item:scale-110 transition-transform ${
                  isAchievement ? 'ring-2 ring-white' : ''
                }`}>
                  <span className="material-symbols-outlined text-lg">
                    {activity.icon || (activity.activityType === 'session_completed' ? 'check_circle' : activity.activityType === 'session_started' ? 'play_circle' : activity.activityType === 'achievement' ? 'emoji_events' : activity.activityType === 'goal_set' || activity.activityType === 'goal_created' ? 'flag' : 'history')}
                  </span>
                </div>
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start">
                  {isAchievement ? (
                    <>
                      <p className="text-xs font-bold text-bm-maroon uppercase tracking-wide">Achievement</p>
                      <span className="text-[10px] font-semibold text-bm-text-subtle whitespace-nowrap">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </>
                  ) : activity.activityType === 'session_completed' ? (
                    <>
                      <p className="text-sm font-bold text-bm-text-primary truncate">{activity.title.replace('Completed: ', '').replace('Session', '').trim() || 'Session Completed'}</p>
                      <span className="text-[10px] font-semibold text-bm-text-subtle whitespace-nowrap ml-2">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </>
                  ) : activity.activityType === 'session_started' ? (
                    <>
                      <p className="text-sm font-bold text-bm-text-primary truncate">{activity.title.replace('Started: ', '').replace('Session', '').trim() || 'Session Started'}</p>
                      <span className="text-[10px] font-semibold text-bm-text-subtle whitespace-nowrap ml-2">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-bm-text-primary truncate">{activity.title}</p>
                      <span className="text-[10px] font-semibold text-bm-text-subtle whitespace-nowrap ml-2">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </>
                  )}
                </div>
                
                {/* Achievement Details */}
                {isAchievement && activity.description && (
                  <>
                    <p className="text-sm font-bold text-bm-text-primary mt-0.5">{activity.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white rounded-md text-[10px] font-bold text-bm-maroon shadow-sm border border-bm-maroon/10">
                        <span className="material-symbols-outlined text-[12px]">add</span> 50 XP
                      </span>
                    </div>
                  </>
                )}
                
                {/* Completed Session Details */}
                {activity.activityType === 'session_completed' && (
                  <>
                    {activity.description ? (
                      <p className="text-xs text-bm-text-secondary mt-0.5 line-clamp-2">{activity.description}</p>
                    ) : (
                      <p className="text-xs text-bm-text-secondary mt-0.5">Completed high-value scenario.</p>
                    )}
                    {activity.score && (
                      <p className="text-xs font-bold text-bm-maroon mt-1">Score: {activity.score}%</p>
                    )}
                    {activity.metadata?.competencies && Array.isArray(activity.metadata.competencies) && activity.metadata.competencies.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {(activity.metadata.competencies as string[]).slice(0, 2).map((comp, idx) => (
                          <span key={idx} className="text-[9px] font-medium text-bm-text-subtle bg-bm-grey/30 px-1.5 py-0.5 rounded">
                            {comp}
                          </span>
                        ))}
                      </div>
                    )}
                    {activity.metadata?.duration && (
                      <p className="text-[10px] text-bm-text-subtle mt-1.5">
                        <span className="material-symbols-outlined text-[10px] align-middle mr-0.5">schedule</span>
                        Duration: {activity.metadata.duration}
                      </p>
                    )}
                  </>
                )}
                
                {/* Started Session Details */}
                {activity.activityType === 'session_started' && (
                  <>
                    {activity.description ? (
                      <p className="text-xs text-bm-text-secondary mt-0.5 line-clamp-2">{activity.description}</p>
                    ) : (
                      <p className="text-xs text-bm-text-secondary mt-0.5">Module in progress.</p>
                    )}
                    {activity.metadata?.progress && (
                      <div className="mt-2">
                        <div className="w-full bg-bm-grey/50 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-bm-gold h-full rounded-full transition-all relative"
                            style={{ width: `${activity.metadata.progress}%` }}
                          >
                            <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                          </div>
                        </div>
                        <p className="text-[10px] text-bm-text-subtle mt-1">{activity.metadata.progress}% Complete</p>
                      </div>
                    )}
                  </>
                )}
                
                {/* Goal Created Details */}
                {(activity.activityType === 'goal_set' || activity.activityType === 'goal_created') && (
                  <>
                    {activity.description ? (
                      <p className="text-xs text-bm-text-secondary mt-0.5">"{activity.description}"</p>
                    ) : (
                      <p className="text-xs text-bm-text-secondary mt-0.5">New development goal created.</p>
                    )}
                    {activity.metadata?.targetDate && (
                      <p className="text-[10px] text-bm-text-subtle mt-1">Target: {new Date(activity.metadata.targetDate as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    )}
                    {activity.metadata?.progress !== undefined && (
                      <div className="mt-2">
                        <div className="w-full bg-bm-grey/50 rounded-full h-1 overflow-hidden">
                          <div 
                            className="bg-bm-maroon h-full rounded-full transition-all"
                            style={{ width: `${activity.metadata.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] text-bm-text-subtle mt-1">{activity.metadata.progress}% Progress</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )

          if (linkHref !== '#') {
            return (
              <Link key={activity.id} href={linkHref}>
                {content}
              </Link>
            )
          }

          return <div key={activity.id}>{content}</div>
        })}
      </div>
    </div>
  )
}

export const RecentActivityFeed = memo(RecentActivityFeedComponent)

