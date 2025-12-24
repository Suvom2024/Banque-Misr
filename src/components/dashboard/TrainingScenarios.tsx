'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ScenarioCard, Scenario } from './ScenarioCard'
import type { ScenarioWithProgress } from '@/types/dashboard'

interface TrainingScenariosProps {
  scenarios?: ScenarioWithProgress[]
  isLoading?: boolean
}

export function TrainingScenarios({ scenarios = [], isLoading = false }: TrainingScenariosProps) {
  const [filter, setFilter] = useState<'all' | 'recommended'>('recommended')

  const filteredScenarios =
    filter === 'recommended' ? scenarios.filter((s) => s.status !== 'not-started') : scenarios

  // Convert ScenarioWithProgress to Scenario format for ScenarioCard
  const convertedScenarios: Scenario[] = filteredScenarios.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    status: s.status,
    tags: s.tags,
    duration: s.duration,
    score: s.score,
    progress: s.progress,
    lastSessionId: s.lastSessionId,
  }))

  if (isLoading) {
    return (
      <section>
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-lg font-bold text-bm-text-primary tracking-tight leading-tight">
              Available Training Scenarios
            </h2>
            <p className="text-bm-text-secondary text-xs mt-0.5 leading-relaxed">
              Select a simulation to hone your skills.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-bm-grey animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (convertedScenarios.length === 0) {
    return (
      <section>
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-lg font-bold text-bm-text-primary tracking-tight leading-tight">
              Available Training Scenarios
            </h2>
            <p className="text-bm-text-secondary text-xs mt-0.5 leading-relaxed">
              Select a simulation to hone your skills.
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-12 border border-bm-grey text-center">
          <span className="material-symbols-outlined text-4xl text-bm-text-subtle mb-2">menu_book</span>
          <p className="text-sm text-bm-text-secondary mb-2">No scenarios available</p>
          <Link
            href="/training-hub"
            className="text-xs font-medium text-bm-maroon hover:text-bm-maroon-light transition-colors"
          >
            Browse all scenarios →
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section>
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-lg font-bold text-bm-text-primary tracking-tight leading-tight">
            Available Training Scenarios
          </h2>
          <p className="text-bm-text-secondary text-xs mt-0.5 leading-relaxed">
            Select a simulation to hone your skills.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/training-hub"
            className="px-3 py-1.5 rounded-lg border border-bm-grey text-xs font-medium transition-colors shadow-sm bg-white text-bm-text-secondary hover:text-bm-maroon hover:border-bm-maroon"
          >
            View All
          </Link>
          <div className="flex gap-1.5">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors shadow-sm ${
                filter === 'all'
                  ? 'bg-bm-maroon text-white border-bm-maroon shadow-md shadow-bm-maroon/20'
                  : 'bg-white border-bm-grey text-bm-text-secondary hover:text-bm-maroon hover:border-bm-maroon'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('recommended')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors shadow-sm ${
                filter === 'recommended'
                  ? 'bg-bm-maroon text-white border-bm-maroon shadow-md shadow-bm-maroon/20'
                  : 'bg-white border-bm-grey text-bm-text-secondary hover:text-bm-maroon hover:border-bm-maroon'
              }`}
            >
              Recommended
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {convertedScenarios.map((scenario) => (
          <ScenarioCard key={scenario.id} scenario={scenario} />
        ))}
      </div>
    </section>
  )
}



