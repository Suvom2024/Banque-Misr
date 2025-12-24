'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { AnalyticsHeader } from '@/components/dashboard/AnalyticsHeader'
import { AnalyticsFilters } from '@/components/dashboard/AnalyticsFilters'
import type { AnalyticsFilters as AnalyticsFiltersType } from '@/lib/services/analytics/analyticsService'

// Dynamic imports for chart-heavy components to improve initial load
const TeamPerformanceCard = dynamic(() => import('@/components/dashboard/TeamPerformanceCard').then(mod => ({ default: mod.TeamPerformanceCard })), {
  loading: () => <div className="bg-white rounded-2xl shadow-card border border-white p-8"><div className="h-64 bg-gray-200 rounded"></div></div>,
  ssr: true,
})

const PerformanceTrendCard = dynamic(() => import('@/components/dashboard/PerformanceTrendCard').then(mod => ({ default: mod.PerformanceTrendCard })), {
  loading: () => <div className="bg-white rounded-2xl shadow-card border border-white p-8"><div className="h-64 bg-gray-200 rounded"></div></div>,
  ssr: true,
})

const CompetencyBreakdownCard = dynamic(() => import('@/components/dashboard/CompetencyBreakdownCard').then(mod => ({ default: mod.CompetencyBreakdownCard })), {
  loading: () => <div className="bg-white rounded-2xl shadow-card border border-white p-8"><div className="h-64 bg-gray-200 rounded"></div></div>,
  ssr: true,
})

const AIInsightsCard = dynamic(() => import('@/components/dashboard/AIInsightsCard').then(mod => ({ default: mod.AIInsightsCard })), {
  loading: () => <div className="bg-white rounded-2xl shadow-card border border-white p-8"><div className="h-48 bg-gray-200 rounded"></div></div>,
  ssr: true,
})

const EmployeeMetricsTable = dynamic(() => import('@/components/dashboard/EmployeeMetricsTable').then(mod => ({ default: mod.EmployeeMetricsTable })), {
  loading: () => <div className="bg-white rounded-2xl shadow-card border border-white p-8"><div className="h-96 bg-gray-200 rounded"></div></div>,
  ssr: true,
})

interface AnalyticsClientProps {
  userName: string
  userRole?: string
  userAvatar?: string
}

