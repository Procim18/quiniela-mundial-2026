import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { supabase } from '@/lib/supabase'

function checkAdmin(req: NextRequest) {
  const adminPass = req.headers.get('x-admin-password')
  return adminPass === process.env.ADMIN_PASSWORD
}

// GET - public
export async function GET() {
  const { data, error } = await supabase.from('group_results').select('*')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// DELETE - admin only
export async function DELETE(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const matchId = req.nextUrl.searchParams.get('match_id')
  if (!matchId) return NextResponse.json({ error: 'Falta match_id' }, { status: 400 })
  const { error } = await supabase.from('group_results').delete().eq('match_id', matchId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// POST - admin only
export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { match_id, home_score, away_score } = await req.json()
  if (!match_id || home_score == null || away_score == null) {
    return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('group_results')
    .upsert(
      { match_id, home_score, away_score, updated_at: new Date().toISOString() },
      { onConflict: 'match_id' }
    )
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
