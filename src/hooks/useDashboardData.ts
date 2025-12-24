'use client'

import { useState, useEffect } from 'react'
import type {
  UserPerformance,
  QuickStats,
  Competency,
  Activity,
  TrendDataPoint,
  Recommendation,
  ScenarioWithProgress,
  DevelopmentGoal,
} from '@/types/dashboard'

interface DashboardData {
  performance: UserPerformance | null
  quickStats: QuickStats | null
  competencies: Competency[]
  recentActivity: Activity[]
  performanceTrend: TrendDataPoint[]
  recommendedFocus: Recommendation | null
  trainingScenarios: ScenarioWithProgress[]
  activeGoals: DevelopmentGoal[]
}

interface UseDashboardDataReturn {
  data: DashboardData
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDashboardData(): UseDashboardDataReturn {
  const [data, setData] = useState<DashboardData>({
    performance: null,
    quickStats: null,
    competencies: [],
    recentActivity: [],
    performanceTrend: [],
    recommendedFocus: null,
    trainingScenarios: [],
    activeGoals: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [
        performanceRes,
        statsRes,
        competenciesRes,
        activityRes,
        trendsRes,
        recommendationsRes,
        scenariosRes,
        goalsRes,
      ] = await Promise.all([
        fetch('/api/dashboard/performance?period=month'),
        fetch('/api/dashboard/stats?period=week'),
        fetch('/api/dashboard/competencies'),
        fetch('/api/dashboard/activity?limit=5'),
        fetch('/api/dashboard/trends?period=month'),
        fetch('/api/dashboard/recommendations'),
        fetch('/api/dashboard/scenarios?filter=recommended&limit=6'),
        fetch('/api/development-goals?status=active&limit=3').catch(() => null), // May not exist yet
      ])

      const [
        performance,
        quickStats,
        competencies,
        recentActivity,
        performanceTrend,
        recommendedFocus,
        trainingScenarios,
        goalsData,
      ] = await Promise.all([
        performanceRes.ok ? performanceRes.json() : null,
        statsRes.ok ? statsRes.json() : null,
        competenciesRes.ok ? competenciesRes.json() : [],
        activityRes.ok ? activityRes.json() : [],
        trendsRes.ok ? trendsRes.json() : [],
        recommendationsRes.ok ? recommendationsRes.json() : null,
        scenariosRes.ok ? scenariosRes.json() : [],
        goalsRes && goalsRes.ok ? goalsRes.json() : [],
      ])

      setData({
        performance,
        quickStats,
        competencies,
        recentActivity,
        performanceTrend,
        recommendedFocus,
        trainingScenarios,
        activeGoals: goalsData || [],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      console.error('Error fetching dashboard data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  }
}

