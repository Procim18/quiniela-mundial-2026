'use client'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { ALL_KNOCKOUT_ROUNDS, KNOCKOUT_PTS, KnockoutMatch } from '@/lib/knockout'
import { GROUPS, getGroupMatches } from '@/lib/data'
import { ALL_TEAMS } from '@/lib/data'

type KnockPred = { home_team: string; away_team: string; home_score: string; away_score: string; winner: string }
type KnockResult = { home_team: string; away_team: string; home_score: number | null; away_score: number | null; winner: string }
type PredMap = Record<string, KnockPred>
type ResultMap = Record<string, KnockResult>

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
            home_team: p.home_team || '',
            away_team: p.away_team || '',
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
      .then(r => r.json()).then(({ data }) => {
        if (data?.[0]) setChampion(data[0].team)
      })
    fetch('/api/results/champion')
      .then(r => r.json()).then(({ data }) => {
        if (data?.team) setChampResult(data.team)
      })
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
    const predH = parseInt(pred.home_score)
    const predA = parseInt(pred.away_score)
    if (pred.home_team === res.home_team && pred.away_team === res.away_team &&
        !isNaN(predH) && !isNaN(predA) &&
        predH === res.home_score && predA === res.away_score &&
        pred.winner === res.winner) {
      return pts.exact
    }
    if (pred.winner === res.winner) return pts.winner
    return 0
  }

  const uniqueTeams = ALL_TEAMS.filter((t, i, arr) => arr.findIndex(x => x.name === t.name) === i)

  if (loading || !player) return null

  const currentRound = ALL_KNOCKOUT_ROUNDS.find(r => r.id === activeRound)

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px 60px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: 'var(--gold)', letterSpacing: '0.06em' }}>
          Eliminatorias
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 4 }}>
          Predice los ganadores de cada ronda. Las predicciones se guardan al salir del campo.
        </p>
      </div>

      {/* Points per round */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {ALL_KNOCKOUT_ROUNDS.map(r => {
          const pts = KNOCKOUT_PTS[r.id]
          return (
            <div key={r.id} style={{ background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '5px 12px', fontSize: '0.75rem', backdropFilter: 'blur(8px)' }}>
              <span style={{ color: 'var(--muted)' }}>{r.label}: </span>
              <span style={{ color: 'var(--gold)' }}>{pts?.exact}pts</span>
              <span style={{ color: 'var(--muted)' }}> / </span>
              <span style={{ color: 'var(--blue)' }}>{pts?.winner}pt ganador</span>
            </div>
          )
        })}
      </div>

      {/* Round tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 24, paddingBottom: 4 }}>
        {ALL_KNOCKOUT_ROUNDS.map(r => (
          <button key={r.id} onClick={() => setActiveRound(r.id)} style={{
            flexShrink: 0,
            background: activeRound === r.id ? 'rgba(244,197,66,0.15)' : 'rgba(17,17,24,0.8)',
            border: '1px solid ' + (activeRound === r.id ? 'rgba(244,197,66,0.5)' : 'rgba(255,255,255,0.08)'),
            borderRadius: 10, padding: '8px 14px', cursor: 'pointer',
            color: activeRound === r.id ? 'var(--gold)' : 'var(--muted)',
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.95rem', letterSpacing: '0.06em',
            whiteSpace: 'nowrap', backdropFilter: 'blur(8px)',
          }}>
            {r.label}
          </button>
        ))}
        <button onClick={() => setActiveRound('CHAMPION')} style={{
          flexShrink: 0,
          background: activeRound === 'CHAMPION' ? 'rgba(139,92,246,0.15)' : 'rgba(17,17,24,0.8)',
          border: '1px solid ' + (activeRound === 'CHAMPION' ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)'),
          borderRadius: 10, padding: '8px 14px', cursor: 'pointer',
          color: activeRound === 'CHAMPION' ? 'var(--purple)' : 'var(--muted)',
          fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.95rem', letterSpacing: '0.06em',
          whiteSpace: 'nowrap', backdropFilter: 'blur(8px)',
        }}>
          👑 Campeon
        </button>
      </div>

      {/* CHAMPION */}
      {activeRound === 'CHAMPION' && (
        <div style={{ background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 16, padding: 28, backdropFilter: 'blur(12px)' }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', color: 'var(--purple)', marginBottom: 8 }}>
            Quien sera el Campeon del Mundial?
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 20 }}>
            Acertar el campeon vale <strong style={{ color: 'var(--purple)' }}>10 puntos</strong>.
          </p>
          {champion && (
            <div style={{ marginBottom: 16, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 10, padding: '10px 16px', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: 'var(--purple)', fontWeight: 600 }}>Tu seleccion: {champion}</span>
              {champResult && champion === champResult && <span style={{ color: 'var(--green)' }}>+10 pts</span>}
              {champResult && champion !== champResult && <span style={{ color: '#FF6B6B' }}>X</span>}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
            {uniqueTeams.map(team => (
              <button key={team.name} onClick={() => saveChampion(team.name)} style={{
                background: champion === team.name ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
                border: '1px solid ' + (champion === team.name ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)'),
                borderRadius: 10, padding: '10px 14px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                color: champion === team.name ? 'var(--purple)' : 'var(--text)',
              }}>
                <span style={{ fontSize: '1.2rem' }}>{team.flag}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{team.name}</span>
                {champion === team.name && <span style={{ marginLeft: 'auto' }}>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* KNOCKOUT MATCHES */}
      {activeRound !== 'CHAMPION' && currentRound && (
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: 'var(--text)', marginBottom: 6, letterSpacing: '0.04em' }}>
            {currentRound.label}
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: 20 }}>
            {activeRound === 'R32' ? '28 Jun – 3 Jul · Los equipos se asignan al terminar la fase de grupos' :
             activeRound === 'R16' ? '4–7 Jul · Octavos de Final' :
             activeRound === 'QF' ? '9–11 Jul · Cuartos de Final' :
             activeRound === 'SF' ? '14–15 Jul · Semifinales' :
             activeRound === 'TP' ? '18 Jul · Tercer Puesto' : '19 Jul · Gran Final · MetLife Stadium'}
          </p>

          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8, padding: '0 4px' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase', textAlign: 'center' }}>Tu Prediccion</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase', textAlign: 'center' }}>Resultado Real</div>
          </div>

          {currentRound.matches.map((match: KnockoutMatch) => {
            const pred = preds[match.id] || { home_team: '', away_team: '', home_score: '', away_score: '', winner: '' }
            const res = results[match.id]
            const pts = getPoints(match.id, pred)
            const pts_config = KNOCKOUT_PTS[match.round] || { exact: 2, winner: 1 }

            return (
              <div key={match.id} style={{ marginBottom: 16 }}>
                {/* Match info bar */}
                <div style={{ background: 'rgba(17,17,24,0.85)', border: '1px solid rgba(255,255,255,0.06)', borderBottom: 'none', borderRadius: '12px 12px 0 0', padding: '7px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 600 }}>{match.label}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>📍 {match.stadium} · {match.city}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>📅 {match.date} · {match.time} ET</span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--muted)', opacity: 0.7 }}>{match.homeDesc} vs {match.awayDesc}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {saving[match.id] && <span style={{ color: 'var(--gold)', fontSize: '0.7rem' }}>Guardando...</span>}
                    {saved[match.id] && <span style={{ color: 'var(--green)', fontSize: '0.7rem' }}>Guardado</span>}
                    {pts !== null && (
                      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.85rem', padding: '2px 8px', borderRadius: 5, background: pts >= pts_config.exact ? 'rgba(244,197,66,0.15)' : pts > 0 ? 'rgba(59,130,246,0.15)' : 'rgba(214,40,40,0.1)', color: pts >= pts_config.exact ? 'var(--gold)' : pts > 0 ? 'var(--blue)' : 'var(--muted)', border: '1px solid ' + (pts >= pts_config.exact ? 'rgba(244,197,66,0.3)' : pts > 0 ? 'rgba(59,130,246,0.3)' : 'rgba(214,40,40,0.2)') }}>
                        {pts > 0 ? '+' + pts + ' pts' : '0 pts'}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                  {/* PREDICCION */}
                  <div style={{ background: 'rgba(17,17,24,0.75)', border: '1px solid rgba(255,255,255,0.07)', borderRight: 'none', borderTop: 'none', borderRadius: '0 0 0 12px', padding: '14px 12px' }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                      <select value={pred.home_team} onChange={e => updatePred(match.id, 'home_team', e.target.value)} onBlur={() => handleBlurPred(match.id)}
                        style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 8px', color: 'var(--text)', fontFamily: "'Outfit', sans-serif", fontSize: '0.78rem', outline: 'none' }}>
                        <option value="">Local...</option>
                        {uniqueTeams.map(t => <option key={t.name} value={t.name}>{t.flag} {t.name}</option>)}
                      </select>
                      <select value={pred.away_team} onChange={e => updatePred(match.id, 'away_team', e.target.value)} onBlur={() => handleBlurPred(match.id)}
                        style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 8px', color: 'var(--text)', fontFamily: "'Outfit', sans-serif", fontSize: '0.78rem', outline: 'none' }}>
                        <option value="">Visitante...</option>
                        {uniqueTeams.map(t => <option key={t.name} value={t.name}>{t.flag} {t.name}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="number" min={0} max={20} value={pred.home_score} onChange={e => updatePred(match.id, 'home_score', e.target.value)} onBlur={() => handleBlurPred(match.id)} placeholder="0"
                        style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: 'var(--text)', outline: 'none' }} />
                      <span style={{ color: 'var(--muted)', fontFamily: "'Bebas Neue', sans-serif" }}>-</span>
                      <input type="number" min={0} max={20} value={pred.away_score} onChange={e => updatePred(match.id, 'away_score', e.target.value)} onBlur={() => handleBlurPred(match.id)} placeholder="0"
                        style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: 'var(--text)', outline: 'none' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: 3 }}>Avanza:</div>
                        <select value={pred.winner} onChange={e => updatePred(match.id, 'winner', e.target.value)} onBlur={() => handleBlurPred(match.id)}
                          style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '4px 6px', color: 'var(--text)', fontFamily: "'Outfit', sans-serif", fontSize: '0.75rem', outline: 'none' }}>
                          <option value="">Quien avanza?</option>
                          {pred.home_team && <option value={pred.home_team}>{pred.home_team}</option>}
                          {pred.away_team && <option value={pred.away_team}>{pred.away_team}</option>}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* RESULTADO REAL */}
                  <div style={{ background: res ? 'rgba(244,197,66,0.04)' : 'rgba(17,17,24,0.75)', border: '1px solid ' + (res ? 'rgba(244,197,66,0.2)' : 'rgba(255,255,255,0.07)'), borderTop: 'none', borderRadius: '0 0 12px 0', padding: '14px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {res && res.home_team ? (
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, flex: 1 }}>{uniqueTeams.find(t => t.name === res.home_team)?.flag} {res.home_team}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 32, height: 32, background: 'rgba(244,197,66,0.12)', border: '1px solid rgba(244,197,66,0.35)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', color: 'var(--gold)' }}>{res.home_score ?? '?'}</div>
                            <span style={{ color: 'var(--muted)', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.8rem' }}>-</span>
                            <div style={{ width: 32, height: 32, background: 'rgba(244,197,66,0.12)', border: '1px solid rgba(244,197,66,0.35)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', color: 'var(--gold)' }}>{res.away_score ?? '?'}</div>
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, flex: 1, textAlign: 'right' }}>{uniqueTeams.find(t => t.name === res.away_team)?.flag} {res.away_team}</span>
                        </div>
                        {res.winner && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--green)', textAlign: 'center', background: 'rgba(46,204,113,0.08)', borderRadius: 6, padding: '3px 8px' }}>
                            Avanza: {uniqueTeams.find(t => t.name === res.winner)?.flag} {res.winner}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '1.1rem', display: 'block', marginBottom: 2 }}>⏳</span>
                        <span style={{ color: 'var(--muted)', fontSize: '0.68rem' }}>Sin resultado</span>
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
