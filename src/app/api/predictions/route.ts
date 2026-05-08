import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/predictions?player_id=xxx
export async function GET(req: NextRequest) {
  const playerId = req.nextUrl.searchParams.get('player_id')
  const query = supabase.from('group_predictions').select('*')
  if (playerId) query.eq('player_id', playerId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// POST /api/predictions  body: { player_id, match_id, home_score, away_score }
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { player_id, match_id, home_score, away_score } = body

  if (!player_id || !match_id) {
    return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('group_predictions')
    .upsert(
      { player_id, match_id, home_score, away_score, updated_at: new Date().toISOString() },
      { onConflict: 'player_id,match_id' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
