import { createClient } from '@/lib/supabase/server'
import { getScenariosForSelection } from '@/lib/services/training-hub/scenarioSelectionService'
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
    const category = searchParams.get('category') || undefined

    const scenarios = await getScenariosForSelection(user.id, category)

    return NextResponse.json(scenarios)
  } catch (error) {
    console.error('Error fetching scenarios for selection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

