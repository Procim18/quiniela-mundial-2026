'use client'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { ALL_KNOCKOUT_ROUNDS, KNOCKOUT_PTS, KnockoutMatch } from '@/lib/knockout'
import { ALL_TEAMS, isRoundLocked } from '@/lib/data'

type KnockPred = { home_team: string; away_team: string; home_score: string; away_score: string; winner: string }
type KnockResult = { home_team: string; away_team: string; home_score: number | null; away_score: number | null; winner: string }
type PredMap = Record<string, KnockPred>
type ResultMap = Record<string, KnockResult>

const LockIcon = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
const CheckIcon = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
const PinIcon = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
const CalIcon = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const ChevronIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
const StarIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>

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
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null)

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
            home_team: p.home_team || '', away_team: p.away_team || '',
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

  const savePred = useCallback(async (matchId: string, pred: KnockPred) => {
    if (!player) return
    setSaving(s => ({ ...s, [matchId]: true }))
    await fetch('/api/knockout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'prediction', player_id: player.id, match_id: matchId, ...pred }),
    })
    setSaving(s => ({ ...s, [matchId]: false }))
    setSaved(s => ({ ...s, [matchId]: true }))
    setTimeout(() => setSaved(s => ({ ...s, [matchId]: false })), 2000)
  }, [player])

  const updatePred = (matchId: string, field: keyof KnockPred, val: string) => {
    const current = preds[matchId] || { home_team: '', away_team: '', home_score: '', away_score: '', winner: '' }
    const updated = { ...current, [field]: val }
    setPreds(p => ({ ...p, [matchId]: updated }))
  }

  const handleBlurPred = (matchId: string) => {
    const pred = preds[matchId]
    if (pred) savePred(matchId, pred)
  }

  const saveChampion = async (team: string) => {
    if (!player) return
    setChampion(team)
    await fetch('/api/predictions/champion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: player.id, team }),
    })
  }

  const getPoints = (matchId: string, pred: KnockPred) => {
    const res = results[matchId]
    if (!res || !res.winner || !pred.winner) return null
    const round = matchId.split('_')[0]
    const pts = KNOCKOUT_PTS[round] || { exact: 2, winner: 1 }
    const predH = parseInt(pred.home_score), predA = parseInt(pred.away_score)
    if (pred.home_team === res.home_team && pred.away_team === res.away_team &&
        !isNaN(predH) && !isNaN(predA) &&
        predH === res.home_score && predA === res.away_score &&
        pred.winner === res.winner) return pts.exact
    if (pred.winner === res.winner) return pts.winner
    return 0
  }

  const uniqueTeams = ALL_TEAMS.filter((t, i, arr) => arr.findIndex(x => x.name === t.name) === i)
  const roundLocked = activeRound === 'CHAMPION' ? isRoundLocked('campeon') : isRoundLocked(activeRound)
  const currentRound = ALL_KNOCKOUT_ROUNDS.find(r => r.id === activeRound)

  if (loading || !player) return null

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px 60px' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: 'var(--text)', letterSpacing: '0.06em', lineHeight: 1 }}>Eliminatorias</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: 4 }}>Predice el marcador y quién avanza en cada ronda.</p>
      </div>

      {/* Points per round */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {ALL_KNOCKOUT_ROUNDS.map(r => {
          const pts = KNOCKOUT_PTS[r.id]
          return (
            <div key={r.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: '4px 10px', fontSize: '0.68rem' }}>
              <span style={{ color: 'var(--muted)' }}>{r.label}: </span>
              <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{pts?.exact}pts</span>
              <span style={{ color: 'var(--muted)', margin: '0 3px' }}>/</span>
              <span style={{ color: 'var(--blue)' }}>{pts?.winner}pt</span>
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
            <button key={r.id} onClick={() => { setActiveRound(r.id); setExpandedMatch(null) }} style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
              background: isActive ? 'rgba(244,197,66,0.1)' : 'rgba(255,255,255,0.03)',
              border: '1px solid ' + (isActive ? 'rgba(244,197,66,0.4)' : 'rgba(255,255,255,0.07)'),
              borderRadius: 7, padding: '7px 14px', cursor: 'pointer',
              color: isActive ? 'var(--gold)' : 'var(--muted)',
              fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.85rem', letterSpacing: '0.06em',
              whiteSpace: 'nowrap',
            }}>
              {locked && <span style={{ opacity: 0.5 }}><LockIcon /></span>}
              {r.label}
            </button>
          )
        })}
        <button onClick={() => { setActiveRound('CHAMPION'); setExpandedMatch(null) }} style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
          background: activeRound === 'CHAMPION' ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.03)',
          border: '1px solid ' + (activeRound === 'CHAMPION' ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.07)'),
          borderRadius: 7, padding: '7px 14px', cursor: 'pointer',
          color: activeRound === 'CHAMPION' ? 'var(--purple)' : 'var(--muted)',
          fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.85rem', letterSpacing: '0.06em',
          whiteSpace: 'nowrap',
        }}>
          <StarIcon /> Campeón
        </button>
      </div>

      {/* Locked notice */}
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
              <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--purple)' }}>Tu selección: {champion}</span>
              {champResult && champion === champResult && <span style={{ color: 'var(--green)', fontSize: '0.8rem', fontWeight: 600 }}>+10 pts</span>}
              {champResult && champion !== champResult && <span style={{ color: '#FF6B6B', fontSize: '0.8rem' }}>✗</span>}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 6 }}>
            {uniqueTeams.map(team => (
              <button key={team.name} onClick={() => saveChampion(team.name)} style={{
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
              {currentRound.matches.filter(m => preds[m.id]?.winner).length}/{currentRound.matches.length} predicciones
            </span>
          </div>

          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 6, padding: '0 2px' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase', textAlign: 'center' }}>Tu Predicción</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase', textAlign: 'center' }}>Resultado Real</div>
          </div>

          {currentRound.matches.map((match: KnockoutMatch) => {
            const pred = preds[match.id] || { home_team: '', away_team: '', home_score: '', away_score: '', winner: '' }
            const res = results[match.id]
            const pts = getPoints(match.id, pred)
            const pts_config = KNOCKOUT_PTS[match.round] || { exact: 2, winner: 1 }
            const isExpanded = expandedMatch === match.id

            return (
              <div key={match.id} style={{ marginBottom: 8 }}>
                {/* Match header */}
                <div style={{ background: 'rgba(10,10,16,0.8)', borderRadius: '10px 10px 0 0', padding: '6px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.06)', borderBottom: 'none', flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 700, fontFamily: "'Bebas Neue', sans-serif" }}>{match.label}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.65rem', color: 'var(--muted)' }}><PinIcon /> {match.stadium} · {match.city}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.65rem', color: 'var(--muted)' }}><CalIcon /> {match.date} · {match.time} ET</span>
                    <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)' }}>{match.homeDesc} vs {match.awayDesc}</span>
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
                  {/* PREDICTION */}
                  <div style={{ background: 'rgba(17,17,24,0.75)', border: '1px solid rgba(255,255,255,0.07)', borderRight: 'none', borderTop: 'none', borderRadius: '0 0 0 10px', padding: '14px 12px' }}>
                    <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
                      <select value={pred.home_team} onChange={e => updatePred(match.id, 'home_team', e.target.value)} onBlur={() => handleBlurPred(match.id)} disabled={roundLocked}
                        style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 8px', color: 'var(--text)', fontFamily: "'Outfit', sans-serif", fontSize: '0.78rem', outline: 'none', cursor: roundLocked ? 'not-allowed' : 'default' }}>
                        <option value="">Local...</option>
                        {uniqueTeams.map(t => <option key={t.name} value={t.name}>{t.flag} {t.name}</option>)}
                      </select>
                      <select value={pred.away_team} onChange={e => updatePred(match.id, 'away_team', e.target.value)} onBlur={() => handleBlurPred(match.id)} disabled={roundLocked}
                        style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 8px', color: 'var(--text)', fontFamily: "'Outfit', sans-serif", fontSize: '0.78rem', outline: 'none', cursor: roundLocked ? 'not-allowed' : 'default' }}>
                        <option value="">Visitante...</option>
                        {uniqueTeams.map(t => <option key={t.name} value={t.name}>{t.flag} {t.name}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="number" min={0} max={20} value={pred.home_score} onChange={e => updatePred(match.id, 'home_score', e.target.value)} onBlur={() => handleBlurPred(match.id)} placeholder="-" disabled={roundLocked}
                        style={{ width: 40, height: 38, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: 'var(--text)', outline: 'none' }} />
                      <span style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'Bebas Neue', sans-serif" }}>:</span>
                      <input type="number" min={0} max={20} value={pred.away_score} onChange={e => updatePred(match.id, 'away_score', e.target.value)} onBlur={() => handleBlurPred(match.id)} placeholder="-" disabled={roundLocked}
                        style={{ width: 40, height: 38, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: 'var(--text)', outline: 'none' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.6rem', color: 'var(--muted)', marginBottom: 2, letterSpacing: '0.1em' }}>AVANZA</div>
                        <select value={pred.winner} onChange={e => updatePred(match.id, 'winner', e.target.value)} onBlur={() => handleBlurPred(match.id)} disabled={roundLocked}
                          style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '5px 6px', color: 'var(--text)', fontFamily: "'Outfit', sans-serif", fontSize: '0.72rem', outline: 'none' }}>
                          <option value="">¿Quién?</option>
                          {pred.home_team && <option value={pred.home_team}>{pred.home_team}</option>}
                          {pred.away_team && <option value={pred.away_team}>{pred.away_team}</option>}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* RESULT */}
                  <div style={{ background: res?.home_team ? 'rgba(244,197,66,0.03)' : 'rgba(17,17,24,0.75)', border: '1px solid ' + (res?.home_team ? 'rgba(244,197,66,0.15)' : 'rgba(255,255,255,0.07)'), borderTop: 'none', borderRadius: '0 0 10px 0', padding: '14px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {res?.home_team ? (
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, flex: 1 }}>{uniqueTeams.find(t => t.name === res.home_team)?.flag} {res.home_team}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 32, height: 32, background: 'rgba(244,197,66,0.1)', border: '1px solid rgba(244,197,66,0.3)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', color: 'var(--gold)' }}>{res.home_score ?? '?'}</div>
                            <span style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.85rem' }}>:</span>
                            <div style={{ width: 32, height: 32, background: 'rgba(244,197,66,0.1)', border: '1px solid rgba(244,197,66,0.3)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', color: 'var(--gold)' }}>{res.away_score ?? '?'}</div>
                          </div>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, flex: 1, textAlign: 'right' }}>{res.away_team} {uniqueTeams.find(t => t.name === res.away_team)?.flag}</span>
                        </div>
                        {res.winner && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--green)', textAlign: 'center', background: 'rgba(46,204,113,0.06)', borderRadius: 5, padding: '3px 8px', border: '1px solid rgba(46,204,113,0.15)' }}>
                            Avanza: {uniqueTeams.find(t => t.name === res.winner)?.flag} {res.winner}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Sin resultado</div>
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
