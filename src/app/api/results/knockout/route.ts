import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function checkAdmin(req: NextRequest) {
  return req.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD
}

export async function GET() {
  const { data, error } = await supabase.from('knockout_results').select('*')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const { match_id, home_team, away_team, home_score, away_score, winner } = body

  const { data, error } = await supabase
    .from('knockout_results')
    .upsert(
      { match_id, home_team, away_team, home_score, away_score, winner, updated_at: new Date().toISOString() },
      { onConflict: 'match_id' }
    )
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
