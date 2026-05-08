import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function checkAdmin(req: NextRequest) {
  return req.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD
}

export async function GET() {
  const { data, error } = await supabase.from('champion_result').select('*').eq('id', 1).single()
  if (error) return NextResponse.json({ data: null })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { team } = await req.json()
  const { data, error } = await supabase
    .from('champion_result')
    .update({ team, updated_at: new Date().toISOString() })
    .eq('id', 1)
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
