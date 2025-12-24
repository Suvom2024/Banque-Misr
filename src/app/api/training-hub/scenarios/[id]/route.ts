import { createClient } from '@/lib/supabase/server'
import { getScenarioById } from '@/lib/services/training-hub/scenarioService'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const scenario = await getScenarioById(params.id, user.id)

    if (!scenario) {
      return NextResponse.json({ error: 'Scenario not found' }, { status: 404 })
    }

    return NextResponse.json(scenario)
  } catch (error) {
    console.error('Error fetching scenario:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


