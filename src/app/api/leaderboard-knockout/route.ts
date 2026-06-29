import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0
import { supabase } from '@/lib/supabase'
import { CHAMPION_POINTS } from '@/lib/data'
import { KNOCKOUT_PTS } from '@/lib/knockout'

export async function GET() {
  const [
    { data: players },
    { data: knockoutPreds },
    { data: knockoutResults },
    { data: champPreds },
    { data: champResult },
    { data: scorerPreds },
    { data: scorerResult },
  ] = await Promise.all([
    supabase.from('players').select('id,username'),
    supabase.from('knockout_predictions').select('*'),
    supabase.from('knockout_results').select('*'),
    supabase.from('champion_predictions').select('*'),
    supabase.from('champion_result').select('*').eq('id', 1).single(),
    supabase.from('top_scorer_predictions').select('*'),
    supabase.from('top_scorer_result').select('*').eq('id', 1).single(),
  ])

  if (!players) return NextResponse.json({ data: [] })

  const knockoutResultsMap: Record<string, any> = {}
  ;(knockoutResults || []).forEach(r => { knockoutResultsMap[r.match_id] = r })

  const realChampion = champResult?.team || null
  const realScorer = scorerResult?.scorer_name || null

  const scores = players.map(player => {
    let pts = 0, exactKnockout = 0, winnerKnockout = 0, champPts = 0, scorerPts = 0

    // --- KNOCKOUT PHASE ---
    const myKnockoutPreds = (knockoutPreds || []).filter(p => p.player_id === player.id)
    myKnockoutPreds.forEach(pred => {
      const result = knockoutResultsMap[pred.match_id]
      if (!result || !result.winner || !pred.winner) return
      const round = pred.match_id.split('_')[0]
      const roundPts = KNOCKOUT_PTS[round] || { exact: 2, winner: 1 }
      const predH = Number(pred.home_score)
      const predA = Number(pred.away_score)
      const sameTeams = pred.home_team === result.home_team && pred.away_team === result.away_team
      const exactScore = !isNaN(predH) && !isNaN(predA) && predH === Number(result.home_score) && predA === Number(result.away_score)
      const correctWinner90 = sameTeams && exactScore && pred.winner === result.winner
      const correctAdvance = pred.winner === result.winner
      if (correctWinner90) { pts += (roundPts as any).exact; exactKnockout++ }
      if (sameTeams && exactScore) { pts += (roundPts as any).winner }
      if (correctAdvance) { pts += (roundPts as any).advance; winnerKnockout++ }
    })

    // --- CHAMPION ---
    const myChamp = (champPreds || []).find(p => p.player_id === player.id)
    if (myChamp && realChampion && myChamp.team === realChampion) {
      pts += CHAMPION_POINTS; champPts = CHAMPION_POINTS
    }

    // --- SCORER ---
    const myScorer = (scorerPreds || []).find(p => p.player_id === player.id)
    if (myScorer && realScorer && myScorer.scorer_name === realScorer) {
      pts += 10; scorerPts = 10
    }

    return {
      id: player.id,
      username: player.username,
      pts,
      exactKnockout,
      winnerKnockout,
      champPts,
      scorerPts,
    }
  })

  scores.sort((a, b) => b.pts - a.pts || b.exactKnockout - a.exactKnockout)

  return NextResponse.json({ data: scores })
}
