import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

function checkAdmin(req: NextRequest) {
  return req.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { player_id, new_password } = await req.json()
  if (!player_id || !new_password) return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
  if (new_password.length < 4) return NextResponse.json({ error: 'Minimo 4 caracteres' }, { status: 400 })
  const hash = await bcrypt.hash(new_password, 10)
  const { error } = await supabase.from('players').update({ password_hash: hash }).eq('id', player_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
