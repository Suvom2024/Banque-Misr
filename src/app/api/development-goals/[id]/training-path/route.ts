import { createClient } from '@/lib/supabase/server'
import { getRecommendedTrainingPath } from '@/lib/services/development-goals/goalsService'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const modules = await getRecommendedTrainingPath(id, user.id)

    return NextResponse.json(modules)
  } catch (error) {
    console.error('Error fetching training path:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

