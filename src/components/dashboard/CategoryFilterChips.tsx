'use client'

export type CategoryFilter = 'all' | 'customer-service' | 'sales-retention' | 'leadership' | 'recommended'

interface CategoryFilterChipsProps {
  activeFilter: CategoryFilter
  onFilterChange: (filter: CategoryFilter) => void
}

export function CategoryFilterChips({ activeFilter, onFilterChange }: CategoryFilterChipsProps) {
  const filters: { id: CategoryFilter; label: string; icon?: string }[] = [
    { id: 'all', label: 'All', icon: 'apps' },
    { id: 'customer-service', label: 'Customer Service' },
    { id: 'sales-retention', label: 'Sales & Retention' },
    { id: 'leadership', label: 'Leadership' },
    { id: 'recommended', label: 'Recommended' },
  ]

  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`filter-chip flex items-center gap-1.5 px-4 py-1.5 rounded-full whitespace-nowrap transition-all text-xs ${
            activeFilter === filter.id
              ? 'bg-bm-maroon text-white shadow-lg border border-transparent font-semibold'
              : 'bg-white text-bm-text-secondary border border-gray-200 hover:shadow-md font-medium'
          }`}
        >
          {filter.icon && <span className="material-symbols-outlined text-base">{filter.icon}</span>}
          {filter.id === 'recommended' && <span className="w-1.5 h-1.5 rounded-full bg-bm-gold"></span>}
          {filter.label}
        </button>
      ))}
      <div className="h-6 w-px bg-gray-300 mx-1.5"></div>
      <button className="text-bm-text-subtle hover:text-bm-maroon transition-colors p-1.5">
        <span className="material-symbols-outlined text-base">tune</span>
      </button>
    </div>
  )
}

