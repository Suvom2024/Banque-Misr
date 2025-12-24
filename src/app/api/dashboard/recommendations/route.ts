import { createClient } from '@/lib/supabase/server'
import { getUserRecommendedFocus, refreshRecommendations } from '@/lib/services/dashboard/recommendationService'
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

    const recommendation = await getUserRecommendedFocus(user.id)

    return NextResponse.json(recommendation)
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const recommendations = await refreshRecommendations(user.id)

    return NextResponse.json(recommendations)
  } catch (error) {
    console.error('Error refreshing recommendations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

