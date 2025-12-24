import { createClient } from '@/lib/supabase/server'
import { getUserCompetencies } from '@/lib/services/dashboard/competencyService'
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

    const competencies = await getUserCompetencies(user.id)

    return NextResponse.json(competencies)
  } catch (error) {
    console.error('Error fetching competencies:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

