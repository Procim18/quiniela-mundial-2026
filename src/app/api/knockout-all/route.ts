import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
  const { data, error } = await supabase
    .from('knockout_predictions')
    .select('player_id, match_id, home_score, away_score, winner, home_team, away_team')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(JSON.stringify({ data, ts: Date.now() }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Surrogate-Control': 'no-store',
    }
  })
}
