import { createClient } from '@/lib/supabase/server'
import { getSessionDetailsForScenario } from '@/lib/services/training-hub/scenarioSelectionService'
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

    const details = await getSessionDetailsForScenario(id)

    if (!details) {
      return NextResponse.json({ error: 'Scenario not found' }, { status: 404 })
    }

    return NextResponse.json(details)
  } catch (error) {
    console.error('Error fetching session details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


