import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const player_id = searchParams.get('player_id')
  if (!player_id) return NextResponse.json({ error: 'Falta player_id' }, { status: 400 })
  const supabase = getSupabase()
  const { data, error } = await supabase.from('top_scorer_predictions').select('*').eq('player_id', player_id).single()
  if (error && error.code !== 'PGRST116') return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const { player_id, scorer_name } = await req.json()
  if (!player_id || !scorer_name) return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
  const supabase = getSupabase()
  const { error } = await supabase.from('top_scorer_predictions').upsert({ player_id, scorer_name }, { onConflict: 'player_id' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
