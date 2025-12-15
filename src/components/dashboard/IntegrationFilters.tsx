'use client'

export type IntegrationCategory = 'all' | 'communication' | 'productivity' | 'servers-apis'

interface IntegrationFiltersProps {
  activeCategory: IntegrationCategory
  onCategoryChange: (category: IntegrationCategory) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

const categories: { id: IntegrationCategory; label: string }[] = [
  { id: 'all', label: 'All Services' },
  { id: 'communication', label: 'Communication' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'servers-apis', label: 'Servers & APIs' },
]

export function IntegrationFilters({
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}: IntegrationFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
      {/* Category Tabs */}
      <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-5 py-2.5 rounded-full font-medium text-sm shadow-sm whitespace-nowrap transition-colors ${
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
      <div className="relative w-full sm:w-96">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="material-symbols-outlined text-bm-text-subtle">search</span>
        </div>
        <input
          className="block w-full pl-10 pr-3 py-2.5 border border-bm-grey rounded-lg leading-5 bg-white placeholder-bm-text-subtle focus:outline-none focus:ring-1 focus:ring-bm-maroon focus:border-bm-maroon sm:text-sm shadow-sm"
          placeholder="Search integrations..."
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  )
}

