'use client'

export type Category = 'all' | 'customer-service' | 'compliance' | 'leadership'

interface CategoryTabsProps {
  activeCategory: Category
  onCategoryChange: (category: Category) => void
  currentPage?: number
  totalPages?: number
  totalItems?: number
  showingItems?: number
  onPrevious?: () => void
  onNext?: () => void
}

const categories: { id: Category; label: string }[] = [
  { id: 'all', label: 'All Scenarios' },
  { id: 'customer-service', label: 'Customer Service' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'leadership', label: 'Leadership' },
]

export function CategoryTabs({
  activeCategory,
  onCategoryChange,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  showingItems = 0,
  onPrevious,
  onNext,
}: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-1.5 overflow-x-auto scroll-hide pb-1">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-transform active:scale-95 ${
              activeCategory === category.id
                ? 'bg-bm-maroon text-bm-white shadow-md'
                : 'bg-bm-white border border-bm-grey text-bm-text-secondary hover:bg-bm-light-grey hover:text-bm-maroon'
            } transition-colors`}
          >
            {category.label}
          </button>
        ))}
        <button className="px-3 py-1.5 rounded-full bg-bm-white border border-bm-grey text-bm-text-secondary text-xs font-medium hover:bg-bm-light-grey hover:text-bm-maroon transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">filter_list</span>
          Filter
        </button>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-bm-text-secondary">
        <span className="hidden sm:inline">
          Showing {showingItems} of {totalItems}
        </span>
        <div className="flex gap-1 ml-1.5">
          <button
            onClick={onPrevious}
            disabled={currentPage === 1}
            className="w-7 h-7 rounded-full border border-bm-grey bg-bm-white hover:bg-bm-light-grey hover:text-bm-maroon hover:border-bm-maroon transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-base">chevron_left</span>
          </button>
          <button
            onClick={onNext}
            disabled={currentPage === totalPages}
            className="w-7 h-7 rounded-full border border-bm-grey bg-bm-white hover:bg-bm-light-grey hover:text-bm-maroon hover:border-bm-maroon transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  )
}

