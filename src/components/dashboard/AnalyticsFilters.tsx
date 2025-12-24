'use client'

import { useState } from 'react'

interface AnalyticsFiltersProps {
  onFilterChange?: (filters: { employee: string; timePeriod: string; scenario: string }) => void
  onSavePreset?: () => void
  onApplyFilters?: () => void
  presetName?: string
  onPresetNameChange?: (name: string) => void
}

export function AnalyticsFilters({ onFilterChange, onSavePreset, onApplyFilters, presetName = '', onPresetNameChange }: AnalyticsFiltersProps) {
  const [filters, setFilters] = useState({
    employee: 'All Employees',
    timePeriod: 'Last 30 Days',
    scenario: 'All Scenarios',
  })

  const handleChange = (key: 'employee' | 'timePeriod' | 'scenario', value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  return (
    <section className="bg-bm-white p-3 rounded-xl shadow-card border border-bm-grey/60 flex flex-col lg:flex-row items-center justify-between gap-3">
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <span className="material-symbols-outlined text-bm-text-secondary text-base">filter_alt</span>
          <span className="font-bold text-xs text-bm-text-primary whitespace-nowrap">Filters:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full lg:w-auto">
          {/* Employee Filter */}
          <div className="relative">
            <select
              className="appearance-none w-full sm:w-44 pl-2.5 pr-8 py-1.5 text-xs bg-bm-light-grey border-bm-grey rounded-lg focus:ring-2 focus:ring-bm-maroon focus:border-bm-maroon transition-shadow cursor-pointer font-medium text-bm-text-secondary"
              value={filters.employee}
              onChange={(e) => handleChange('employee', e.target.value)}
            >
              <option>All Employees</option>
              <option>Sara Ali</option>
              <option>Omar Khaled</option>
              <option>Fatima Zahra</option>
              <option>Youssef Ibrahim</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1.5 text-bm-text-subtle pointer-events-none text-sm">
              expand_more
            </span>
          </div>
          {/* Time Period Filter */}
          <div className="relative">
            <select
              className="appearance-none w-full sm:w-44 pl-2.5 pr-8 py-1.5 text-xs bg-bm-light-grey border-bm-grey rounded-lg focus:ring-2 focus:ring-bm-maroon focus:border-bm-maroon transition-shadow cursor-pointer font-medium text-bm-text-secondary"
              value={filters.timePeriod}
              onChange={(e) => handleChange('timePeriod', e.target.value)}
            >
              <option>Last 30 Days</option>
              <option>Last Quarter</option>
              <option>Year to Date</option>
              <option>Last 7 Days</option>
              <option>Last 90 Days</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1.5 text-bm-text-subtle pointer-events-none text-sm">
              calendar_month
            </span>
          </div>
          {/* Scenario Filter */}
          <div className="relative">
            <select
              className="appearance-none w-full sm:w-44 pl-2.5 pr-8 py-1.5 text-xs bg-bm-light-grey border-bm-grey rounded-lg focus:ring-2 focus:ring-bm-maroon focus:border-bm-maroon transition-shadow cursor-pointer font-medium text-bm-text-secondary"
              value={filters.scenario}
              onChange={(e) => handleChange('scenario', e.target.value)}
            >
              <option>All Scenarios</option>
              <option>Negotiation</option>
              <option>Complaints</option>
              <option>Performance Review</option>
              <option>Client Escalation</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1.5 text-bm-text-subtle pointer-events-none text-sm">
              category
            </span>
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
        <button
          className="text-xs font-semibold text-bm-text-secondary hover:text-bm-maroon transition-colors px-2.5 py-1.5 rounded-lg hover:bg-bm-light-grey"
          onClick={onSavePreset}
        >
          Save Preset
        </button>
        <button
          className="bg-bm-gold text-bm-maroon-dark font-bold py-2 px-4 rounded-lg text-xs hover:bg-bm-gold-dark transition-all shadow-sm hover:shadow-md active:transform active:scale-95 flex items-center gap-1.5"
          onClick={onApplyFilters}
        >
          <span>Apply Filters</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </section>
  )
}

