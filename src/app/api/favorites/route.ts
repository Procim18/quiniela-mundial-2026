import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ALL_TEAMS } from '@/lib/data'

export async function GET() {
  const { data: champPreds } = await supabase.from('champion_predictions').select('team')
  if (!champPreds || champPreds.length === 0) return NextResponse.json({ data: [] })
  const counts: Record<string, number> = {}
  champPreds.forEach(p => { counts[p.team] = (counts[p.team] || 0) + 1 })
  const total = champPreds.length
  const seen: Record<string, boolean> = {}
  const uniqueTeams: string[] = []
  ALL_TEAMS.forEach(t => { if (!seen[t.name]) { seen[t.name] = true; uniqueTeams.push(t.name) } })
  const result = uniqueTeams
    .filter(name => counts[name])
    .map(name => {
      const team = ALL_TEAMS.find(t => t.name === name)
      return { name, flag: team?.flag || '', count: counts[name], pct: Math.round((counts[name] / total) * 100) }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
  return NextResponse.json({ data: result, total })
}
