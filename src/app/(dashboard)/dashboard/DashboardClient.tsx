'use client'

import { useDashboardData } from '@/hooks/useDashboardData'
import { QuickStatsBar } from '@/components/dashboard/dashboard/QuickStatsBar'
import { OverallPerformance } from '@/components/dashboard/OverallPerformance'
import { RecommendedFocus } from '@/components/dashboard/RecommendedFocus'
import { SkillRadarChart } from '@/components/dashboard/dashboard/SkillRadarChart'
import { RecentActivityFeed } from '@/components/dashboard/dashboard/RecentActivityFeed'
import { PerformanceTrendChart } from '@/components/dashboard/dashboard/PerformanceTrendChart'
import { TrainingScenarios } from '@/components/dashboard/TrainingScenarios'

export function DashboardClient() {
  const { data, isLoading, error, refetch } = useDashboardData()

  const handleDismissRecommendation = async (id: string) => {
    try {
      const response = await fetch(`/api/dashboard/recommendations/${id}`, {
        method: 'PATCH',
      })
      if (response.ok) {
        await refetch()
      }
    } catch (error) {
      console.error('Error dismissing recommendation:', error)
    }
  }

  const handleRefreshRecommendations = async () => {
    try {
      await fetch('/api/dashboard/recommendations', {
        method: 'POST',
      })
      await refetch()
    } catch (error) {
      console.error('Error refreshing recommendations:', error)
    }
  }

  if (error) {
    return (
      <div className="px-6 lg:px-8 py-6 lg:py-8">
        <div className="max-w-screen-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <span className="material-symbols-outlined text-red-500 text-4xl mb-2">error</span>
            <p className="text-red-700 font-medium mb-1">Error loading dashboard</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-8 py-8">
      <div className="max-w-screen-2xl mx-auto space-y-8 pb-12">
        {/* Quick Stats Bar */}
        <section className="animate-fade-in space-y-6">
          {data.quickStats && <QuickStatsBar stats={data.quickStats} isLoading={isLoading} />}
        </section>

        {/* Performance Section */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <OverallPerformance
            performance={data.performance}
            isLoading={isLoading}
            onRefresh={refetch}
          />
          <RecommendedFocus
            recommendation={data.recommendedFocus}
            isLoading={isLoading}
            onRefresh={handleRefreshRecommendations}
            onDismiss={handleDismissRecommendation}
          />
        </section>

        {/* Competency, Trend, and Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-slide-up items-stretch" style={{ animationDelay: '0.1s' }}>
          <SkillRadarChart competencies={data.competencies} isLoading={isLoading} />
          <PerformanceTrendChart data={data.performanceTrend} isLoading={isLoading} />
          <RecentActivityFeed activities={data.recentActivity} isLoading={isLoading} />
        </div>

        {/* Training Scenarios Section */}
        <section className="animate-slide-up space-y-6" style={{ animationDelay: '0.3s' }}>
          <TrainingScenarios scenarios={data.trainingScenarios} isLoading={isLoading} />
        </section>
      </div>
    </div>
  )
}

