import { createClient } from '@/lib/supabase/server'
import { getUserTrainingScenarios } from '@/lib/services/dashboard/scenarioService'
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
    const filter = (searchParams.get('filter') as 'all' | 'recommended') || 'recommended'
    const limit = parseInt(searchParams.get('limit') || '6', 10)

    const scenarios = await getUserTrainingScenarios(user.id, filter, limit)

    return NextResponse.json(scenarios)
  } catch (error) {
    console.error('Error fetching scenarios:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

