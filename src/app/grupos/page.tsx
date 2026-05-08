'use client'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { GROUPS, getGroupMatches, isPastDeadline, DEADLINE } from '@/lib/data'

type Prediction = { home_score: string; away_score: string }
type PredMap = Record<string, Prediction>
type ResultMap = Record<string, { home_score: number; away_score: number }>
type SavedMap = Record<string, boolean>

export default function GruposPage() {
  const { player, loading } = useAuth()
  const router = useRouter()
  const [activeGroup, setActiveGroup] = useState('A')
  const [preds, setPreds] = useState<PredMap>({})
  const [results, setResults] = useState<ResultMap>({})
  const [saving, setSaving] = useState<SavedMap>({})
  const [saved, setSaved] = useState<SavedMap>({})
  const matches = getGroupMatches()
  const locked = isPastDeadline()

  useEffect(() => {
    if (!loading && !player) router.push('/login')
  }, [player, loading])

  useEffect(() => {
    if (!player) return
    fetch('/api/predictions?player_id=' + player.id)
      .then(r => r.json()).then(({ data }) => {
        const map: PredMap = {}
        ;(data || []).forEach((p: any) => {
          map[p.match_id] = { home_score: String(p.home_score ?? ''), away_score: String(p.away_score ?? '') }
        })
        setPreds(map)
      })
    fetch('/api/results')
      .then(r => r.json()).then(({ data }) => {
        const map: ResultMap = {}
        ;(data || []).forEach((r: any) => { map[r.match_id] = r })
        setResults(map)
      })
  }, [player])

  const savePred = useCallback(async (matchId: string, home: string, away: string) => {
    if (!player || locked) return
    setSaving(s => ({ ...s, [matchId]: true }))
    await fetch('/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: player.id, match_id: matchId, home_score: home, away_score: away }),
    })
    setSaving(s => ({ ...s, [matchId]: false }))
    setSaved(s => ({ ...s, [matchId]: true }))
    setTimeout(() => setSaved(s => ({ ...s, [matchId]: false })), 2000)
  }, [player, locked])

  const updatePred = (matchId: string, side: 'home' | 'away', val: string) => {
    if (locked) return
    const current = preds[matchId] || { home_score: '', away_score: '' }
    const updated = { ...current, [side === 'home' ? 'home_score' : 'away_score']: val }
    setPreds(p => ({ ...p, [matchId]: updated }))
    if (updated.home_score !== '' && updated.away_score !== '') {
      savePred(matchId, updated.home_score, updated.away_score)
    }
  }

  const getPoints = (matchId: string, pred: Prediction) => {
    const res = results[matchId]
    if (!res || pred.home_score === '' || pred.away_score === '') return null
    const ph = parseInt(pred.home_score), pa = parseInt(pred.away_score)
    const rh = res.home_score, ra = res.away_score
    if (ph === rh && pa === ra) return 3
    const predOut = ph > pa ? 'H' : pa > ph ? 'A' : 'D'
    const resOut = rh > ra ? 'H' : ra > rh ? 'A' : 'D'
    if (predOut === resOut) return 1
    return 0
  }

  if (loading || !player) return null

  const groupMatches = matches.filter(m => m.group === activeGroup)
  const groupProgress = Object.keys(GROUPS).reduce<Record<string, number>>((acc, g) => {
    const gMatches = matches.filter(m => m.group === g)
    acc[g] = gMatches.filter(m => { const p = preds[m.id]; return p && p.home_score !== '' && p.away_score !== '' }).length
    return acc
  }, {})
  const totalMatches = matches.length
  const totalDone = Object.values(groupProgress).reduce((a, b) => a + b, 0)
  const deadlineStr = DEADLINE.toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px 60px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: 'var(--gold)', letterSpacing: '0.06em' }}>
          Fase de Grupos
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 4 }}>
          Hola <strong style={{ color: 'var(--text)' }}>{player.username}</strong>
          {locked
            ? <span style={{ color: '#FF6B6B', marginLeft: 8 }}>Predicciones cerradas desde el {deadlineStr}</span>
            : <span style={{ color: 'var(--green)', marginLeft: 8 }}>Cierra el {deadlineStr}</span>
          }
        </p>
        {!locked && (
          <div style={{ marginTop: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 10, height: 6, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--gold), #FF0000)', borderRadius: 10, width: ((totalDone / totalMatches) * 100) + '%', transition: 'width 0.4s' }} />
          </div>
        )}
        <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 5 }}>{totalDone} de {totalMatches} predicciones completadas</p>
      </div>

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 20, paddingBottom: 4 }}>
        {Object.keys(GROUPS).map(g => {
          const done = groupProgress[g]
          const total = matches.filter(m => m.group === g).length
          return (
            <button key={g} onClick={() => setActiveGroup(g)} style={{
              flexShrink: 0,
              background: activeGroup === g ? 'rgba(244,197,66,0.15)' : 'rgba(17,17,24,0.8)',
              border: '1px solid ' + (activeGroup === g ? 'rgba(244,197,66,0.5)' : 'rgba(255,255,255,0.08)'),
              borderRadius: 10, padding: '8px 14px', cursor: 'pointer',
              color: activeGroup === g ? 'var(--gold)' : 'var(--muted)',
              fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', letterSpacing: '0.06em',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            }}>
              Grupo {g}
              <span style={{ fontSize: '0.58rem', color: done === total ? 'var(--green)' : 'var(--muted)' }}>
                {done === total ? 'listo' : done + '/' + total}
              </span>
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[{ pts: '3pts', label: 'Resultado exacto', c: 'var(--gold)' }, { pts: '1pt', label: 'Ganador/empate', c: 'var(--blue)' }].map(s => (
          <div key={s.pts} style={{ background: 'rgba(17,17,24,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '5px 12px', fontSize: '0.78rem', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ color: s.c, fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem' }}>{s.pts}</span>
            <span style={{ color: 'var(--muted)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8, padding: '0 4px' }}>
        <div style={{ fontSize: '0.68rem', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase', textAlign: 'center' }}>Tu Prediccion</div>
        <div style={{ fontSize: '0.68rem', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase', textAlign: 'center' }}>Resultado Real</div>
      </div>

      {groupMatches.map(match => {
        const pred = preds[match.id] || { home_score: '', away_score: '' }
        const res = results[match.id]
        const pts = getPoints(match.id, pred)
        const cardBorder = pts === 3 ? 'rgba(244,197,66,0.5)' : pts === 1 ? 'rgba(59,130,246,0.4)' : pts === 0 ? 'rgba(214,40,40,0.3)' : 'rgba(255,255,255,0.07)'

        return (
          <div key={match.id} style={{ marginBottom: 16 }}>
            <div style={{ background: 'rgba(17,17,24,0.85)', border: '1px solid rgba(255,255,255,0.06)', borderBottom: 'none', borderRadius: '12px 12px 0 0', padding: '7px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--gold)', fontWeight: 600 }}>{match.home.name} vs {match.away.name}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>📍 {match.stadium} · {match.city}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>🕐 {match.time} hs</span>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {saving[match.id] && <span style={{ color: 'var(--gold)', fontSize: '0.7rem' }}>Guardando...</span>}
                {saved[match.id] && <span style={{ color: 'var(--green)', fontSize: '0.7rem' }}>Guardado</span>}
                {pts !== null && (
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.85rem', padding: '2px 8px', borderRadius: 5, background: pts === 3 ? 'rgba(244,197,66,0.15)' : pts === 1 ? 'rgba(59,130,246,0.15)' : 'rgba(214,40,40,0.1)', color: pts === 3 ? 'var(--gold)' : pts === 1 ? 'var(--blue)' : 'var(--muted)', border: '1px solid ' + (pts === 3 ? 'rgba(244,197,66,0.3)' : pts === 1 ? 'rgba(59,130,246,0.3)' : 'rgba(214,40,40,0.2)') }}>
                    {pts === 3 ? '+3 pts' : pts === 1 ? '+1 pt' : '0 pts'}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              <div style={{ background: pts !== null ? (pts === 3 ? 'rgba(244,197,66,0.05)' : pts === 1 ? 'rgba(59,130,246,0.05)' : 'rgba(214,40,40,0.04)') : 'rgba(17,17,24,0.75)', border: '1px solid ' + cardBorder, borderRight: 'none', borderTop: 'none', borderRadius: '0 0 0 12px', padding: '12px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{match.home.flag}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.72rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{match.home.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                    <input type="number" min={0} max={20} value={pred.home_score} onChange={e => updatePred(match.id, 'home', e.target.value)} disabled={locked}
                      style={{ width: 34, height: 34, background: locked ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)', border: '1px solid ' + (locked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.12)'), borderRadius: 8, textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: locked ? 'var(--muted)' : 'var(--text)', outline: 'none', cursor: locked ? 'not-allowed' : 'text' }} />
                    <span style={{ color: 'var(--muted)', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.8rem' }}>-</span>
                    <input type="number" min={0} max={20} value={pred.away_score} onChange={e => updatePred(match.id, 'away', e.target.value)} disabled={locked}
                      style={{ width: 34, height: 34, background: locked ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)', border: '1px solid ' + (locked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.12)'), borderRadius: 8, textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: locked ? 'var(--muted)' : 'var(--text)', outline: 'none', cursor: locked ? 'not-allowed' : 'text' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1, minWidth: 0, justifyContent: 'flex-end' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.72rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>{match.away.name}</span>
                    <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{match.away.flag}</span>
                  </div>
                </div>
              </div>

              <div style={{ background: res ? 'rgba(244,197,66,0.05)' : 'rgba(17,17,24,0.75)', border: '1px solid ' + (res ? 'rgba(244,197,66,0.2)' : 'rgba(255,255,255,0.07)'), borderTop: 'none', borderRadius: '0 0 12px 0', padding: '12px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {res ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{match.home.flag}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.72rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{match.home.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                      <div style={{ width: 34, height: 34, background: 'rgba(244,197,66,0.12)', border: '1px solid rgba(244,197,66,0.35)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: 'var(--gold)' }}>{res.home_score}</div>
                      <span style={{ color: 'var(--muted)', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.8rem' }}>-</span>
                      <div style={{ width: 34, height: 34, background: 'rgba(244,197,66,0.12)', border: '1px solid rgba(244,197,66,0.35)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: 'var(--gold)' }}>{res.away_score}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1, minWidth: 0, justifyContent: 'flex-end' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.72rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>{match.away.name}</span>
                      <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{match.away.flag}</span>
                    </div>
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
  )
}
