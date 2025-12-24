import { createClient } from '@/lib/supabase/server'
import { getSessionReport } from '@/lib/services/sessions/sessionReportService'
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

    const report = await getSessionReport(sessionId, user.id)

    if (!report) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error fetching session report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


