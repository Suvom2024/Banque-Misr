'use client'

import { useState } from 'react'

type Category = 'all' | 'customer-service' | 'compliance' | 'leadership'

interface CategoryFiltersProps {
  activeCategory?: Category
  onCategoryChange?: (category: Category) => void
  currentPage?: number
  totalPages?: number
  totalScenarios?: number
  showingCount?: number
  onPageChange?: (direction: 'prev' | 'next') => void
}

export function CategoryFilters({
  activeCategory = 'all',
  onCategoryChange,
  currentPage = 1,
  totalPages = 4,
  totalScenarios = 12,
  showingCount = 3,
  onPageChange,
}: CategoryFiltersProps) {
  const categories: Array<{ id: Category; label: string }> = [
    { id: 'all', label: 'All Scenarios' },
    { id: 'customer-service', label: 'Customer Service' },
    { id: 'compliance', label: 'Compliance' },
    { id: 'leadership', label: 'Leadership' },
  ]

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scroll-hide pb-1">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange?.(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold shadow-md transition-transform active:scale-95 ${
              activeCategory === category.id
                ? 'bg-bm-maroon text-bm-white'
                : 'bg-bm-white border border-bm-grey text-bm-text-secondary hover:bg-bm-light-grey hover:text-bm-maroon'
            }`}
          >
            {category.label}
          </button>
        ))}
        <button className="px-4 py-2 rounded-full bg-bm-white border border-bm-grey text-bm-text-secondary text-sm font-medium hover:bg-bm-light-grey hover:text-bm-maroon transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-base">filter_list</span>
          Filter
        </button>
      </div>

      {/* Pagination */}
      <div className="flex items-center gap-2 text-sm text-bm-text-secondary">
        <span className="hidden sm:inline">Showing {showingCount} of {totalScenarios}</span>
        <div className="flex gap-1 ml-2">
          <button
            className="w-9 h-9 rounded-full border border-bm-grey bg-bm-white hover:bg-bm-light-grey hover:text-bm-maroon hover:border-bm-maroon transition-all flex items-center justify-center"
            onClick={() => onPageChange?.('prev')}
            disabled={currentPage === 1}
          >
            <span className="material-symbols-outlined text-xl">chevron_left</span>
          </button>
          <button
            className="w-9 h-9 rounded-full border border-bm-grey bg-bm-white hover:bg-bm-light-grey hover:text-bm-maroon hover:border-bm-maroon transition-all flex items-center justify-center"
            onClick={() => onPageChange?.('next')}
            disabled={currentPage === totalPages}
          >
            <span className="material-symbols-outlined text-xl">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  )
}


