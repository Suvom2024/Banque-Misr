import { createClient } from '@/lib/supabase/server'
import { getCompetencyDistribution } from '@/lib/services/analytics/analyticsService'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filters = {
      employeeId: searchParams.get('employeeId') || undefined,
      timePeriod: searchParams.get('timePeriod') as 'week' | 'month' | 'quarter' | 'year' | undefined,
      scenarioId: searchParams.get('scenarioId') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    }

    const distribution = await getCompetencyDistribution(filters)

    return NextResponse.json(distribution)
  } catch (error) {
    console.error('Error fetching competency distribution:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


