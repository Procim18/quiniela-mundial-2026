import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const playerId = req.nextUrl.searchParams.get('player_id')
  const query = supabase.from('champion_predictions').select('*')
  if (playerId) query.eq('player_id', playerId)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const { player_id, team } = await req.json()
  if (!player_id || !team) return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })

  const { data, error } = await supabase
    .from('champion_predictions')
    .upsert({ player_id, team }, { onConflict: 'player_id' })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
