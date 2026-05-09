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

export async function GET() {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, player_id, username, message, created_at')
    .order('created_at', { ascending: true })
    .limit(100)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(req: NextRequest) {
  const { player_id, username, message } = await req.json()
  if (!player_id || !username || !message?.trim()) {
    return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
  }
  if (message.length > 300) {
    return NextResponse.json({ error: 'Mensaje muy largo' }, { status: 400 })
  }
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ player_id, username, message: message.trim() })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 })
  const supabase = getSupabase()
  const { error } = await supabase.from('chat_messages').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
