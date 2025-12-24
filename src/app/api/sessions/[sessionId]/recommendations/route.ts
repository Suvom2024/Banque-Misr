import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await params

    // Verify session belongs to user
    const { data: session } = await supabase
      .from('sessions')
      .select('id, overall_score')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Get competencies
    const { data: competencies } = await supabase
      .from('session_competencies')
      .select('*')
      .eq('session_id', sessionId)
      .order('score', { ascending: true }) // Lowest scores first

    const recommendations: any[] = []

    // Find competencies that need improvement (score < 70)
    const weakCompetencies = (competencies || []).filter((c) => (c.score || 0) < 70).slice(0, 3)

    for (const competency of weakCompetencies) {
      // Find related scenarios for this competency
      const { data: relatedScenarios } = await supabase
        .from('scenarios')
        .select('id, title')
        .contains('tags', [competency.competency_name])
        .eq('is_active', true)
        .limit(1)

      recommendations.push({
        id: `rec-${competency.id}`,
        title: `Improve ${competency.competency_name}`,
        description: competency.feedback || `Your ${competency.competency_name} score is ${competency.score}%. Focus on this area to improve your overall performance.`,
        actionType: relatedScenarios && relatedScenarios.length > 0 ? 'scenario' : 'resource',
        actionLabel: relatedScenarios && relatedScenarios.length > 0 ? 'Start Scenario' : 'View Resource',
        relatedScenarioId: relatedScenarios?.[0]?.id,
      })
    }

    // Add general recommendations if score is low
    if ((session.overall_score || 0) < 75 && recommendations.length === 0) {
      recommendations.push({
        id: 'rec-general',
        title: 'Practice More Scenarios',
        description: 'Your overall score suggests more practice would be beneficial. Try completing similar scenarios to build confidence.',
        actionType: 'scenario',
        actionLabel: 'Browse Scenarios',
      })
    }

    return NextResponse.json(recommendations)
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


