import { createClient } from '@/lib/supabase/server'
import { getPerformanceTrend } from '@/lib/services/dashboard/performanceService'
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
    const period = (searchParams.get('period') as 'week' | 'month' | 'quarter') || 'month'

    const trends = await getPerformanceTrend(user.id, period)

    return NextResponse.json(trends)
  } catch (error) {
    console.error('Error fetching trends:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

