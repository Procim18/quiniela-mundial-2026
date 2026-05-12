import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const res = await fetch('https://api.football-data.org/v4/competitions/WC/teams', {
      headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY! },
      next: { revalidate: 86400 }
    })
    if (!res.ok) return NextResponse.json({ data: [], error: 'API no disponible aun' })
    const json = await res.json()
    const players: { name: string; team: string; position: string }[] = []
    for (const team of (json.teams || [])) {
      for (const player of (team.squad || [])) {
        players.push({
          name: player.name,
          team: team.name,
          position: player.position || 'Unknown'
        })
      }
    }
    players.sort((a, b) => a.name.localeCompare(b.name))
    return NextResponse.json({ data: players })
  } catch {
    return NextResponse.json({ data: [], error: 'Error al conectar con la API' })
  }
}
