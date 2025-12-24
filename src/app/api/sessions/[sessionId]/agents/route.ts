import { createClient } from '@/lib/supabase/server'
import { getMultiAgenticReport } from '@/lib/services/sessions/multiAgenticReportService'
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

    const report = await getMultiAgenticReport(sessionId, user.id)

    if (!report) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error fetching multi-agentic report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


