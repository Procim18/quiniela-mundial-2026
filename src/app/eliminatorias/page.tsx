'use client'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { ALL_KNOCKOUT_ROUNDS, KNOCKOUT_PTS, KnockoutMatch } from '@/lib/knockout'
import { ALL_TEAMS, isRoundLocked } from '@/lib/data'

type KnockPred = { home_score: string; away_score: string; winner: string }
type KnockResult = { home_team: string; away_team: string; home_score: number | null; away_score: number | null; winner: string }
type PredMap = Record<string, KnockPred>
type ResultMap = Record<string, KnockResult>

const LockIcon = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
const CheckIcon = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
const PinIcon = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
const CalIcon = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const StarIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>

// Maps each match to its feeder matches from previous round
const BRACKET: Record<string, [string, string]> = {
  'R16_M89': ['R32_M73', 'R32_M77'],
  'R16_M90': ['R32_M74', 'R32_M75'],
  'R16_M91': ['R32_M76', 'R32_M78'],
  'R16_M92': ['R32_M79', 'R32_M80'],
  'R16_M93': ['R32_M83', 'R32_M84'],
  'R16_M94': ['R32_M81', 'R32_M82'],
  'R16_M95': ['R32_M86', 'R32_M88'],
  'R16_M96': ['R32_M85', 'R32_M87'],
  'QF_M97':  ['R16_M89', 'R16_M90'],
  'QF_M98':  ['R16_M93', 'R16_M94'],
  'QF_M99':  ['R16_M91', 'R16_M92'],
  'QF_M100': ['R16_M95', 'R16_M96'],
  'SF_M101': ['QF_M97',  'QF_M98'],
  'SF_M102': ['QF_M99',  'QF_M100'],
  'TP_M103': ['SF_M101', 'SF_M102'],
  'FINAL_M104': ['SF_M101', 'SF_M102'],
}

