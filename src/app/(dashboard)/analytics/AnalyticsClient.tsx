'use client'

import dynamic from 'next/dynamic'
import { useCallback, memo } from 'react'
import { AnalyticsHeader } from '@/components/dashboard/AnalyticsHeader'
import { AnalyticsFilters } from '@/components/dashboard/AnalyticsFilters'

// Dynamic imports for chart-heavy components to improve initial load
const TeamPerformanceCard = dynamic(() => import('@/components/dashboard/TeamPerformanceCard').then(mod => ({ default: mod.TeamPerformanceCard })), {
  loading: () => <div className="bg-white rounded-2xl shadow-card border border-white p-8 animate-pulse"><div className="h-64 bg-gray-200 rounded"></div></div>,
  ssr: false,
})

const PerformanceTrendCard = dynamic(() => import('@/components/dashboard/PerformanceTrendCard').then(mod => ({ default: mod.PerformanceTrendCard })), {
  loading: () => <div className="bg-white rounded-2xl shadow-card border border-white p-8 animate-pulse"><div className="h-64 bg-gray-200 rounded"></div></div>,
  ssr: false,
})

const CompetencyBreakdownCard = dynamic(() => import('@/components/dashboard/CompetencyBreakdownCard').then(mod => ({ default: mod.CompetencyBreakdownCard })), {
  loading: () => <div className="bg-white rounded-2xl shadow-card border border-white p-8 animate-pulse"><div className="h-64 bg-gray-200 rounded"></div></div>,
  ssr: false,
})

const AIInsightsCard = dynamic(() => import('@/components/dashboard/AIInsightsCard').then(mod => ({ default: mod.AIInsightsCard })), {
  loading: () => <div className="bg-white rounded-2xl shadow-card border border-white p-8 animate-pulse"><div className="h-48 bg-gray-200 rounded"></div></div>,
  ssr: true,
})

const EmployeeMetricsTable = dynamic(() => import('@/components/dashboard/EmployeeMetricsTable').then(mod => ({ default: mod.EmployeeMetricsTable })), {
  loading: () => <div className="bg-white rounded-2xl shadow-card border border-white p-8 animate-pulse"><div className="h-96 bg-gray-200 rounded"></div></div>,
  ssr: true,
})

interface AnalyticsClientProps {
  userName: string
  userRole?: string
  userAvatar?: string
}

function AnalyticsClientComponent({ userName, userRole, userAvatar }: AnalyticsClientProps) {
  const handleFilterChange = useCallback((filters: { employee: string; timePeriod: string; scenario: string }) => {
    // Handle filter changes - implement filtering logic here
  }, [])

  const handleSavePreset = useCallback(() => {
    // Handle save preset - implement preset saving logic here
  }, [])

  const handleApplyFilters = useCallback(() => {
    // Handle apply filters - implement filter application logic here
  }, [])

  const handleExportCSV = useCallback(() => {
    // Handle CSV export - implement CSV generation and download logic here
  }, [])

  const handleViewDetails = useCallback((employeeId: string) => {
    // Handle view details - navigate to employee detail page
    window.location.href = `/analytics/employee/${employeeId}`
  }, [])

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-bm-light-grey">
      <AnalyticsHeader userName={userName} userRole={userRole} userAvatar={userAvatar} />

      <main className="flex-grow overflow-y-auto scroll-smooth">
        <div className="px-6 lg:px-8 py-6 lg:py-8">
          <div className="max-w-[1600px] mx-auto space-y-8">
          {/* Filters */}
          <AnalyticsFilters
            onFilterChange={handleFilterChange}
            onSavePreset={handleSavePreset}
            onApplyFilters={handleApplyFilters}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - 2 spans */}
            <div className="xl:col-span-2 space-y-8">
              {/* Team Performance Card */}
              <TeamPerformanceCard />

              {/* Performance Trend Card */}
              <PerformanceTrendCard />
            </div>

            {/* Right Column - 1 span */}
            <div className="space-y-8">
              {/* Competency Breakdown Card */}
              <CompetencyBreakdownCard />

              {/* AI Insights Card */}
              <AIInsightsCard />
            </div>
          </div>

          {/* Employee Metrics Table */}
          <EmployeeMetricsTable
            onExportCSV={handleExportCSV}
            onViewDetails={handleViewDetails}
          />
          </div>
        </div>
      </main>
    </div>
  )
}

export const AnalyticsClient = memo(AnalyticsClientComponent)

