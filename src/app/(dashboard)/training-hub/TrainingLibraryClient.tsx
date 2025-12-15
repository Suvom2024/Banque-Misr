'use client'

import { useState, useMemo, useCallback, memo } from 'react'
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

// Move all static data outside component to prevent re-creation on every render
const defaultScenarios: LibraryScenario[] = [
  {
    id: '1',
    title: 'High-Value Client Negotiation',
    category: 'Sales',
    rating: 4.9,
    reviewCount: 120,
    difficulty: 'Difficult',
    duration: '15 Min',
    description: 'Practice navigating a tough negotiation with a key client threatening to leave for a competitor. Learn objection handling.',
    tags: ['Negotiation', 'Retention', 'Objection Handling'],
    aiCoach: 'Pro',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC4A4A4xJL8QB2EOTOfOYyZHt_K0DCwaKc5Om5GpkV-W_l_DluB42LyECrEOXD8x1NBa-NquaqdGw8BF_ge5CiIwfWyTBCmUDcv7XU3FMLJOOWIblH1jhAc-GQzF-MGYD0v9-osyNFEZZnUHdiMU9hdJ1b6MrBFExF7pWF79SH3e03At9EuA-Ry6xVHwuudxNYAAsC7Su_INTxZ2SENYtoWs7q-bbAzP4ng7-J1bSu4DewNTdbdfNGY3l86foQ9_J1suZEF-3XXbY8',
  },
  {
    id: '2',
    title: 'Cross-Selling Investment Services',
    category: 'Sales',
    rating: 4.7,
    reviewCount: 89,
    difficulty: 'Intermediate',
    duration: '12 Min',
    description: 'Identify subtle cues in client conversation to introduce investment products naturally.',
    tags: ['Cross-Selling', 'Investment', 'Product Knowledge'],
    isRecommended: true,
  },
  {
    id: '3',
    title: 'New Loan Product Introduction',
    category: 'Product Knowledge',
    rating: 4.5,
    reviewCount: 56,
    difficulty: 'Beginner',
    duration: '10 Min',
    description: 'Master key features of our latest personal loan to present it confidently to clients.',
    tags: ['Product Knowledge', 'Loan Products'],
  },
  {
    id: '4',
    title: 'Handling Upset Customers',
    category: 'Customer Service',
    rating: 4.8,
    reviewCount: 203,
    difficulty: 'Intermediate',
    duration: '8 Min',
    description: 'Learn to de-escalate tense situations and turn frustrated customers into satisfied ones.',
    tags: ['Customer Service', 'De-escalation', 'Empathy'],
    aiCoach: 'Pro',
  },
]

const defaultLearningPath = [
  {
    id: '1',
    title: 'Onboarding Essentials',
    status: 'completed' as const,
  },
  {
    id: '2',
    title: 'Advanced Sales',
    status: 'in-progress' as const,
    progress: 75,
    completedModules: 3,
    totalModules: 4,
  },
  {
    id: '3',
    title: 'Leadership Core',
    status: 'locked' as const,
  },
]

const defaultSkills = [
  { id: '1', label: 'Conflict Resolution' },
  { id: '2', label: 'Active Listening', isRecommended: true },
  { id: '3', label: 'Empathy' },
  { id: '4', label: 'Closing' },
  { id: '5', label: 'Product Knowledge' },
]

function TrainingLibraryClientComponent({ userName, userRole, userAvatar }: TrainingLibraryClientProps) {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all')

  // Memoize filtered scenarios to prevent recalculation on every render
  const filteredScenarios = useMemo(
    () =>
    activeFilter === 'all'
      ? defaultScenarios
      : activeFilter === 'recommended'
        ? defaultScenarios.filter((s) => s.isRecommended)
          : defaultScenarios.filter((s) => s.category.toLowerCase().replace(/\s+/g, '-') === activeFilter),
    [activeFilter]
  )

  // Memoize event handlers to prevent re-creation on every render
  const handleExploreFeatured = useCallback(() => {
    router.push('/training-hub/session/featured/live')
  }, [router])

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
            <FeaturedScenarioHero
              title="Negotiation"
              subtitle="Masterclass"
              description="Step into a high-stakes simulation with a key client. Master the art of retention and turn objections into opportunities using real-time AI feedback."
              onExplore={handleExploreFeatured}
              onPreview={handlePreviewFeatured}
            />
          </div>

          {/* Main Content Section */}
          <section className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex-1 w-full min-w-0 lg:max-w-[calc(100%-320px)]">
              {/* Category Filters */}
              <CategoryFilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} />

              {/* Scenario Grid */}
              <div className="masonry-grid pb-10">
                {filteredScenarios.map((scenario) => (
                  <div key={scenario.id} className="break-inside-avoid mb-6">
                    <LibraryScenarioCard scenario={scenario} />
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="w-full lg:w-[300px] xl:w-[320px] flex-shrink-0 space-y-6 lg:sticky lg:top-8 lg:self-start lg:ml-6">
              <LearningPathSidebar items={defaultLearningPath} onViewAll={handleViewAllLearningPath} />
              <AISkillFocusSidebar skills={defaultSkills} onViewAnalysis={handleViewAnalysis} />
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

