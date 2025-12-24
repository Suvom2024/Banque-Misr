import { createClient } from '@/lib/supabase/server'
import {
  getScenarioReviews,
  getUserReview,
  createOrUpdateReview,
} from '@/lib/services/training-hub/reviewService'
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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const userOnly = searchParams.get('user') === 'true'

    if (userOnly && !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (userOnly) {
      const review = await getUserReview(user.id, params.id)
      return NextResponse.json({ review, reviews: review ? [review] : [], total: review ? 1 : 0 })
    }

    const result = await getScenarioReviews(params.id, limit, offset)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
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

    const body = await request.json()
    const { rating, reviewText } = body

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
    }

    const review = await createOrUpdateReview(user.id, params.id, rating, reviewText)

    if (!review) {
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
    }

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


