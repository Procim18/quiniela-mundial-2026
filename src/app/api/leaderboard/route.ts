import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0
import { supabase } from '@/lib/supabase'
import { getGroupMatches, getOutcome, CHAMPION_POINTS } from '@/lib/data'
import { KNOCKOUT_PTS, ALL_KNOCKOUT_ROUNDS } from '@/lib/knockout'

export async function GET() {
  const [
    { data: players },
    { data: groupPreds },
    { data: groupResults },
    { data: knockoutPreds },
    { data: knockoutResults },
    { data: champPreds },
    { data: champResult },
  ] = await Promise.all([
    supabase.from('players').select('id,username'),
    supabase.from('group_predictions').select('*'),
    supabase.from('group_results').select('*'),
    supabase.from('knockout_predictions').select('*'),
    supabase.from('knockout_results').select('*'),
    supabase.from('champion_predictions').select('*'),
    supabase.from('champion_result').select('*').eq('id', 1).single(),
  ])

  if (!players) return NextResponse.json({ data: [] })

  const groupResultsMap: Record<string, { home_score: number; away_score: number }> = {}
  ;(groupResults || []).forEach(r => { groupResultsMap[r.match_id] = r })

  const knockoutResultsMap: Record<string, any> = {}
  ;(knockoutResults || []).forEach(r => { knockoutResultsMap[r.match_id] = r })

  const realChampion = champResult?.team || null

  const scores = players.map(player => {
    let pts = 0, exactGroup = 0, winnerGroup = 0
    let exactKnockout = 0, winnerKnockout = 0, champPts = 0

    // --- GROUP PHASE ---
    const myGroupPreds = (groupPreds || []).filter(p => p.player_id === player.id)
    myGroupPreds.forEach(pred => {
      const result = groupResultsMap[pred.match_id]
      if (!result) return
      if (pred.home_score === result.home_score && pred.away_score === result.away_score) {
        pts += 3; exactGroup++
      } else if (getOutcome(pred.home_score, pred.away_score) === getOutcome(result.home_score, result.away_score)) {
        pts += 1; winnerGroup++
      }
    })

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
      // Ganador en 90min: predijo quien gana Y el resultado no es empate Y coincide
      const realWinner90 = Number(result.home_score) !== Number(result.away_score) ? result.winner : null
      const predWinner90 = Number(pred.home_score) !== Number(pred.away_score) ? pred.winner : null
      const correctGanador90 = sameTeams && realWinner90 && predWinner90 === realWinner90
      const correctAdvance = pred.winner === result.winner
      if (correctWinner90) { pts += (roundPts as any).exact; exactKnockout++ }
      if (correctGanador90 && !exactScore) { pts += (roundPts as any).winner }
      if (correctAdvance) { pts += (roundPts as any).advance; winnerKnockout++ }
    })

    // --- CHAMPION ---
    const myChamp = (champPreds || []).find(p => p.player_id === player.id)
    if (myChamp && realChampion && myChamp.team === realChampion) {
      pts += CHAMPION_POINTS; champPts = CHAMPION_POINTS
    }

    return {
      id: player.id,
      username: player.username,
      pts,
      exactGroup,
      winnerGroup,
      exactKnockout,
      winnerKnockout,
      champPts,
    }
  })

  scores.sort((a, b) => b.pts - a.pts || b.exactGroup - a.exactGroup)

  return NextResponse.json({ data: scores })
}
