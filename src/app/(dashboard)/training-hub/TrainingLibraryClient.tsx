'use client'

import { useState, useMemo, useCallback, memo, useEffect } from 'react'
import { TrainingLibraryHeader } from '@/components/dashboard/TrainingLibraryHeader'
import { FeaturedScenarioHero } from '@/components/dashboard/FeaturedScenarioHero'
import { CategoryFilterChips, CategoryFilter } from '@/components/dashboard/CategoryFilterChips'
import { LibraryScenarioCard, LibraryScenario } from '@/components/dashboard/LibraryScenarioCard'
import { LearningPathSidebar } from '@/components/dashboard/LearningPathSidebar'
import { AISkillFocusSidebar } from '@/components/dashboard/AISkillFocusSidebar'
import { useRouter } from 'next/navigation'

interface TrainingLibraryClientProps {
  userName: string
  userRole?: string
  userAvatar?: string
}

interface LearningPathItem {
  id: string
  title: string
  status: 'completed' | 'in-progress' | 'locked'
  progress?: number
  completedModules?: number
  totalModules?: number
}

interface SkillTag {
  id: string
  label: string
  isRecommended?: boolean
}

function TrainingLibraryClientComponent({ userName, userRole, userAvatar }: TrainingLibraryClientProps) {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all')
  const [scenarios, setScenarios] = useState<LibraryScenario[]>([])
  const [featuredScenario, setFeaturedScenario] = useState<LibraryScenario | null>(null)
  const [learningPaths, setLearningPaths] = useState<LearningPathItem[]>([])
  const [skills, setSkills] = useState<SkillTag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Fetch featured scenario
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('/api/training-hub/featured')
        if (res.ok) {
          const data = await res.json()
          setFeaturedScenario(data)
        }
      } catch (error) {
        console.error('Error fetching featured scenario:', error)
      }
    }
    fetchFeatured()
  }, [])

  // Fetch scenarios based on filter
  useEffect(() => {
    const fetchScenarios = async () => {
      setIsLoading(true)
      try {
        const categoryParam = activeFilter === 'all' ? '' : `&category=${activeFilter}`
        const res = await fetch(`/api/training-hub/scenarios?page=${currentPage}&limit=20${categoryParam}`)
        if (res.ok) {
          const data = await res.json()
          setScenarios(data.scenarios || [])
          setTotalPages(data.totalPages || 1)
        }
      } catch (error) {
        console.error('Error fetching scenarios:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchScenarios()
  }, [activeFilter, currentPage])

  // Fetch learning paths
  useEffect(() => {
    const fetchLearningPaths = async () => {
      try {
        const res = await fetch('/api/training-hub/learning-paths')
        if (res.ok) {
          const data = await res.json()
          const transformed: LearningPathItem[] = data.map((path: any) => ({
            id: path.id,
            title: path.title,
            status: path.status === 'completed' ? 'completed' : path.status === 'in_progress' ? 'in-progress' : 'locked',
            progress: path.progress,
            completedModules: path.completedModules,
            totalModules: path.totalModules,
          }))
          setLearningPaths(transformed)
        }
      } catch (error) {
        console.error('Error fetching learning paths:', error)
      }
    }
    fetchLearningPaths()
  }, [])

  // Fetch recommended skills
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await fetch('/api/training-hub/skills/recommended')
        if (res.ok) {
          const data = await res.json()
          setSkills(data)
        }
      } catch (error) {
        console.error('Error fetching skills:', error)
      }
    }
    fetchSkills()
  }, [])

  // Memoize event handlers to prevent re-creation on every render
  const handleExploreFeatured = useCallback(async () => {
    if (!featuredScenario) {
      router.push('/training-hub/session/featured/live')
      return
    }

    try {
      const response = await fetch('/api/training-hub/sessions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scenarioId: featuredScenario.id }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to start session')
      }

      const session = await response.json()
      router.push(`/training-hub/session/${session.id}/live`)
    } catch (error) {
      console.error('Error starting featured session:', error)
      alert(error instanceof Error ? error.message : 'Failed to start session. Please try again.')
    }
  }, [router, featuredScenario])

  const handlePreviewFeatured = useCallback(() => {
    console.log('Preview featured scenario')
  }, [])

  const handleViewAllLearningPath = useCallback(() => {
    console.log('View all learning paths')
  }, [])

  const handleViewAnalysis = useCallback(() => {
    router.push('/analytics')
  }, [router])

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-bm-light-grey">
      <TrainingLibraryHeader userName={userName} userRole={userRole} userAvatar={userAvatar} />

      <main className="flex-grow overflow-y-auto overflow-x-hidden smooth-scroll">
        <div className="px-6 lg:px-8 py-6 lg:py-8">
          <div className="max-w-[1400px] mx-auto space-y-8">
          {/* Featured Hero Section */}
          <div className="w-full">
            {featuredScenario ? (
              <FeaturedScenarioHero
                title={featuredScenario.title}
                subtitle={featuredScenario.category || 'Featured'}
                description={featuredScenario.description}
                onExplore={handleExploreFeatured}
                onPreview={handlePreviewFeatured}
              />
            ) : (
              <FeaturedScenarioHero
                title="Negotiation"
                subtitle="Masterclass"
                description="Step into a high-stakes simulation with a key client. Master the art of retention and turn objections into opportunities using real-time AI feedback."
                onExplore={handleExploreFeatured}
                onPreview={handlePreviewFeatured}
              />
            )}
          </div>

          {/* Main Content Section */}
          <section className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex-1 w-full min-w-0 lg:max-w-[calc(100%-320px)]">
              {/* Category Filters */}
              <CategoryFilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} />

              {/* Scenario Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pb-10">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                      <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : scenarios.length > 0 ? (
                <div className="masonry-grid pb-10">
                  {scenarios.map((scenario) => (
                    <div key={scenario.id} className="break-inside-avoid mb-6">
                      <LibraryScenarioCard scenario={scenario} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-6xl text-bm-text-subtle mb-4">inventory_2</span>
                  <p className="text-bm-text-secondary font-medium">No scenarios found</p>
                  <p className="text-sm text-bm-text-subtle mt-2">Try adjusting your filters</p>
                </div>
              )}

              {/* Pagination */}
              {!isLoading && totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bm-light-grey transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-bm-text-secondary">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bm-light-grey transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="w-full lg:w-[300px] xl:w-[320px] flex-shrink-0 space-y-6 lg:sticky lg:top-8 lg:self-start lg:ml-6">
              <LearningPathSidebar items={learningPaths} onViewAll={handleViewAllLearningPath} />
              <AISkillFocusSidebar skills={skills} onViewAnalysis={handleViewAnalysis} />
            </aside>
          </section>
          </div>
          <div className="h-12"></div>
        </div>
      </main>
    </div>
  )
}

export const TrainingLibraryClient = memo(TrainingLibraryClientComponent)

