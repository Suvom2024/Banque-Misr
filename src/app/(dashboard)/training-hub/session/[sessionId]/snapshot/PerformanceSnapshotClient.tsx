'use client'

import Link from 'next/link'
import { PerformanceSnapshotHeader } from '@/components/dashboard/PerformanceSnapshotHeader'
import { AIAnalysisCard } from '@/components/dashboard/AIAnalysisCard'
import { TopStrengthCard } from '@/components/dashboard/TopStrengthCard'
import { AhaMomentCard } from '@/components/dashboard/AhaMomentCard'
import { AssessmentResultsCard } from '@/components/dashboard/AssessmentResultsCard'
import { SkillTrendAnalysisCard } from '@/components/dashboard/SkillTrendAnalysisCard'
import { PersonalizedGrowthPathCard } from '@/components/dashboard/PersonalizedGrowthPathCard'

interface PerformanceSnapshotClientProps {
  userName: string
  sessionId: string
}

// Hard-coded performance snapshot data
const defaultSnapshotData = {
  sessionTitle: "Maria's Leadership Discussion",
  grade: 'A',
  aiMessage: 'excellent progress in handling Maria\'s leadership discussion!',
  aiFullMessage:
    'You showed remarkable empathy and strategic thinking. Your ability to pivot the conversation when she showed hesitation was a standout moment.',
  currentGoal: {
    title: 'Achieve Advanced Certification in Negotiation',
    progress: 72,
    changeFromSession: 4,
  },
  topStrength: {
    name: 'Empathetic Listening',
    description: 'Mastered at 10:32 AM. You validated Maria\'s feelings before proposing a solution.',
    masteredAt: '10:32 AM',
    peerRanking: 'Top 5% of peers',
  },
  ahaMoment: {
    title: 'Objection Handling',
    description: 'Effectively used the "Feel, Felt, Found" technique to address workload concerns.',
    technique: 'Feel, Felt, Found',
  },
  assessmentResults: {
    score: 80,
    correct: 4,
    incorrect: 1,
    quizCount: 2,
  },
  skillTrends: [
    {
      skill: 'Empathy',
      trend: [75, 78, 82, 85, 87],
      change: 12,
      color: '#10B981',
    },
    {
      skill: 'Clarity of Instruction',
      trend: [88, 88, 88, 88, 88],
      change: 0,
      color: '#F59E0B',
    },
  ],
  growthPath: [
    {
      id: '1',
      type: 'micro-drill' as const,
      title: 'Redo: Handling Resistance',
      description: 'Refine your response to Maria\'s hesitation. Focus on asking open-ended questions.',
      duration: '5 min',
    },
    {
      id: '2',
      type: 'scenario' as const,
      title: 'Scenario: Team Conflict',
      description: 'Apply your empathetic listening skills to a conflict resolution scenario.',
    },
    {
      id: '3',
      type: 'knowledge' as const,
      title: 'Policy #402: Leadership Dev.',
      description: 'Review the official guidelines on internal promotions and mentorship tracks.',
    },
  ],
}

export function PerformanceSnapshotClient({ userName, sessionId }: PerformanceSnapshotClientProps) {
  const snapshotData = defaultSnapshotData

  const handleShareReport = () => {
    console.log('Share report:', sessionId)
  }

  const handleAddReflection = () => {
    console.log('Add reflection:', sessionId)
  }

  const handleReviewAnswers = () => {
    console.log('Review quiz answers')
  }

  const handleTimePeriodChange = (period: string) => {
    console.log('Time period changed:', period)
  }

  const handleStartAction = (id: string, type: string) => {
    console.log('Start action:', id, type)
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-bm-grey/50 to-transparent pointer-events-none"></div>
      <PerformanceSnapshotHeader userName={userName} sessionId={sessionId} />

      <main className="flex-grow p-8 overflow-y-auto custom-scrollbar max-w-[1600px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-fade-in-up">
          {/* AI Analysis Card */}
          <AIAnalysisCard
            userName={userName}
            grade={snapshotData.grade}
            message={snapshotData.aiMessage}
            currentGoal={snapshotData.currentGoal}
          />

          {/* Top Strength and Aha Moment */}
          <div className="space-y-4 lg:col-span-1 flex flex-col h-full">
            <TopStrengthCard {...snapshotData.topStrength} />
            <AhaMomentCard {...snapshotData.ahaMoment} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-fade-in-up animate-delay-100">
          {/* Assessment Results */}
          <AssessmentResultsCard
            {...snapshotData.assessmentResults}
            onReviewAnswers={handleReviewAnswers}
          />

          {/* Skill Trend Analysis */}
          <SkillTrendAnalysisCard
            skills={snapshotData.skillTrends}
            onTimePeriodChange={handleTimePeriodChange}
          />
        </div>

        {/* Personalized Growth Path */}
        <PersonalizedGrowthPathCard items={snapshotData.growthPath} onStartAction={handleStartAction} />

        {/* Link to Development Goals */}
        <div className="mt-8 animate-fade-in-up animate-delay-300">
          <Link
            href="/development-goals"
            className="bg-white border-2 border-bm-gold rounded-xl p-6 hover:bg-bm-gold/5 transition-all flex items-center justify-center gap-3 text-bm-maroon font-bold group shadow-card"
          >
            <span className="material-symbols-outlined text-2xl">flag</span>
            <span>View Development Goals</span>
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
        </div>
      </main>
    </div>
  )
}

