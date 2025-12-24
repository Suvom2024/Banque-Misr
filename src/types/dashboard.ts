// Dashboard Type Definitions

export type PerformanceRating = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS_IMPROVEMENT'

export type RecommendationType = 'focus_area' | 'scenario' | 'skill' | 'goal'

export type CompetencyTrend = 'improving' | 'declining' | 'stable'

export type ScenarioStatus = 'not-started' | 'in-progress' | 'completed'

export type ActivityType =
  | 'session_completed'
  | 'session_started'
  | 'achievement_earned'
  | 'goal_created'
  | 'goal_completed'
  | 'assessment_completed'
  | 'milestone_reached'

export type PeriodType = 'week' | 'month' | 'quarter' | 'year'

export interface Competency {
  name: string
  score: number
  trend: CompetencyTrend
  icon: string
}

export interface TopCompetency extends Competency {
  change?: number
}

export interface UserPerformance {
  performanceScore: number
  performanceRating: PerformanceRating
  timeTrained: string
  timeTrainedChange: string
  keyStrength: string
  aiMessage: string
  aiMessageDetail: string
  topCompetencies: TopCompetency[]
}

export interface QuickStats {
  sessionsThisWeek: number
  avgScore: number
  streak: number
  timeThisWeek: string
  rank: number | null
  xpEarned: number
  sessionsChange?: number
  scoreChange?: number
}

export interface Recommendation {
  id: string
  recommendationType: RecommendationType
  title: string
  description: string
  icon: string
  tags: string[]
  priority: number
  reason?: string
  relatedScenarioId?: string
  relatedCompetency?: string
  confidenceScore?: number
  expiresAt?: string
  isDismissed: boolean
}

export interface Activity {
  id: string
  type: ActivityType
  activityType?: string
  title: string
  description?: string
  icon: string
  timestamp: string
  relatedSessionId?: string
  relatedGoalId?: string
  relatedAchievementId?: string
  score?: number
  metadata?: Record<string, unknown>
}

export interface TrendDataPoint {
  date: string
  score: number
  sessionsCount: number
}

export interface DevelopmentGoal {
  id: string
  title: string
  description: string
  targetDate: string
  progress: number
  status: 'active' | 'completed' | 'cancelled'
  icon?: string
}

export interface ScenarioWithProgress {
  id: string
  title: string
  description: string
  status: ScenarioStatus
  tags: string[]
  duration: string
  score?: number
  progress?: number
  bestScore?: number
  attemptsCount?: number
  lastSessionId?: string
}

export interface DashboardData {
  performance: UserPerformance
  recommendedFocus: Recommendation | null
  quickStats: QuickStats
  competencies: Competency[]
  recentActivity: Activity[]
  performanceTrend: TrendDataPoint[]
  activeGoals: DevelopmentGoal[]
  trainingScenarios: ScenarioWithProgress[]
}

export interface UserCompetencyGap {
  competencyName: string
  currentAverageScore: number
  targetScore: number
  gapSize: number
  recentTrend: CompetencyTrend
  sessionsAnalyzed: number
}

export interface Achievement {
  id: string
  code: string
  name: string
  description: string
  icon: string
  category: 'sessions' | 'scores' | 'streaks' | 'competencies' | 'goals'
  badgeColor: string
  earnedAt?: string
}

