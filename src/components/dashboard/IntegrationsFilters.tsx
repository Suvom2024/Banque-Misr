'use client'

import { useState } from 'react'

type Category = 'all' | 'communication' | 'productivity' | 'servers-apis'

interface IntegrationsFiltersProps {
  activeCategory?: Category
  onCategoryChange?: (category: Category) => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

export function IntegrationsFilters({
  activeCategory = 'all',
  onCategoryChange,
  searchQuery = '',
  onSearchChange,
}: IntegrationsFiltersProps) {
  const categories: Array<{ id: Category; label: string }> = [
    { id: 'all', label: 'All Services' },
    { id: 'communication', label: 'Communication' },
    { id: 'productivity', label: 'Productivity' },
    { id: 'servers-apis', label: 'Servers & APIs' },
  ]

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
      {/* Category Filters */}
      <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange?.(category.id)}
            className={`px-3 py-1.5 rounded-full font-medium text-xs shadow-sm whitespace-nowrap transition-colors ${
              activeCategory === category.id
                ? 'bg-bm-maroon text-bm-white'
                : 'bg-white text-bm-text-secondary border border-bm-grey hover:bg-bm-light-grey'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-80">
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
          <span className="material-symbols-outlined text-bm-text-subtle text-sm">search</span>
        </div>
        <input
          className="block w-full pl-9 pr-2.5 py-2 border border-bm-grey rounded-lg leading-5 bg-white placeholder-bm-text-subtle focus:outline-none focus:ring-1 focus:ring-bm-maroon focus:border-bm-maroon text-xs shadow-sm"
          placeholder="Search integrations..."
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
      </div>
    </div>
  )
}


