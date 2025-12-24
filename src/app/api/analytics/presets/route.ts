import { createClient } from '@/lib/supabase/server'
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

    const { data: presets, error } = await supabase
      .from('analytics_presets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching presets:', error)
      return NextResponse.json({ error: 'Failed to fetch presets' }, { status: 500 })
    }

    return NextResponse.json(presets || [])
  } catch (error) {
    console.error('Error fetching presets:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { presetName, filters } = body

    if (!presetName || !filters) {
      return NextResponse.json({ error: 'Preset name and filters are required' }, { status: 400 })
    }

    const { data: preset, error } = await supabase
      .from('analytics_presets')
      .insert({
        user_id: user.id,
        preset_name: presetName.trim(),
        filters: filters,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating preset:', error)
      return NextResponse.json({ error: 'Failed to create preset' }, { status: 500 })
    }

    return NextResponse.json(preset)
  } catch (error) {
    console.error('Error creating preset:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