export default function EliminatoriasPage() {
  const { player, loading } = useAuth()
  const router = useRouter()
  const [activeRound, setActiveRound] = useState('R32')
  const [preds, setPreds] = useState<PredMap>({})
  const [results, setResults] = useState<ResultMap>({})
  const [champion, setChampion] = useState('')
  const [champResult, setChampResult] = useState('')
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!loading && !player) router.push('/login')
  }, [player, loading])

  useEffect(() => {
    if (!player) return
    fetch('/api/knockout?type=predictions&player_id=' + player.id)
      .then(r => r.json()).then(({ data }) => {
        const map: PredMap = {}
        ;(data || []).forEach((p: any) => {
          map[p.match_id] = {
            home_score: p.home_score !== null && p.home_score !== undefined ? String(p.home_score) : '',
            away_score: p.away_score !== null && p.away_score !== undefined ? String(p.away_score) : '',
            winner: p.winner || '',
          }
        })
        setPreds(map)
      })
    fetch('/api/knockout?type=results')
      .then(r => r.json()).then(({ data }) => {
        const map: ResultMap = {}
        ;(data || []).forEach((r: any) => { map[r.match_id] = r })
        setResults(map)
      })
    fetch('/api/predictions/champion?player_id=' + player.id)
      .then(r => r.json()).then(({ data }) => { if (data?.[0]) setChampion(data[0].team) })
    fetch('/api/results/champion')
      .then(r => r.json()).then(({ data }) => { if (data?.team) setChampResult(data.team) })
  }, [player])

  const savePred = useCallback(async (matchId: string, pred: KnockPred, overrideTeams?: {home: string, away: string}) => {
    if (!player) return
    const teams = overrideTeams || (matchId.startsWith('R32_') ? (results[matchId] ? { home: results[matchId].home_team, away: results[matchId].away_team } : null) : getTeamsForMatch(matchId))
    // Allow saving even without teams - winner is most important
    setSaving(s => ({ ...s, [matchId]: true }))
    await fetch('/api/knockout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'prediction', player_id: player.id, match_id: matchId,
        home_team: teams?.home || '',
        away_team: teams?.away || '',
        home_score: pred.home_score === '' ? null : parseInt(pred.home_score),
        away_score: pred.away_score === '' ? null : parseInt(pred.away_score),
        winner: pred.winner,
      }),
    })
    setSaving(s => ({ ...s, [matchId]: false }))
    setSaved(s => ({ ...s, [matchId]: true }))
    setTimeout(() => setSaved(s => ({ ...s, [matchId]: false })), 2000)
  }, [player, results, preds])

  const updatePred = (matchId: string, field: keyof KnockPred, val: string) => {
    const current = preds[matchId] || { home_score: '', away_score: '', winner: '' }
    setPreds(p => ({ ...p, [matchId]: { ...current, [field]: val } }))
  }

  const handleBlur = (matchId: string) => {
    const pred = preds[matchId]
    if (pred) {
      const teams = matchId.startsWith('R32_') ? (results[matchId] ? { home: results[matchId].home_team, away: results[matchId].away_team } : null) : getTeamsForMatch(matchId)
      savePred(matchId, pred, teams || undefined)
    }
  }

  const getPoints = (matchId: string, pred: KnockPred) => {
    const res = results[matchId]
    if (!res || !res.winner || !pred.winner) return null
    const round = matchId.split('_')[0]
    const pts = KNOCKOUT_PTS[round] || { exact: 2, winner: 1 }
    const predH = parseInt(pred.home_score), predA = parseInt(pred.away_score)
    if (!isNaN(predH) && !isNaN(predA) && predH === res.home_score && predA === res.away_score && pred.winner === res.winner) return pts.exact
    if (pred.winner === res.winner) return pts.winner
    return 0
  }

  const uniqueTeams = ALL_TEAMS.filter((t, i, arr) => arr.findIndex(x => x.name === t.name) === i)

  // Get teams for a match based on user predictions from previous rounds
  const getTeamsForMatch = (matchId: string): { home: string; away: string } | null => {
    // R32 uses admin-confirmed results
    if (matchId.startsWith('R32_')) {
      const res = results[matchId]
      if (!res?.home_team) return null
      return { home: res.home_team, away: res.away_team }
    }
    // Other rounds use user predictions from previous round
    const feeders = BRACKET[matchId]
    if (!feeders) return null
    const [homeFeed, awayFeed] = feeders
    const homePred = preds[homeFeed]
    const awayPred = preds[awayFeed]
    if (!homePred?.winner || !awayPred?.winner) return null
    // For TP, use losers of SF
    if (matchId === 'TP_M103') {
      const sf1 = preds['SF_M101'], sf2 = preds['SF_M102']
      const sf1res = results['SF_M101'], sf2res = results['SF_M102']
      const home = sf1?.winner ? (sf1.winner === sf1res?.home_team ? sf1res?.away_team : sf1res?.home_team) : null
      const away = sf2?.winner ? (sf2.winner === sf2res?.home_team ? sf2res?.away_team : sf2res?.home_team) : null
      // Use predicted teams if results not available
      const homeFeedTeams = getTeamsForMatch('SF_M101')
      const awayFeedTeams = getTeamsForMatch('SF_M102')
      if (!homeFeedTeams || !awayFeedTeams) return null
      const homePredSF = preds['SF_M101']
      const awayPredSF = preds['SF_M102']
      if (!homePredSF?.winner || !awayPredSF?.winner) return null
      const tpHome = homePredSF.winner === homeFeedTeams.home ? homeFeedTeams.away : homeFeedTeams.home
      const tpAway = awayPredSF.winner === awayFeedTeams.home ? awayFeedTeams.away : awayFeedTeams.home
      return { home: tpHome, away: tpAway }
    }
    return { home: homePred.winner, away: awayPred.winner }
  }
  const getFlag = (name: string) => uniqueTeams.find(t => t.name === name)?.flag || ''
  const roundLocked = activeRound === 'CHAMPION' ? isRoundLocked('campeon') : isRoundLocked(activeRound)
  const currentRound = ALL_KNOCKOUT_ROUNDS.find(r => r.id === activeRound)

  if (loading || !player) return null

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px 60px' }}>

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: 'var(--text)', letterSpacing: '0.06em', lineHeight: 1 }}>Eliminatorias</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: 4 }}>
          Los equipos aparecen cuando el admin los confirma. Predice el marcador y quién avanza.
        </p>
      </div>

      {/* Points legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {ALL_KNOCKOUT_ROUNDS.map(r => {
          const pts = KNOCKOUT_PTS[r.id]
          return (
            <div key={r.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: '4px 10px', fontSize: '0.68rem' }}>
              <span style={{ color: 'var(--muted)' }}>{r.label}: </span>
              <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{pts?.exact}pts</span>
              <span style={{ color: 'var(--muted)', margin: '0 3px' }}>/</span>
              <span style={{ color: 'var(--blue)' }}>{pts?.winner}pt ganador</span>
            </div>
          )
        })}
      </div>

      {/* Round tabs */}
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', marginBottom: 20, paddingBottom: 2, scrollbarWidth: 'none' }}>
        {ALL_KNOCKOUT_ROUNDS.map(r => {
          const isActive = activeRound === r.id
          const locked = isRoundLocked(r.id)
          return (
            <button key={r.id} onClick={() => setActiveRound(r.id)} style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
              background: isActive ? 'rgba(244,197,66,0.1)' : 'rgba(255,255,255,0.03)',
              border: '1px solid ' + (isActive ? 'rgba(244,197,66,0.4)' : 'rgba(255,255,255,0.07)'),
              borderRadius: 7, padding: '7px 14px', cursor: 'pointer',
              color: isActive ? 'var(--gold)' : 'var(--muted)',
              fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.85rem', letterSpacing: '0.06em', whiteSpace: 'nowrap',
            }}>
              {locked && <span style={{ opacity: 0.5 }}><LockIcon /></span>}
              {r.label}
            </button>
          )
        })}
        <button onClick={() => setActiveRound('CHAMPION')} style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
          background: activeRound === 'CHAMPION' ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.03)',
          border: '1px solid ' + (activeRound === 'CHAMPION' ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.07)'),
          borderRadius: 7, padding: '7px 14px', cursor: 'pointer',
          color: activeRound === 'CHAMPION' ? 'var(--purple)' : 'var(--muted)',
          fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.85rem', letterSpacing: '0.06em', whiteSpace: 'nowrap',
        }}>
          <StarIcon /> Campeón
        </button>
      </div>

      {roundLocked && activeRound !== 'CHAMPION' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(214,40,40,0.06)', border: '1px solid rgba(214,40,40,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: '0.8rem', color: '#FF6B6B' }}>
          <LockIcon /> Predicciones cerradas para esta ronda
        </div>
      )}

      {/* CHAMPION */}
      {activeRound === 'CHAMPION' && (
        <div style={{ background: 'rgba(10,10,16,0.8)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 14, padding: '24px', backdropFilter: 'blur(12px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ color: 'var(--purple)' }}><StarIcon /></span>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: 'var(--purple)', letterSpacing: '0.06em' }}>Campeón del Mundial</h2>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '0.78rem', marginBottom: 20 }}>
            Acertar el campeón vale <strong style={{ color: 'var(--purple)' }}>10 puntos</strong>.
          </p>
          {champion && (
            <div style={{ marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 8, padding: '8px 14px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--purple)' }}>Tu selección: {getFlag(champion)} {champion}</span>
              {champResult && champion === champResult && <span style={{ color: 'var(--green)', fontSize: '0.8rem', fontWeight: 600 }}>+10 pts</span>}
              {champResult && champion !== champResult && <span style={{ color: '#FF6B6B', fontSize: '0.8rem' }}>✗</span>}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 6 }}>
            {uniqueTeams.map(team => (
              <button key={team.name} onClick={() => { setChampion(team.name); fetch('/api/predictions/champion', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ player_id: player.id, team: team.name }) }) }} style={{
                background: champion === team.name ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.03)',
                border: '1px solid ' + (champion === team.name ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.07)'),
                borderRadius: 8, padding: '9px 12px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                color: champion === team.name ? 'var(--purple)' : 'var(--text)',
              }}>
                <span style={{ fontSize: '1.1rem' }}>{team.flag}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 500, flex: 1, textAlign: 'left' }}>{team.name}</span>
                {champion === team.name && <span style={{ color: 'var(--purple)' }}><CheckIcon /></span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* KNOCKOUT MATCHES */}
      {activeRound !== 'CHAMPION' && currentRound && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: 'var(--text)', letterSpacing: '0.06em' }}>{currentRound.label}</h2>
            <span style={{ fontSize: '0.72rem', color: 'var(--muted)', background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '4px 10px', border: '1px solid rgba(255,255,255,0.07)' }}>
              {currentRound.matches.filter(m => getTeamsForMatch(m.id)).length}/{currentRound.matches.length} {activeRound === 'R32' ? 'confirmados por admin' : 'disponibles'}
            </span>
          </div>

          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 6, padding: '0 2px' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase', textAlign: 'center' }}>Tu Predicción</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase', textAlign: 'center' }}>Resultado Real</div>
          </div>

          {currentRound.matches.map((match: KnockoutMatch) => {
            const pred = preds[match.id] || { home_score: '', away_score: '', winner: '' }
            const res = results[match.id]
            const teams = getTeamsForMatch(match.id)
            const hasTeams = !!teams
            const homeTeam = teams?.home || res?.home_team || ''
            const awayTeam = teams?.away || res?.away_team || ''
            const pts = getPoints(match.id, pred)
            const pts_config = KNOCKOUT_PTS[match.round] || { exact: 2, winner: 1 }

            return (
              <div key={match.id} style={{ marginBottom: 8 }}>
                {/* Match header */}
                <div style={{ background: 'rgba(10,10,16,0.8)', borderRadius: '10px 10px 0 0', padding: '6px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.06)', borderBottom: 'none', flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 700, fontFamily: "'Bebas Neue', sans-serif" }}>{match.label}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.65rem', color: 'var(--muted)' }}><PinIcon /> {match.stadium} · {match.city}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.65rem', color: 'var(--muted)' }}><CalIcon /> {match.date} · {match.time} ET</span>
                    {!hasTeams && <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>{match.homeDesc} vs {match.awayDesc}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {saving[match.id] && <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>...</span>}
                    {saved[match.id] && <span style={{ color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.65rem' }}><CheckIcon /> Guardado</span>}
                    {pts !== null && (
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.78rem', padding: '2px 8px', borderRadius: 4, background: pts >= pts_config.exact ? 'rgba(244,197,66,0.1)' : pts > 0 ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.04)', color: pts >= pts_config.exact ? 'var(--gold)' : pts > 0 ? 'var(--blue)' : 'var(--muted)', border: '1px solid ' + (pts >= pts_config.exact ? 'rgba(244,197,66,0.2)' : pts > 0 ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.07)') }}>
                        {pts > 0 ? '+' + pts + ' pts' : '0 pts'}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                  {/* PREDICTION side */}
                  <div style={{ background: hasTeams ? 'rgba(17,17,24,0.75)' : 'rgba(10,10,14,0.6)', border: '1px solid rgba(255,255,255,0.07)', borderRight: 'none', borderTop: 'none', borderRadius: '0 0 0 10px', padding: '14px 16px' }}>
                    {!hasTeams ? (
                      <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>Pendiente</div>
                        <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>{match.homeDesc} vs {match.awayDesc}</div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>
                          {match.id.startsWith('R32_') ? 'El admin confirmará los equipos' : 'Completa la ronda anterior para ver los equipos'}
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Teams row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{homeTeam}</span>
                            <span style={{ fontSize: '1.3rem' }}>{getFlag(homeTeam)}</span>
                          </div>
                          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', fontWeight: 600 }}>vs</span>
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: '1.3rem' }}>{getFlag(awayTeam)}</span>
                            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{awayTeam}</span>
                          </div>
                        </div>
                        {/* Score row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input type="number" min={0} max={20} value={pred.home_score}
                            onChange={e => updatePred(match.id, 'home_score', e.target.value)}
                            onBlur={() => handleBlur(match.id)}
                            disabled={roundLocked} placeholder="-"
                            style={{ width: 42, height: 40, background: roundLocked ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: 'var(--text)', outline: 'none' }} />
                          <span style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'Bebas Neue', sans-serif" }}>:</span>
                          <input type="number" min={0} max={20} value={pred.away_score}
                            onChange={e => updatePred(match.id, 'away_score', e.target.value)}
                            onBlur={() => handleBlur(match.id)}
                            disabled={roundLocked} placeholder="-"
                            style={{ width: 42, height: 40, background: roundLocked ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: 'var(--text)', outline: 'none' }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.6rem', color: 'var(--muted)', marginBottom: 3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Avanza</div>
                            <div style={{ display: 'flex', gap: 5 }}>
                              <button onClick={() => { const newPred = { ...pred, winner: homeTeam }; updatePred(match.id, 'winner', homeTeam); savePred(match.id, newPred, {home: homeTeam, away: awayTeam}) }} disabled={roundLocked}
                                style={{ flex: 1, padding: '5px 8px', borderRadius: 6, border: '1px solid ' + (pred.winner === homeTeam ? 'rgba(244,197,66,0.5)' : 'rgba(255,255,255,0.1)'), background: pred.winner === homeTeam ? 'rgba(244,197,66,0.12)' : 'rgba(255,255,255,0.04)', color: pred.winner === homeTeam ? 'var(--gold)' : 'var(--muted)', cursor: roundLocked ? 'not-allowed' : 'pointer', fontSize: '0.68rem', fontWeight: 600, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                <span>{getFlag(homeTeam)}</span><span>{homeTeam}</span>
                              </button>
                              <button onClick={() => { const newPred = { ...pred, winner: awayTeam }; updatePred(match.id, 'winner', awayTeam); savePred(match.id, newPred, {home: homeTeam, away: awayTeam}) }} disabled={roundLocked}
                                style={{ flex: 1, padding: '5px 8px', borderRadius: 6, border: '1px solid ' + (pred.winner === awayTeam ? 'rgba(244,197,66,0.5)' : 'rgba(255,255,255,0.1)'), background: pred.winner === awayTeam ? 'rgba(244,197,66,0.12)' : 'rgba(255,255,255,0.04)', color: pred.winner === awayTeam ? 'var(--gold)' : 'var(--muted)', cursor: roundLocked ? 'not-allowed' : 'pointer', fontSize: '0.68rem', fontWeight: 600, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                <span>{getFlag(awayTeam)}</span><span>{awayTeam}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* RESULT side */}
                  <div style={{ background: res?.home_score !== null && res?.home_score !== undefined ? 'rgba(244,197,66,0.03)' : 'rgba(10,10,14,0.6)', border: '1px solid ' + (res?.home_score !== null && res?.home_score !== undefined ? 'rgba(244,197,66,0.15)' : 'rgba(255,255,255,0.07)'), borderTop: 'none', borderRadius: '0 0 10px 0', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {res?.home_team && res.home_score !== null && res.home_score !== undefined ? (
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 600, flex: 1 }}>{getFlag(homeTeam)} {homeTeam}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 34, height: 34, background: 'rgba(244,197,66,0.1)', border: '1px solid rgba(244,197,66,0.3)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: 'var(--gold)' }}>{res.home_score}</div>
                            <span style={{ color: 'rgba(255,255,255,0.2)', fontFamily: "'Bebas Neue', sans-serif" }}>:</span>
                            <div style={{ width: 34, height: 34, background: 'rgba(244,197,66,0.1)', border: '1px solid rgba(244,197,66,0.3)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: 'var(--gold)' }}>{res.away_score}</div>
                          </div>
                          <span style={{ fontSize: '0.88rem', fontWeight: 600, flex: 1, textAlign: 'right' }}>{awayTeam} {getFlag(awayTeam)}</span>
                        </div>
                        {res.winner && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--green)', textAlign: 'center', background: 'rgba(46,204,113,0.06)', borderRadius: 5, padding: '3px 8px', border: '1px solid rgba(46,204,113,0.15)' }}>
                            Avanza: {getFlag(res.winner)} {res.winner}
                          </div>
                        )}
                      </div>
                    ) : res?.home_team ? (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{getFlag(homeTeam)} {homeTeam} vs {awayTeam} {getFlag(awayTeam)}</div>
                        <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Sin resultado aún</div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Pendiente</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
