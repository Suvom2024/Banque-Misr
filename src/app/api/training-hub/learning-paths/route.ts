import { createClient } from '@/lib/supabase/server'
import { getUserLearningPaths } from '@/lib/services/training-hub/learningPathService'
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

    const learningPaths = await getUserLearningPaths(user.id)

    return NextResponse.json(learningPaths)
  } catch (error) {
    console.error('Error fetching learning paths:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


