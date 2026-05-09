import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  if (!username || !password) {
    return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
  }

  const { data: player, error } = await supabase
    .from('players')
    .select('*')
    .eq('username', username.trim())
    .single()

  if (error || !player) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, player.password_hash)
  if (!valid) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
  }

  if (!player.is_active) {
    return NextResponse.json({ error: 'Tu cuenta esta pendiente de activacion. Contacta al admin para activarla.' }, { status: 403 })
  }

  return NextResponse.json({
    player: { id: player.id, username: player.username, is_admin: player.is_admin }
  })
}
