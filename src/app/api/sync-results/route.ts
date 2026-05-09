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

function checkAdmin(req: NextRequest) {
  return req.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD
}

// Map from football-data.org team names to our team names
const TEAM_MAP: Record<string, string> = {
  'Mexico': 'Mexico',
  'South Africa': 'Sudafrica',
  'South Korea': 'Corea del Sur',
  'Czechia': 'Chequia',
  'Canada': 'Canada',
  'Bosnia and Herzegovina': 'Bosnia-Herzegovina',
  'Qatar': 'Qatar',
  'Switzerland': 'Suiza',
  'Brazil': 'Brasil',
  'Morocco': 'Marruecos',
  'Haiti': 'Haiti',
  'Scotland': 'Escocia',
  'USA': 'USA',
  'United States': 'USA',
  'Paraguay': 'Paraguay',
  'Australia': 'Australia',
  'Turkey': 'Turquia',
  'Germany': 'Alemania',
  'Curaçao': 'Curazao',
  'Ivory Coast': 'Costa de Marfil',
  "Côte d'Ivoire": 'Costa de Marfil',
  'Ecuador': 'Ecuador',
  'Netherlands': 'Paises Bajos',
  'Japan': 'Japon',
  'Sweden': 'Suecia',
  'Tunisia': 'Tunez',
  'Belgium': 'Belgica',
  'Egypt': 'Egipto',
  'Iran': 'Iran',
  'New Zealand': 'Nueva Zelanda',
  'Spain': 'Espana',
  'Cape Verde': 'Cabo Verde',
  'Saudi Arabia': 'Arabia Saudita',
  'Uruguay': 'Uruguay',
  'France': 'Francia',
  'Senegal': 'Senegal',
  'Iraq': 'Irak',
  'Norway': 'Noruega',
  'Argentina': 'Argentina',
  'Algeria': 'Argelia',
  'Austria': 'Austria',
  'Jordan': 'Jordania',
  'Portugal': 'Portugal',
  'DR Congo': 'RD Congo',
  'Uzbekistan': 'Uzbekistan',
  'Colombia': 'Colombia',
  'England': 'Inglaterra',
  'Croatia': 'Croacia',
  'Ghana': 'Ghana',
  'Panama': 'Panama',
}

// Map our match IDs to fixture matchdays
const GROUP_MATCH_MAP: Record<string, {group: string; matchday: number; homeIdx: number; awayIdx: number}> = {
  'A_0': { group: 'A', matchday: 1, homeIdx: 0, awayIdx: 1 },
  'A_1': { group: 'A', matchday: 1, homeIdx: 2, awayIdx: 3 },
  'A_2': { group: 'A', matchday: 2, homeIdx: 0, awayIdx: 2 },
  'A_3': { group: 'A', matchday: 2, homeIdx: 1, awayIdx: 3 },
  'A_4': { group: 'A', matchday: 3, homeIdx: 0, awayIdx: 3 },
  'A_5': { group: 'A', matchday: 3, homeIdx: 1, awayIdx: 2 },
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const apiKey = process.env.FOOTBALL_DATA_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API key no configurada' }, { status: 500 })

  try {
    // Fetch World Cup 2026 matches from football-data.org
    const res = await fetch('https://api.football-data.org/v4/competitions/WC/matches?season=2026&status=FINISHED', {
      headers: { 'X-Auth-Token': apiKey }
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: 'API error: ' + err }, { status: 500 })
    }

    const data = await res.json()
    const matches = data.matches || []

    if (matches.length === 0) {
      return NextResponse.json({ ok: true, synced: 0, message: 'No hay partidos finalizados aun' })
    }

    const supabase = getSupabase()
    let synced = 0

    for (const match of matches) {
      if (match.status !== 'FINISHED') continue

      const homeTeam = TEAM_MAP[match.homeTeam.name] || match.homeTeam.name
      const awayTeam = TEAM_MAP[match.awayTeam.name] || match.awayTeam.name
      const homeScore = match.score.fullTime.home
      const awayScore = match.score.fullTime.away

      if (homeScore === null || awayScore === null) continue

      // Find matching match_id in our system
      // Match by team names in group stage
      const { getGroupMatches, GROUPS } = await import('@/lib/data')
      const groupMatches = getGroupMatches()
      const ourMatch = groupMatches.find(m =>
        (m.home.name === homeTeam && m.away.name === awayTeam) ||
        (m.home.name === awayTeam && m.away.name === homeTeam)
      )

      if (!ourMatch) continue

      const isReversed = ourMatch.home.name === awayTeam
      const { error } = await supabase.from('group_results').upsert({
        match_id: ourMatch.id,
        home_score: isReversed ? awayScore : homeScore,
        away_score: isReversed ? homeScore : awayScore,
        updated_at: new Date().toISOString()
      }, { onConflict: 'match_id' })

      if (!error) synced++
    }

    return NextResponse.json({ ok: true, synced, total: matches.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
