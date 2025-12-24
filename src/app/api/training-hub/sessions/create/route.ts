import { createClient } from '@/lib/supabase/server'
import { createSession } from '@/lib/services/training-hub/sessionService'
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
    const { scenarioId } = body

    if (!scenarioId) {
      return NextResponse.json({ error: 'scenarioId is required' }, { status: 400 })
    }

    // Verify scenario exists and is active
    const { data: scenario, error: scenarioError } = await supabase
      .from('scenarios')
      .select('id, is_active')
      .eq('id', scenarioId)
      .single()

    if (scenarioError || !scenario) {
      return NextResponse.json({ error: 'Scenario not found' }, { status: 404 })
    }

    if (!scenario.is_active) {
      return NextResponse.json({ error: 'Scenario is not active' }, { status: 400 })
    }

    const session = await createSession(user.id, scenarioId)

    if (!session) {
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