export function AnalyticsClient({ userName, userRole, userAvatar }: AnalyticsClientProps) {
  const [filters, setFilters] = useState<AnalyticsFiltersType>({
    timePeriod: 'month',
  })
  const [teamPerformance, setTeamPerformance] = useState<any>(null)
  const [trends, setTrends] = useState<any[]>([])
  const [competencies, setCompetencies] = useState<any[]>([])
  const [insights, setInsights] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [presetName, setPresetName] = useState('')

  useEffect(() => {
    fetchAnalyticsData()
  }, [filters])

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true)

      const params = new URLSearchParams()
      if (filters.employeeId) params.append('employeeId', filters.employeeId)
      if (filters.timePeriod) params.append('timePeriod', filters.timePeriod)
      if (filters.scenarioId) params.append('scenarioId', filters.scenarioId)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const [performanceRes, trendsRes, competenciesRes, insightsRes, employeesRes] = await Promise.all([
        fetch(`/api/analytics/team-performance?${params}`),
        fetch(`/api/analytics/trends?${params}`),
        fetch(`/api/analytics/competencies?${params}`),
        fetch(`/api/analytics/insights?${params}`),
        fetch(`/api/analytics/employees?${params}`),
      ])

      const [performance, trendsData, competenciesData, insightsData, employeesData] = await Promise.all([
        performanceRes.ok ? performanceRes.json() : null,
        trendsRes.ok ? trendsRes.json() : [],
        competenciesRes.ok ? competenciesRes.json() : [],
        insightsRes.ok ? insightsRes.json() : [],
        employeesRes.ok ? employeesRes.json() : [],
      ])

      setTeamPerformance(performance)
      setTrends(trendsData)
      setCompetencies(competenciesData)
      setInsights(insightsData)
      setEmployees(employeesData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = useCallback((newFilters: { employee: string; timePeriod: string; scenario: string }) => {
    setFilters((prev) => ({
      ...prev,
      employeeId: newFilters.employee || undefined,
      timePeriod: (newFilters.timePeriod as AnalyticsFiltersType['timePeriod']) || 'month',
      scenarioId: newFilters.scenario || undefined,
    }))
  }, [])

  const handleSavePreset = useCallback(async () => {
    if (!presetName.trim()) {
      alert('Please enter a preset name')
      return
    }

    try {
      const response = await fetch('/api/analytics/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presetName: presetName.trim(),
          filters,
        }),
      })

      if (response.ok) {
        alert('Preset saved successfully!')
        setPresetName('')
      } else {
        throw new Error('Failed to save preset')
      }
    } catch (error) {
      console.error('Error saving preset:', error)
      alert('Failed to save preset')
    }
  }, [presetName, filters])

  const handleApplyFilters = useCallback(() => {
    fetchAnalyticsData()
  }, [filters])

  const handleExportCSV = useCallback(() => {
    // Convert employees data to CSV
    const headers = ['Name', 'Avg Score', 'Completion Rate', 'Time Trained', 'Top Skills', 'Needs Improvement']
    const rows = employees.map((emp) => [
      emp.name,
      emp.avgScore,
      `${emp.completionRate}%`,
      `${emp.timeTrained}h`,
      emp.topSkills.join(', '),
      emp.needsImprovement.join(', '),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }, [employees])

  const handleViewDetails = useCallback((employeeId: string) => {
    window.location.href = `/analytics/employee/${employeeId}`
  }, [])

  // Transform employees data to match component interface
  const transformedEmployees = useMemo(() => {
    return employees.map((emp, index) => ({
      id: emp.id,
      name: emp.name,
      initials: emp.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
      avgScore: Math.round(emp.avgScore),
      completion: Math.round(emp.completionRate),
      timeTrained: `${emp.timeTrained}h`,
      topSkill: emp.topSkills?.[0] || 'N/A',
      needsImprovement: emp.needsImprovement?.[0] || 'None',
      avatarColor: `bg-${['maroon', 'blue', 'purple', 'gray'][index % 4]}-50 text-${['maroon', 'blue', 'purple', 'gray'][index % 4]}-700`,
    }))
  }, [employees])

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
            presetName={presetName}
            onPresetNameChange={setPresetName}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - 2 spans */}
            <div className="xl:col-span-2 space-y-8">
              {/* Team Performance Card */}
              <TeamPerformanceCard
                overallScore={teamPerformance?.overallScore}
                trend={teamPerformance?.trend ? `+${teamPerformance.trend}% vs Target` : undefined}
                simulationsCount={teamPerformance?.totalSessions}
                aiSummary={teamPerformance?.aiSummary}
                isLoading={isLoading}
              />

              {/* Performance Trend Card */}
              <PerformanceTrendCard
                data={trends.length > 0 ? trends : undefined}
                isLoading={isLoading}
              />
            </div>

            {/* Right Column - 1 span */}
            <div className="space-y-8">
              {/* Competency Breakdown Card */}
              <CompetencyBreakdownCard
                competencies={competencies.length > 0 ? competencies : undefined}
                isLoading={isLoading}
              />

              {/* AI Insights Card */}
              <AIInsightsCard
                insights={insights.length > 0 ? insights : undefined}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Employee Metrics Table */}
          <EmployeeMetricsTable
            employees={transformedEmployees}
            onExportCSV={handleExportCSV}
            onViewDetails={handleViewDetails}
            isLoading={isLoading}
          />
          </div>
        </div>
      </main>
    </div>
  )
}
