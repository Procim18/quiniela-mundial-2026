'use client'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { KNOCKOUT_ROUNDS, KNOCKOUT_POINTS, ALL_TEAMS } from '@/lib/data'

type KnockPred = { home_team: string; away_team: string; home_score: string; away_score: string; winner: string }
type KnockPredMap = Record<string, KnockPred>
type KnockResultMap = Record<string, any>

export default function EliminatoriasPage() {
  const { player, loading } = useAuth()
  const router = useRouter()
  const [preds, setPreds] = useState<KnockPredMap>({})
  const [results, setResults] = useState<KnockResultMap>({})
  const [champion, setChampion] = useState('')
  const [champResult, setChampResult] = useState('')
  const [activeRound, setActiveRound] = useState('R16')
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!loading && !player) router.push('/login')
  }, [player, loading])

  useEffect(() => {
    if (!player) return
    fetch(`/api/predictions/knockout?player_id=${player.id}`)
      .then(r => r.json()).then(({ data }) => {
        const map: KnockPredMap = {}
        ;(data || []).forEach((p: any) => { map[p.match_id] = { home_team: p.home_team || '', away_team: p.away_team || '', home_score: String(p.home_score ?? ''), away_score: String(p.away_score ?? ''), winner: p.winner || '' } })
        setPreds(map)
      })
    fetch('/api/results/knockout')
      .then(r => r.json()).then(({ data }) => {
        const map: KnockResultMap = {}
        ;(data || []).forEach((r: any) => { map[r.match_id] = r })
        setResults(map)
      })
    fetch(`/api/predictions/champion?player_id=${player.id}`)
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
    await fetch('/api/predictions/knockout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: player.id, match_id: matchId, ...pred }),
    })
    setSaving(s => ({ ...s, [matchId]: false }))
    setSaved(s => ({ ...s, [matchId]: true }))
    setTimeout(() => setSaved(s => ({ ...s, [matchId]: false })), 2000)
  }, [player])

  const updatePred = (matchId: string, field: keyof KnockPred, val: string) => {
    const current = preds[matchId] || { home_team: '', away_team: '', home_score: '', away_score: '', winner: '' }
    const updated = { ...current, [field]: val }
    setPreds(p => ({ ...p, [matchId]: updated }))
    savePred(matchId, updated)
  }

  const saveChampion = async (team: string) => {
    if (!player || !team) return
    setChampion(team)
    await fetch('/api/predictions/champion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: player.id, team }),
    })
  }

  const getPoints = (matchId: string, pred: KnockPred) => {
    const res = results[matchId]
    if (!res || !pred.winner) return null
    const round = matchId.split('_')[0]
    const rpts = KNOCKOUT_POINTS[round] || { exact: 3, winner: 1 }
    const predWinner = pred.winner
    const realWinner = res.winner
    if (!realWinner) return null
    if (pred.home_score !== '' && pred.away_score !== '' && parseInt(pred.home_score) === res.home_score && parseInt(pred.away_score) === res.away_score && pred.home_team === res.home_team) {
      return rpts.exact
    }
    if (predWinner === realWinner) return rpts.winner
    return 0
  }

  if (loading || !player) return null

  const currentRound = KNOCKOUT_ROUNDS.find(r => r.id === activeRound)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 60px' }}>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.2rem', color: 'var(--gold)', letterSpacing: '0.06em' }}>
          🏆 Eliminatorias
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 4 }}>
          Predice los ganadores de cada ronda. Los equipos se actualizarán conforme avance el torneo.
        </p>
      </div>

      {/* Points reminder for knockouts */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {KNOCKOUT_ROUNDS.map(r => {
          const pts = KNOCKOUT_POINTS[r.id]
          return (
            <div key={r.id} style={{ background: 'var(--dark3)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', fontSize: '0.78rem' }}>
              <span style={{ color: 'var(--muted)' }}>{r.label}: </span>
              <span style={{ color: 'var(--gold)' }}>{pts?.exact ?? '?'}pts</span>
              <span style={{ color: 'var(--muted)' }}> exacto / </span>
              <span style={{ color: 'var(--blue)' }}>{pts?.winner ?? '?'}pts</span>
              <span style={{ color: 'var(--muted)' }}> ganador</span>
            </div>
          )
        })}
      </div>

      {/* Round tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 24, paddingBottom: 4 }}>
        {KNOCKOUT_ROUNDS.map(r => (
          <button key={r.id} onClick={() => setActiveRound(r.id)} style={{
            flexShrink: 0,
            background: activeRound === r.id ? 'rgba(244,197,66,0.12)' : 'var(--dark3)',
            border: `1px solid ${activeRound === r.id ? 'rgba(244,197,66,0.4)' : 'var(--border)'}`,
            borderRadius: 10, padding: '8px 16px', cursor: 'pointer',
            color: activeRound === r.id ? 'var(--gold)' : 'var(--muted)',
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.9rem', letterSpacing: '0.06em',
            whiteSpace: 'nowrap',
          }}>
            {r.label}
          </button>
        ))}
        <button onClick={() => setActiveRound('CHAMPION')} style={{
          flexShrink: 0,
          background: activeRound === 'CHAMPION' ? 'rgba(139,92,246,0.15)' : 'var(--dark3)',
          border: `1px solid ${activeRound === 'CHAMPION' ? 'rgba(139,92,246,0.4)' : 'var(--border)'}`,
          borderRadius: 10, padding: '8px 16px', cursor: 'pointer',
          color: activeRound === 'CHAMPION' ? 'var(--purple)' : 'var(--muted)',
          fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.9rem', letterSpacing: '0.06em',
          whiteSpace: 'nowrap',
        }}>
          🏆 Campeón
        </button>
      </div>

      {/* Champion section */}
      {activeRound === 'CHAMPION' && (
        <div>
          <div style={{ background: 'var(--dark3)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 16, padding: 28, marginBottom: 20 }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', color: 'var(--purple)', marginBottom: 8 }}>
              🏆 ¿Quién será el Campeón del Mundial?
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 20 }}>
              Acertar el campeón vale <strong style={{ color: 'var(--purple)' }}>10 puntos</strong>. Solo puedes elegir uno.
            </p>
            {champion && (
              <div style={{ marginBottom: 16, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 10, padding: '10px 16px', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: 'var(--purple)', fontWeight: 600 }}>Tu selección: {champion}</span>
                {champResult && champion === champResult && <span style={{ color: 'var(--green)' }}>🎉 +10 pts</span>}
                {champResult && champion !== champResult && <span style={{ color: '#FF6B6B' }}>✗</span>}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
              {ALL_TEAMS.filter((t, i, arr) => arr.findIndex(x => x.name === t.name) === i).map(team => (
                <button key={team.name} onClick={() => saveChampion(team.name)} style={{
                  background: champion === team.name ? 'rgba(139,92,246,0.15)' : 'var(--dark4)',
                  border: `1px solid ${champion === team.name ? 'rgba(139,92,246,0.5)' : 'var(--border2)'}`,
                  borderRadius: 10, padding: '10px 14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                  color: champion === team.name ? 'var(--purple)' : 'var(--text)',
                  transition: 'all 0.15s',
                }}>
                  <span style={{ fontSize: '1.3rem' }}>{team.flag}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{team.name}</span>
                  {champion === team.name && <span style={{ marginLeft: 'auto' }}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Knockout matches */}
      {activeRound !== 'CHAMPION' && currentRound && (
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', color: 'var(--text)', marginBottom: 16, letterSpacing: '0.04em' }}>
            {currentRound.label}
          </h2>
          {currentRound.matches.map(match => {
            const pred = preds[match.id] || { home_team: '', away_team: '', home_score: '', away_score: '', winner: '' }
            const res = results[match.id]
            const pts = getPoints(match.id, pred)
            const roundPts = KNOCKOUT_POINTS[currentRound.id]
            return (
              <div key={match.id} style={{ background: 'var(--dark3)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', marginBottom: 12 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{currentRound.label} · {match.label}</span>
                  {saving[match.id] && <span style={{ color: 'var(--gold)' }}>Guardando...</span>}
                  {saved[match.id] && <span style={{ color: 'var(--green)' }}>✓ Guardado</span>}
                  {pts !== null && (
                    <span style={{
                      color: pts >= (roundPts?.exact || 3) ? 'var(--gold)' : pts > 0 ? 'var(--blue)' : 'var(--muted)',
                      background: pts >= (roundPts?.exact || 3) ? 'rgba(244,197,66,0.1)' : pts > 0 ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.05)',
                      border: '1px solid currentColor', borderRadius: 6, padding: '2px 8px',
                    }}>
                      {pts > 0 ? `+${pts}` : '0'} pts {pts === 0 ? '✗' : '✓'}
                    </span>
                  )}
                </div>

                {/* Team selectors */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                  <select
                    value={pred.home_team}
                    onChange={e => updatePred(match.id, 'home_team', e.target.value)}
                    style={{ background: 'var(--dark4)', border: '1px solid var(--border2)', borderRadius: 8, padding: '8px 10px', color: 'var(--text)', fontFamily: "'Outfit', sans-serif", fontSize: '0.85rem', outline: 'none' }}
                  >
                    <option value="">Equipo local...</option>
                    {ALL_TEAMS.filter((t, i, arr) => arr.findIndex(x => x.name === t.name) === i).map(t => <option key={t.name} value={t.name}>{t.flag} {t.name}</option>)}
                  </select>
                  <span style={{ color: 'var(--muted)', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem' }}>VS</span>
                  <select
                    value={pred.away_team}
                    onChange={e => updatePred(match.id, 'away_team', e.target.value)}
                    style={{ background: 'var(--dark4)', border: '1px solid var(--border2)', borderRadius: 8, padding: '8px 10px', color: 'var(--text)', fontFamily: "'Outfit', sans-serif", fontSize: '0.85rem', outline: 'none' }}
                  >
                    <option value="">Equipo visitante...</option>
                    {ALL_TEAMS.filter((t, i, arr) => arr.findIndex(x => x.name === t.name) === i).map(t => <option key={t.name} value={t.name}>{t.flag} {t.name}</option>)}
                  </select>
                </div>

                {/* Score + winner */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="number" min={0} max={20} value={pred.home_score} onChange={e => updatePred(match.id, 'home_score', e.target.value)}
                      placeholder="0"
                      style={{ width: 44, height: 44, background: 'var(--dark4)', border: '1px solid var(--border2)', borderRadius: 10, textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: 'var(--text)', outline: 'none' }}
                    />
                    <span style={{ color: 'var(--muted)', fontFamily: "'Bebas Neue', sans-serif" }}>-</span>
                    <input type="number" min={0} max={20} value={pred.away_score} onChange={e => updatePred(match.id, 'away_score', e.target.value)}
                      placeholder="0"
                      style={{ width: 44, height: 44, background: 'var(--dark4)', border: '1px solid var(--border2)', borderRadius: 10, textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: 'var(--text)', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>GANADOR (si hay penales)</span>
                    <select value={pred.winner} onChange={e => updatePred(match.id, 'winner', e.target.value)}
                      style={{ background: 'var(--dark4)', border: '1px solid var(--border2)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontFamily: "'Outfit', sans-serif", fontSize: '0.85rem', outline: 'none' }}
                    >
                      <option value="">Selecciona quien avanza</option>
                      {pred.home_team && <option value={pred.home_team}>{pred.home_team}</option>}
                      {pred.away_team && <option value={pred.away_team}>{pred.away_team}</option>}
                    </select>
                  </div>
                  {res && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)', background: 'var(--dark4)', borderRadius: 8, padding: '6px 12px' }}>
                      Real: {res.home_team} {res.home_score}-{res.away_score} {res.away_team} · Avanza: <strong style={{ color: 'var(--text)' }}>{res.winner}</strong>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
