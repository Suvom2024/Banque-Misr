import { createClient } from '@/lib/supabase/server'
import { getPerformanceSnapshot } from '@/lib/services/sessions/performanceSnapshotService'
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

    const snapshot = await getPerformanceSnapshot(sessionId, user.id)

    if (!snapshot) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    return NextResponse.json(snapshot)
  } catch (error) {
    console.error('Error fetching performance snapshot:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


