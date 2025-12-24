import { createClient } from '@/lib/supabase/server'
import { getUserOverallPerformance } from '@/lib/services/dashboard/performanceService'
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

    const performance = await getUserOverallPerformance(user.id, period)

    if (!performance) {
      return NextResponse.json({ error: 'No performance data found' }, { status: 404 })
    }

    return NextResponse.json(performance)
  } catch (error) {
    console.error('Error fetching performance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

