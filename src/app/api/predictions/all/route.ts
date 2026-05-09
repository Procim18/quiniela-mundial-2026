import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
  const { data, error } = await supabase
    .from('group_predictions')
    .select('player_id, match_id, home_score, away_score')
  
  console.log('predictions/all result:', JSON.stringify({ count: data?.length, error }))
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, {
    headers: { 'Cache-Control': 'no-store' }
  })
}
