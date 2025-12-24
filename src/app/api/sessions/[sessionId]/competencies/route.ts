import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await params

    // Verify session belongs to user
    const { data: session } = await supabase
      .from('sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Get competencies
    const { data: competencies, error } = await supabase
      .from('session_competencies')
      .select('*')
      .eq('session_id', sessionId)
      .order('score', { ascending: false })

    if (error) {
      console.error('Error fetching competencies:', error)
      return NextResponse.json({ error: 'Failed to fetch competencies' }, { status: 500 })
    }

    return NextResponse.json(competencies || [])
  } catch (error) {
    console.error('Error fetching competencies:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


