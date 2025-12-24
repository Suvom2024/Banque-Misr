import { getFeaturedScenario } from '@/lib/services/training-hub/scenarioService'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const featured = await getFeaturedScenario()

    if (!featured) {
      return NextResponse.json({ error: 'No featured scenario found' }, { status: 404 })
    }

    return NextResponse.json(featured)
  } catch (error) {
    console.error('Error fetching featured scenario:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


