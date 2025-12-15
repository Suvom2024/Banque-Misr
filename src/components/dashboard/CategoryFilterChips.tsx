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
    <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`filter-chip flex items-center gap-2 px-6 py-2.5 rounded-full whitespace-nowrap transition-all ${
            activeFilter === filter.id
              ? 'bg-bm-maroon text-white shadow-lg border border-transparent'
              : 'bg-white text-bm-text-secondary border border-gray-200 hover:shadow-md'
          }`}
        >
          {filter.icon && <span className="material-symbols-outlined text-[20px]">{filter.icon}</span>}
          {filter.id === 'recommended' && <span className="w-2 h-2 rounded-full bg-bm-gold"></span>}
          {filter.label}
        </button>
      ))}
      <div className="h-8 w-px bg-gray-300 mx-2"></div>
      <button className="text-bm-text-subtle hover:text-bm-maroon transition-colors p-2">
        <span className="material-symbols-outlined">tune</span>
      </button>
    </div>
  )
}

