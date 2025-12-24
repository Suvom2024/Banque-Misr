import { createClient } from '@/lib/supabase/server'
import { bookmarkScenario, unbookmarkScenario } from '@/lib/services/training-hub/bookmarkService'
import { NextResponse } from 'next/server'

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

    const success = await bookmarkScenario(user.id, params.id)

    if (!success) {
      return NextResponse.json({ error: 'Failed to bookmark scenario' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error bookmarking scenario:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
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

    const success = await unbookmarkScenario(user.id, params.id)

    if (!success) {
      return NextResponse.json({ error: 'Failed to unbookmark scenario' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unbookmarking scenario:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


