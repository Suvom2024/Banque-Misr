import { createClient } from '@/lib/supabase/server'
import { generateAIGoal } from '@/lib/services/development-goals/goalsService'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { goalText } = body

    if (!goalText || goalText.trim().length === 0) {
      return NextResponse.json({ error: 'Goal text is required' }, { status: 400 })
    }

    const goal = await generateAIGoal(user.id, goalText.trim())

    if (!goal) {
      return NextResponse.json({ error: 'Failed to generate goal' }, { status: 500 })
    }

    return NextResponse.json(goal)
  } catch (error) {
    console.error('Error generating goal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

