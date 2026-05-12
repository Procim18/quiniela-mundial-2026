'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { GROUPS, getGroupMatches, isPastDeadline } from '@/lib/data'

type Prediction = { home_score: string; away_score: string }
type PredMap = Record<string, Prediction>
type ResultMap = Record<string, { home_score: number; away_score: number }>
type SavedMap = Record<string, boolean>

const LockIcon = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
const CheckIcon = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const ShareIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
const PinIcon = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
const ClockIcon = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const TrophyIcon = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>
const AlertIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>

export default function GruposPage() {
  const { player, loading } = useAuth()
  const router = useRouter()
  const [activeGroup, setActiveGroup] = useState('A')
  const [preds, setPreds] = useState<PredMap>({})
  const [results, setResults] = useState<ResultMap>({})
  const [saving, setSaving] = useState<SavedMap>({})
  const [saved, setSaved] = useState<SavedMap>({})
  const [miniRanking, setMiniRanking] = useState<{username: string; pts: number}[]>([])
  const [editing, setEditing] = useState<SavedMap>({})
  const [newResults, setNewResults] = useState<string[]>([])
  const prevResultsRef = useRef<Record<string, boolean>>({})
  const matches = getGroupMatches()
  const locked = isPastDeadline()
  const [hoursLeft, setHoursLeft] = useState(0)
  const [showDeadlineWarning, setShowDeadlineWarning] = useState(false)

  useEffect(() => {
    if (!loading && !player) router.push('/login')
  }, [player, loading])

  useEffect(() => {
    const update = () => {
      const diff = new Date('2026-06-11T14:00:00-04:00').getTime() - Date.now()
      const hours = diff / 3600000
      setHoursLeft(Math.max(0, Math.floor(hours)))
      setShowDeadlineWarning(hours > 0 && hours <= 24)
    }
    update()
    const t = setInterval(update, 60000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!player) return
    fetch('/api/leaderboard?t=' + Date.now(), { cache: 'no-store' })
      .then(r => r.json()).then(({ data }) => {
        if (data) setMiniRanking(data.slice(0, 5).map((p: any) => ({ username: p.username, pts: p.pts })))
      })
    fetch('/api/predictions?player_id=' + player.id)
      .then(r => r.json()).then(({ data }) => {
        const map: PredMap = {}
        ;(data || []).forEach((p: any) => {
          map[p.match_id] = {
            home_score: p.home_score !== null && p.home_score !== undefined ? String(p.home_score) : '',
            away_score: p.away_score !== null && p.away_score !== undefined ? String(p.away_score) : '',
          }
        })
        setPreds(map)
      })
    fetch('/api/results')
      .then(r => r.json()).then(({ data }) => {
        const map: ResultMap = {}
        ;(data || []).forEach((r: any) => {
          map[r.match_id] = r
          const prev = prevResultsRef.current
          const newOnes = Object.keys(map).filter(k => !prev[k] && map[k].home_score !== null)
          if (newOnes.length > 0 && Object.keys(prev).length > 0) {
            setNewResults(newOnes)
            setTimeout(() => setNewResults([]), 5000)
          }
          prevResultsRef.current = Object.fromEntries(Object.keys(map).map(k => [k, true]))
        })
        setResults(map)
      })
  }, [player])

  const savePred = useCallback(async (matchId: string, home: string, away: string) => {
    if (!player || locked) return
    setSaving(s => ({ ...s, [matchId]: true }))
    await fetch('/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: player.id, match_id: matchId, home_score: home === '' ? null : parseInt(home), away_score: away === '' ? null : parseInt(away) }),
    })
    setSaving(s => ({ ...s, [matchId]: false }))
    setSaved(s => ({ ...s, [matchId]: true }))
    setTimeout(() => setSaved(s => ({ ...s, [matchId]: false })), 2000)
  }, [player, locked])

  const updatePred = (matchId: string, side: 'home' | 'away', val: string) => {
    if (locked) return
    setEditing(e => ({ ...e, [matchId]: true }))
    const current = preds[matchId] || { home_score: '', away_score: '' }
    const updated = { ...current, [side === 'home' ? 'home_score' : 'away_score']: val }
    setPreds(p => ({ ...p, [matchId]: updated }))
  }

  const handleBlur = (matchId: string) => {
    const pred = preds[matchId]
    if (!pred) return
    savePred(matchId, pred.home_score, pred.away_score)
  }

  const getPoints = (matchId: string, pred: Prediction) => {
    const res = results[matchId]
    if (!res || pred.home_score === '' || pred.away_score === '') return null
    const ph = parseInt(pred.home_score), pa = parseInt(pred.away_score)
    const rh = res.home_score, ra = res.away_score
    if (ph === rh && pa === ra) return 3
    const po = ph > pa ? 'H' : pa > ph ? 'A' : 'D'
    const ro = rh > ra ? 'H' : ra > rh ? 'A' : 'D'
    return po === ro ? 1 : 0
  }

  const groupMatches = matches.filter(m => m.group === activeGroup)
  const completedByGroup: Record<string, number> = {}
  Object.keys(GROUPS).forEach(g => {
    const gMatches = matches.filter(m => m.group === g)
    completedByGroup[g] = gMatches.filter(m => {
      const p = preds[m.id]
      return p && p.home_score !== '' && p.away_score !== ''
    }).length
  })

  if (loading || !player) return null

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px 60px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: 'var(--text)', letterSpacing: '0.06em', lineHeight: 1 }}>
            Fase de Grupos
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: 4 }}>
            Hola <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{player.username}</span> · Cierra el 11 de junio de 2026
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {locked && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(214,40,40,0.1)', border: '1px solid rgba(214,40,40,0.25)', borderRadius: 6, padding: '5px 10px', fontSize: '0.75rem', color: '#FF6B6B' }}>
              <LockIcon /> Predicciones cerradas
            </div>
          )}
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '5px 10px', border: '1px solid rgba(255,255,255,0.07)' }}>
            {Object.values(completedByGroup).reduce((a, b) => a + b, 0)}/72 completadas
          </div>
        </div>
      </div>

      {/* Points legend */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { pts: '3 PTS', label: 'Resultado exacto', color: '#F4C542', bg: 'rgba(244,197,66,0.06)', border: 'rgba(244,197,66,0.15)' },
          { pts: '1 PT', label: 'Ganador / Empate', color: '#3B82F6', bg: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.15)' },
        ].map(p => (
          <div key={p.pts} style={{ display: 'flex', alignItems: 'center', gap: 6, background: p.bg, border: '1px solid ' + p.border, borderRadius: 6, padding: '4px 10px' }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.85rem', color: p.color }}>{p.pts}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{p.label}</span>
          </div>
        ))}
      </div>

      {/* Mini ranking */}
      {miniRanking.length > 0 && miniRanking.some(p => p.pts > 0) && (
        <div style={{ background: 'rgba(17,17,24,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '10px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em' }}>
            <TrophyIcon /> TOP 5
          </div>
          {miniRanking.map((p, i) => (
            <div key={p.username} style={{ display: 'flex', alignItems: 'center', gap: 5, background: p.username === player?.username ? 'rgba(244,197,66,0.1)' : 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '3px 8px', border: '1px solid ' + (p.username === player?.username ? 'rgba(244,197,66,0.2)' : 'rgba(255,255,255,0.06)') }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 600 }}>#{i + 1}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: p.username === player?.username ? 'var(--gold)' : 'var(--text)' }}>{p.username}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--gold)', fontFamily: "'Bebas Neue', sans-serif" }}>{p.pts}</span>
            </div>
          ))}
        </div>
      )}

      {/* Deadline warning */}
      {showDeadlineWarning && !locked && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(244,197,66,0.06)', border: '1px solid rgba(244,197,66,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--gold)' }}><AlertIcon /></span>
          <span style={{ color: 'var(--gold)', fontWeight: 600 }}>Cierra en {hoursLeft} horas</span>
          <span style={{ color: 'var(--muted)' }}>— Completa tus predicciones antes del 11 Jun · 14:00 ET</span>
        </div>
      )}

      {/* New result notification */}
      {newResults.length > 0 && (
        <div style={{ position: 'fixed', top: 70, right: 20, zIndex: 999, background: 'rgba(46,204,113,0.12)', border: '1px solid rgba(46,204,113,0.35)', borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, backdropFilter: 'blur(12px)' }}>
          <CheckIcon />
          <span style={{ color: 'var(--green)', fontSize: '0.82rem', fontWeight: 600 }}>Nuevo resultado disponible</span>
        </div>
      )}

      {/* Group tabs */}
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', marginBottom: 16, paddingBottom: 2, scrollbarWidth: 'none' }}>
        {Object.keys(GROUPS).map(g => {
          const done = completedByGroup[g] || 0
          const isActive = activeGroup === g
          return (
            <button key={g} onClick={() => setActiveGroup(g)} style={{
              flexShrink: 0, position: 'relative',
              background: isActive ? 'rgba(244,197,66,0.1)' : 'rgba(255,255,255,0.03)',
              border: '1px solid ' + (isActive ? 'rgba(244,197,66,0.4)' : 'rgba(255,255,255,0.07)'),
              borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
              color: isActive ? 'var(--gold)' : 'var(--muted)',
              fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', letterSpacing: '0.06em',
            }}>
              {g}
              <div style={{ fontSize: '0.55rem', color: done === 6 ? 'var(--green)' : 'var(--muted)', marginTop: 1 }}>{done}/6</div>
            </button>
          )
        })}
      </div>

      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 6, padding: '0 2px' }}>
        <div style={{ fontSize: '0.62rem', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase', textAlign: 'center' }}>Tu Predicción</div>
        <div style={{ fontSize: '0.62rem', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase', textAlign: 'center' }}>Resultado Real</div>
      </div>

      {/* Matches */}
      {groupMatches.map(match => {
        const pred = preds[match.id] || { home_score: '', away_score: '' }
        const res = results[match.id]
        const pts = getPoints(match.id, pred)
        const hasPred = pred.home_score !== '' && pred.away_score !== ''

        return (
          <div key={match.id} style={{ marginBottom: 8 }}>
            {/* Match header */}
            <div style={{ background: 'rgba(10,10,16,0.8)', borderRadius: '10px 10px 0 0', padding: '6px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.06)', borderBottom: 'none' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--gold)', fontWeight: 700, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.08em' }}>
                  {match.home.name} vs {match.away.name}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.62rem', color: 'var(--muted)' }}>
                  <PinIcon /> {match.stadium} · {match.city}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.62rem', color: 'var(--muted)' }}>
                  <ClockIcon /> {match.date} · {match.time} ET
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {saving[match.id] && <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>Guardando...</span>}
                {saved[match.id] && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.65rem', color: 'var(--green)' }}>
                    <CheckIcon /> Guardado
                  </div>
                )}
                {pts !== null && (
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.8rem', padding: '2px 8px', borderRadius: 4, background: pts === 3 ? 'rgba(244,197,66,0.12)' : pts === 1 ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.05)', color: pts === 3 ? 'var(--gold)' : pts === 1 ? 'var(--blue)' : 'var(--muted)', border: '1px solid ' + (pts === 3 ? 'rgba(244,197,66,0.25)' : pts === 1 ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.08)') }}>
                    {pts > 0 ? '+' + pts + ' pts' : '0 pts'}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              {/* Prediction side */}
              <div style={{ background: 'rgba(17,17,24,0.75)', border: '1px solid rgba(255,255,255,0.07)', borderRight: 'none', borderTop: 'none', borderRadius: '0 0 0 10px', padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{match.home.name}</span>
                      <span style={{ fontSize: '1.3rem' }}>{match.home.flag}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="number" min={0} max={20} value={pred.home_score}
                      onChange={e => updatePred(match.id, 'home', e.target.value)}
                      onBlur={() => handleBlur(match.id)}
                      disabled={locked}
                      placeholder="-"
                      style={{ width: 42, height: 42, background: locked ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)', border: '1px solid ' + (locked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.12)'), borderRadius: 6, textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: locked ? 'var(--muted)' : 'var(--text)', outline: 'none', cursor: locked ? 'not-allowed' : 'text' }} />
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem' }}>:</span>
                    <input type="number" min={0} max={20} value={pred.away_score}
                      onChange={e => updatePred(match.id, 'away', e.target.value)}
                      onBlur={() => handleBlur(match.id)}
                      disabled={locked}
                      placeholder="-"
                      style={{ width: 42, height: 42, background: locked ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)', border: '1px solid ' + (locked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.12)'), borderRadius: 6, textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: locked ? 'var(--muted)' : 'var(--text)', outline: 'none', cursor: locked ? 'not-allowed' : 'text' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '1.3rem' }}>{match.away.flag}</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{match.away.name}</span>
                    </div>
                  </div>
                </div>
                {hasPred && !locked && (
                  <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
                    <button onClick={() => {
                      const text = `Quiniela Mundial 2026\n${match.home.name} ${pred.home_score} - ${pred.away_score} ${match.away.name}\n${match.city} · ${match.time} ET\n\nhttps://quiniela-mundial-2026-zeta.vercel.app`
                      window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank')
                    }} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)', color: 'rgba(37,211,102,0.8)', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 600 }}>
                      <ShareIcon /> Compartir
                    </button>
                  </div>
                )}
              </div>

              {/* Result side */}
              <div style={{ background: res ? 'rgba(244,197,66,0.03)' : 'rgba(17,17,24,0.75)', border: '1px solid ' + (res ? 'rgba(244,197,66,0.15)' : 'rgba(255,255,255,0.07)'), borderTop: 'none', borderRadius: '0 0 10px 0', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {res && res.home_score !== null ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{match.home.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 40, height: 40, background: 'rgba(244,197,66,0.1)', border: '1px solid rgba(244,197,66,0.3)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: 'var(--gold)', fontWeight: 700 }}>{res.home_score}</div>
                      <span style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'Bebas Neue', sans-serif" }}>:</span>
                      <div style={{ width: 40, height: 40, background: 'rgba(244,197,66,0.1)', border: '1px solid rgba(244,197,66,0.3)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: 'var(--gold)', fontWeight: 700 }}>{res.away_score}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{match.away.name}</span>
                    </div>
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
  )
}
