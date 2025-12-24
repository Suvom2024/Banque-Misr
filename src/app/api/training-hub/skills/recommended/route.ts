import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's competency gaps to recommend skills
    const { data: gaps, error } = await supabase
      .from('user_competency_gaps')
      .select('competency_name, gap_size, recent_trend')
      .eq('user_id', user.id)
      .order('gap_size', { ascending: false })
      .limit(5)

    if (error) {
      console.error('Error fetching competency gaps:', error)
      return NextResponse.json([])
    }

    // Transform to skill format
    const skills = gaps?.map((gap, index) => ({
      id: `skill-${index + 1}`,
      label: gap.competency_name,
      isRecommended: gap.gap_size > 0 || gap.recent_trend === 'improving',
    })) || []

    // If no gaps, return some default skills
    if (skills.length === 0) {
      return NextResponse.json([
        { id: '1', label: 'Conflict Resolution', isRecommended: false },
        { id: '2', label: 'Active Listening', isRecommended: true },
        { id: '3', label: 'Empathy', isRecommended: false },
        { id: '4', label: 'Closing', isRecommended: false },
        { id: '5', label: 'Product Knowledge', isRecommended: false },
      ])
    }

    return NextResponse.json(skills)
  } catch (error) {
    console.error('Error fetching recommended skills:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


