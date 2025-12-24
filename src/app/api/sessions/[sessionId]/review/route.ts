import { createClient } from '@/lib/supabase/server'
import { getSessionReview } from '@/lib/services/sessions/sessionReviewService'
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

    const review = await getSessionReview(sessionId, user.id)

    if (!review) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error fetching session review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


