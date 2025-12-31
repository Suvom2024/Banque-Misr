import { createClient } from '@/lib/supabase/server'
import { updateSessionProgress } from '@/lib/services/training-hub/sessionService'
import { NextResponse } from 'next/server'

export async function PATCH(
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
    
    // Handle empty or malformed request bodies gracefully
    let body = {}
    try {
      const text = await request.text()
      if (text && text.trim()) {
        body = JSON.parse(text)
      }
    } catch (parseError: any) {
      // Ignore aborted errors (client cancelled request during navigation)
      if (parseError?.code === 'ECONNRESET' || parseError?.message?.includes('aborted')) {
        return new NextResponse(null, { status: 499 }) // Client Closed Request
      }
      // If JSON parsing fails, return error instead of crashing
      console.error('[Update API] Error parsing request body:', parseError, 'URL:', request.url, 'Referer:', request.headers.get('referer'))
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    // Validate that body has at least one update field
    const hasUpdates = Object.keys(body).length > 0
    if (!hasUpdates) {
      console.warn('[Update API] Empty update request rejected:', { sessionId, referer: request.headers.get('referer') })
      return NextResponse.json({ error: 'No update fields provided' }, { status: 400 })
    }

    const success = await updateSessionProgress(sessionId, user.id, body)

    if (!success) {
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
    }

    // If session was just completed, trigger AI summary generation (async, don't wait)
    if (body.status === 'completed') {
      // Trigger summary generation in background (don't await)
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/sessions/${sessionId}/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).catch((err) => {
        console.error('[Update API] Failed to trigger summary generation:', err)
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Update API] Error updating session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


