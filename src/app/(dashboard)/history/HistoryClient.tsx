'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { Activity } from '@/types/dashboard'

export function HistoryClient() {
    const [activities, setActivities] = useState<Activity[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchHistory = useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/dashboard/activity?limit=50')
            if (!response.ok) throw new Error('Failed to fetch history')
            const data = await response.json()
            setActivities(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchHistory()
    }, [fetchHistory])

    const formatDateTime = (timestamp: string) => {
        const date = new Date(timestamp)
        return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        }
    }

    const getScoreColor = (score?: number) => {
        if (!score) return 'text-bm-text-subtle'
        if (score >= 90) return 'text-green-600'
        if (score >= 80) return 'text-bm-gold-dark'
        return 'text-bm-maroon'
    }

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'session_completed': return 'check_circle'
            case 'session_started': return 'play_circle'
            case 'achievement_earned': return 'emoji_events'
            case 'goal_created': return 'flag'
            default: return 'history'
        }
    }

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="max-w-screen-2xl mx-auto space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                    <div className="bg-white rounded-xl h-96 animate-pulse border border-bm-grey"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="max-w-screen-2xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-bm-text-primary">Recent Activity Feed</h2>
                        <p className="text-bm-text-secondary text-sm mt-1">A comprehensive log of all your training sessions and achievements.</p>
                    </div>
                    <button
                        onClick={fetchHistory}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-bm-grey rounded-lg text-sm font-bold text-bm-text-secondary hover:bg-bm-light-grey transition-all"
                    >
                        <span className="material-symbols-outlined text-lg">refresh</span>
                        Refresh
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-card border border-bm-grey overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-bm-light-grey border-b border-bm-grey">
                                    <th className="p-4 text-[10px] font-bold text-bm-text-subtle uppercase tracking-wider">Activity</th>
                                    <th className="p-4 text-[10px] font-bold text-bm-text-subtle uppercase tracking-wider">Type</th>
                                    <th className="p-4 text-[10px] font-bold text-bm-text-subtle uppercase tracking-wider">Date & Time</th>
                                    <th className="p-4 text-[10px] font-bold text-bm-text-subtle uppercase tracking-wider">Score</th>
                                    <th className="p-4 text-[10px] font-bold text-bm-text-subtle uppercase tracking-wider">Status</th>
                                    <th className="p-4 text-[10px] font-bold text-bm-text-subtle uppercase tracking-wider text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-bm-grey/50">
                                {activities.map((activity) => {
                                    const { date, time } = formatDateTime(activity.timestamp)
                                    const actType = activity.type || (activity.activityType as any) || 'unknown'
                                    const isSession = actType.startsWith('session_')

                                    return (
                                        <tr key={activity.id} className="group hover:bg-bm-light-grey/30 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${actType === 'session_completed' ? 'bg-green-50 text-green-600' :
                                                            actType === 'achievement_earned' ? 'bg-bm-gold/20 text-bm-maroon' :
                                                                'bg-bm-grey/40 text-bm-text-secondary'
                                                        }`}>
                                                        <span className="material-symbols-outlined text-lg">{activity.icon || getActivityIcon(actType)}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-bm-text-primary">{activity.title}</p>
                                                        {activity.description && <p className="text-xs text-bm-text-secondary mt-0.5 truncate max-w-xs">{activity.description}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-xs font-medium text-bm-text-secondary capitalize">
                                                    {actType.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-xs">
                                                    <p className="font-bold text-bm-text-primary">{date}</p>
                                                    <p className="text-bm-text-secondary">{time}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {activity.score !== undefined ? (
                                                    <span className={`text-sm font-bold ${getScoreColor(activity.score)}`}>
                                                        {activity.score}%
                                                    </span>
                                                ) : (
                                                    <span className="text-sm font-medium text-bm-text-subtle">—</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${actType === 'session_completed' ? 'bg-green-100 text-green-700' :
                                                        actType === 'session_started' ? 'bg-bm-gold/20 text-bm-maroon' :
                                                            'bg-bm-grey/10 text-bm-text-subtle'
                                                    }`}>
                                                    {actType === 'session_completed' ? 'Completed' :
                                                        actType === 'session_started' ? 'In Progress' : 'Logged'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                {activity.relatedSessionId ? (
                                                    <Link
                                                        href={`/training-hub/session/${activity.relatedSessionId}`}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bm-maroon text-white rounded-lg text-[10px] font-bold hover:bg-bm-maroon-dark shadow-sm hover:shadow-md transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        View Report
                                                        <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                                    </Link>
                                                ) : (
                                                    <button disabled className="text-bm-text-subtle opacity-50">
                                                        <span className="material-symbols-outlined">more_horiz</span>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}

                                {activities.length === 0 && !isLoading && (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="material-symbols-outlined text-4xl text-bm-text-subtle mb-3">history</span>
                                                <p className="text-bm-text-secondary font-medium">No activity history found.</p>
                                                <Link href="/training-hub" className="text-bm-maroon text-sm font-bold mt-2 hover:underline">
                                                    Start your first session
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
