'use client'

import { useState, useRef, memo, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

export interface EmployeeMetric {
  id: string
  name: string
  initials: string
  avgScore: number
  completion: number
  timeTrained: string
  topSkill: string
  needsImprovement: string
  avatarColor: string
}

interface EmployeeMetricsTableProps {
  employees?: EmployeeMetric[]
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  onExportCSV?: () => void
  onViewDetails?: (employeeId: string) => void
}

// Move default data outside component to prevent re-creation on every render
const defaultEmployees: EmployeeMetric[] = [
  {
    id: '1',
    name: 'Sara Ali',
    initials: 'SA',
    avgScore: 91,
    completion: 100,
    timeTrained: '12.5h',
    topSkill: 'Empathy',
    needsImprovement: 'Pacing',
    avatarColor: 'bg-bm-maroon/10 text-bm-maroon',
  },
  {
    id: '2',
    name: 'Omar Khaled',
    initials: 'OK',
    avgScore: 82,
    completion: 75,
    timeTrained: '9.8h',
    topSkill: 'Negotiation',
    needsImprovement: 'Clarity',
    avatarColor: 'bg-blue-50 text-blue-700',
  },
  {
    id: '3',
    name: 'Fatima Zahra',
    initials: 'FZ',
    avgScore: 94,
    completion: 100,
    timeTrained: '15.1h',
    topSkill: 'De-escalation',
    needsImprovement: 'None',
    avatarColor: 'bg-purple-50 text-purple-700',
  },
  {
    id: '4',
    name: 'Youssef Ibrahim',
    initials: 'YI',
    avgScore: 74,
    completion: 60,
    timeTrained: '7.2h',
    topSkill: 'Rapport',
    needsImprovement: 'Objection',
    avatarColor: 'bg-gray-100 text-gray-600',
  },
]

// Helper functions outside component for better performance
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-bm-success'
    if (score >= 80) return 'text-bm-warning'
    return 'text-bm-danger'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-bm-success'
    if (score >= 80) return 'bg-bm-warning'
    return 'bg-bm-danger'
  }

  const getCompletionColor = (completion: number) => {
    if (completion === 100) return 'text-bm-text-primary'
    if (completion >= 75) return 'text-bm-text-secondary'
    return 'text-bm-danger'
  }

  const getNeedsImprovementColor = (skill: string) => {
    if (skill === 'None') return 'bg-green-50 border-green-200 text-green-700'
    return 'bg-orange-50 border-orange-200 text-orange-700'
  }

function EmployeeMetricsTableComponent({
  employees = defaultEmployees,
  currentPage = 1,
  totalPages = 6,
  onPageChange,
  onExportCSV,
  onViewDetails,
}: EmployeeMetricsTableProps) {
  const [page, setPage] = useState(currentPage)
  const parentRef = useRef<HTMLTableSectionElement>(null)

  // Virtualize table rows for better performance
  const rowVirtualizer = useVirtualizer({
    count: employees.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Approximate row height
    overscan: 5, // Render 5 extra rows above/below viewport
  })

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
      onPageChange?.(newPage)
    }
  }, [totalPages, onPageChange])

  const handleViewDetails = useCallback((employeeId: string) => {
    onViewDetails?.(employeeId)
  }, [onViewDetails])

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-bm-text-primary tracking-tighter leading-tight">Detailed Employee Metrics</h2>
          <p className="text-bm-text-secondary text-sm mt-1 leading-relaxed">Individual performance data drill-down.</p>
        </div>
        <div className="flex gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-bm-white border border-bm-grey rounded-lg text-sm font-bold text-bm-text-secondary"
            onClick={onExportCSV}
          >
            <span className="material-symbols-outlined text-lg">download</span>
            Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-bm-white border border-bm-grey rounded-lg text-sm font-bold text-bm-text-secondary">
            <span className="material-symbols-outlined text-lg">view_column</span>
            Columns
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-bm-grey overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-bm-light-grey border-b border-bm-grey">
                <th className="p-5 text-xs font-bold text-bm-text-subtle uppercase tracking-wider">Employee</th>
                <th className="p-5 text-xs font-bold text-bm-text-subtle uppercase tracking-wider">Avg. Score</th>
                <th className="p-5 text-xs font-bold text-bm-text-subtle uppercase tracking-wider">Completion</th>
                <th className="p-5 text-xs font-bold text-bm-text-subtle uppercase tracking-wider">Time Trained</th>
                <th className="p-5 text-xs font-bold text-bm-text-subtle uppercase tracking-wider">Top Skill</th>
                <th className="p-5 text-xs font-bold text-bm-text-subtle uppercase tracking-wider">Needs Improvement</th>
                <th className="p-5 text-xs font-bold text-bm-text-subtle uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody
              ref={parentRef}
              className="divide-y divide-bm-grey/50 relative"
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const employee = employees[virtualRow.index]
                return (
                  <tr
                    key={employee.id}
                    className="group absolute w-full"
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full ${employee.avatarColor} flex items-center justify-center text-xs font-bold`}>
                        {employee.initials}
                      </div>
                      <span className="font-bold text-sm text-bm-text-primary">{employee.name}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${getScoreColor(employee.avgScore)}`}>{employee.avgScore}%</span>
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getScoreBgColor(employee.avgScore)}`}
                          style={{ width: `${employee.avgScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`text-sm font-medium ${getCompletionColor(employee.completion)}`}>
                      {employee.completion}%
                    </span>
                  </td>
                  <td className="p-5 text-sm text-bm-text-secondary">{employee.timeTrained}</td>
                  <td className="p-5">
                    <span className="bg-bm-maroon/5 border border-bm-maroon/20 text-bm-maroon font-semibold py-1 px-3 rounded-full text-xs">
                      {employee.topSkill}
                    </span>
                  </td>
                  <td className="p-5">
                    <span
                      className={`font-semibold py-1 px-3 rounded-full text-xs border ${getNeedsImprovementColor(employee.needsImprovement)}`}
                    >
                      {employee.needsImprovement}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <button
                      className="text-bm-text-subtle p-1.5 rounded-full shadow-sm opacity-0"
                        onClick={() => handleViewDetails(employee.id)}
                    >
                      <span className="material-symbols-outlined text-xl">visibility</span>
                    </button>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="p-4 bg-bm-light-grey border-t border-bm-grey flex justify-between items-center text-xs text-bm-text-secondary">
          <span>Showing {employees.length} of {totalPages * 4} employees</span>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 bg-white border border-bm-grey rounded disabled:opacity-50"
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
            >
              Previous
            </button>
            <button
              className="px-3 py-1 bg-white border border-bm-grey rounded"
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export const EmployeeMetricsTable = memo(EmployeeMetricsTableComponent)

