import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { username, email, password } = await req.json()

  if (!username || !password || !email) {
    return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
  }
  if (username.length < 2 || username.length > 20) {
    return NextResponse.json({ error: 'El nombre debe tener 2-20 caracteres' }, { status: 400 })
  }
  if (password.length < 4) {
    return NextResponse.json({ error: 'La contraseña debe tener mínimo 4 caracteres' }, { status: 400 })
  }
  if (!email.includes('@') || !email.includes('.')) {
    return NextResponse.json({ error: 'Correo inválido' }, { status: 400 })
  }

  const hash = await bcrypt.hash(password, 10)

  const { data: player, error } = await supabase
    .from('players')
    .insert({ username: username.trim(), email: email.trim().toLowerCase(), password_hash: hash })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      if (error.message.includes('email')) {
        return NextResponse.json({ error: 'Ese correo ya está registrado' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Ese nombre de usuario ya existe' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Error al crear cuenta' }, { status: 500 })
  }

  return NextResponse.json({
    player: { id: player.id, username: player.username, is_admin: player.is_admin }
  })
}
