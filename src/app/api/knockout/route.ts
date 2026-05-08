import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function checkAdmin(req: NextRequest) {
  return req.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type')
  const playerId = req.nextUrl.searchParams.get('player_id')

  if (type === 'results') {
    const { data, error } = await supabase.from('knockout_results').select('*')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  }

  if (type === 'predictions' && playerId) {
    const { data, error } = await supabase.from('knockout_predictions').select('*').eq('player_id', playerId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  }

  return NextResponse.json({ error: 'Faltan parametros' }, { status: 400 })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { type, player_id, match_id, home_team, away_team, home_score, away_score, winner } = body

  if (type === 'result') {
    if (!checkAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const { data, error } = await supabase
      .from('knockout_results')
      .upsert({ match_id, home_team, away_team, home_score, away_score, winner, updated_at: new Date().toISOString() }, { onConflict: 'match_id' })
      .select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  }

  if (type === 'prediction') {
    if (!player_id || !match_id) return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
    const { data, error } = await supabase
      .from('knockout_predictions')
      .upsert({ player_id, match_id, home_team, away_team, home_score, away_score, winner, updated_at: new Date().toISOString() }, { onConflict: 'player_id,match_id' })
      .select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  }

  return NextResponse.json({ error: 'Tipo invalido' }, { status: 400 })
}

export async function DELETE(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const matchId = req.nextUrl.searchParams.get('match_id')
  if (!matchId) return NextResponse.json({ error: 'Falta match_id' }, { status: 400 })
  const { error } = await supabase.from('knockout_results').delete().eq('match_id', matchId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
