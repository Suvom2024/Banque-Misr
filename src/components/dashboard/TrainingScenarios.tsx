'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ScenarioCard, Scenario } from './ScenarioCard'

interface TrainingScenariosProps {
  scenarios?: Scenario[]
}

const defaultScenarios: Scenario[] = [
  {
    id: '1',
    title: 'High-Value Client Negotiation',
    description: 'Navigate a complex negotiation with a key client to secure a favorable outcome while maintaining trust.',
    status: 'completed',
    tags: ['Negotiation', 'Strategy'],
    duration: '25 mins',
    score: 92,
  },
  {
    id: '2',
    title: 'Managing an Escalated Complaint',
    description: 'Address an urgent and sensitive complaint from a customer to de-escalate the situation swiftly.',
    status: 'in-progress',
    tags: ['De-escalation', 'Empathy'],
    duration: '15 mins left',
    progress: 45,
  },
  {
    id: '3',
    title: 'Performance Review Discussion',
    description: 'Conduct a constructive performance review with a team member, focusing on feedback loops.',
    status: 'not-started',
    tags: ['Coaching', 'Leadership'],
    duration: '20 mins',
  },
]

export function TrainingScenarios({ scenarios = defaultScenarios }: TrainingScenariosProps) {
  const [filter, setFilter] = useState<'all' | 'recommended'>('recommended')

  const filteredScenarios = filter === 'recommended' ? scenarios.filter((s) => s.status !== 'not-started') : scenarios

  return (
    <section>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-bm-text-primary tracking-tighter leading-tight">Available Training Scenarios</h2>
          <p className="text-bm-text-secondary mt-1.5 leading-relaxed">Select a simulation to hone your skills.</p>
        </div>
        <Link
          href="/training-hub"
          className="px-4 py-2 rounded-lg border border-bm-grey text-sm font-medium transition-colors shadow-sm bg-white text-bm-text-secondary hover:text-bm-maroon hover:border-bm-maroon"
        >
          View All Scenarios
        </Link>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors shadow-sm ${
              filter === 'all'
                ? 'bg-bm-maroon text-white border-bm-maroon shadow-md shadow-bm-maroon/20'
                : 'bg-white border-bm-grey text-bm-text-secondary hover:text-bm-maroon hover:border-bm-maroon'
            }`}
          >
            All Scenarios
          </button>
          <button
            onClick={() => setFilter('recommended')}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors shadow-sm ${
              filter === 'recommended'
                ? 'bg-bm-maroon text-white border-bm-maroon shadow-md shadow-bm-maroon/20'
                : 'bg-white border-bm-grey text-bm-text-secondary hover:text-bm-maroon hover:border-bm-maroon'
            }`}
          >
            Recommended
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredScenarios.map((scenario) => (
          <ScenarioCard key={scenario.id} scenario={scenario} />
        ))}
      </div>
    </section>
  )
}



