import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function checkAdmin(req: NextRequest) {
  return req.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { match_id } = await req.json()
  if (!match_id) return NextResponse.json({ error: 'Falta match_id' }, { status: 400 })
  const { error } = await supabase.from('group_results').delete().eq('match_id', match_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
