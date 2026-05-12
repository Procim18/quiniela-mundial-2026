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
  const { data } = await supabase.from('top_scorer_result').select('*').eq('id', 1).single()
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-password') !== process.env.ADMIN_PASSWORD)
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { scorer_name } = await req.json()
  const supabase = getSupabase()
  const { error } = await supabase.from('top_scorer_result').upsert({ id: 1, scorer_name })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
