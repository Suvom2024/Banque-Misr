import { createClient } from '@/lib/supabase/server'
import { getScenarios, getRecommendedScenarios } from '@/lib/services/training-hub/scenarioService'
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
    const category = searchParams.get('category') as
      | 'all'
      | 'customer-service'
      | 'sales-retention'
      | 'leadership'
      | 'recommended'
      | null
    const difficulty = searchParams.get('difficulty')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    // Handle recommended filter separately
    if (category === 'recommended') {
      const scenarios = await getRecommendedScenarios(user.id, limit)
      return NextResponse.json({
        scenarios,
        total: scenarios.length,
        page: 1,
        limit,
        totalPages: 1,
      })
    }

    const result = await getScenarios(user.id, {
      category: category || 'all',
      difficulty: difficulty || undefined,
      search: search || undefined,
      page,
      limit,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching scenarios:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


