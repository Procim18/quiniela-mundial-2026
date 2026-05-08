'use client'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { GROUPS, getGroupMatches, GroupMatch } from '@/lib/data'
import MatchCard from '@/components/MatchCard'
import Link from 'next/link'

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

  useEffect(() => {
    if (!loading && !player) router.push('/login')
  }, [player, loading])

  useEffect(() => {
    if (!player) return
    // Load predictions
    fetch(`/api/predictions?player_id=${player.id}`)
      .then(r => r.json()).then(({ data }) => {
        const map: PredMap = {}
        ;(data || []).forEach((p: any) => {
          map[p.match_id] = { home_score: String(p.home_score ?? ''), away_score: String(p.away_score ?? '') }
        })
        setPreds(map)
      })
    // Load results
    fetch('/api/results')
      .then(r => r.json()).then(({ data }) => {
        const map: ResultMap = {}
        ;(data || []).forEach((r: any) => { map[r.match_id] = r })
        setResults(map)
      })
  }, [player])

  const savePred = useCallback(async (matchId: string, home: string, away: string) => {
    if (!player) return
    setSaving(s => ({ ...s, [matchId]: true }))
    setSaved(s => ({ ...s, [matchId]: false }))
    await fetch('/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: player.id, match_id: matchId, home_score: home, away_score: away }),
    })
    setSaving(s => ({ ...s, [matchId]: false }))
    setSaved(s => ({ ...s, [matchId]: true }))
    setTimeout(() => setSaved(s => ({ ...s, [matchId]: false })), 2000)
  }, [player])

  const updatePred = (matchId: string, side: 'home' | 'away', val: string) => {
    const current = preds[matchId] || { home_score: '', away_score: '' }
    const updated = { ...current, [side === 'home' ? 'home_score' : 'away_score']: val }
    setPreds(p => ({ ...p, [matchId]: updated }))
    if (updated.home_score !== '' && updated.away_score !== '') {
      savePred(matchId, updated.home_score, updated.away_score)
    }
  }

  const getMatchResult = (matchId: string) => results[matchId]
  const getPoints = (matchId: string, pred: Prediction) => {
    const res = getMatchResult(matchId)
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
    const done = gMatches.filter(m => {
      const p = preds[m.id]
      return p && p.home_score !== '' && p.away_score !== ''
    }).length
    acc[g] = done
    return acc
  }, {})

  const totalMatches = matches.length
  const totalDone = Object.values(groupProgress).reduce((a, b) => a + b, 0)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 60px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.2rem', color: 'var(--gold)', letterSpacing: '0.06em' }}>
          ⚽ Fase de Grupos
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 4 }}>
          Hola <strong style={{ color: 'var(--text)' }}>{player.username}</strong> — Tus predicciones se guardan automáticamente
        </p>
        <div style={{ marginTop: 12, background: 'var(--dark3)', borderRadius: 10, height: 8, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--gold), var(--gold-dark))', borderRadius: 10, width: `${(totalDone/totalMatches)*100}%`, transition: 'width 0.4s' }} />
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 6 }}>
          {totalDone} de {totalMatches} predicciones completadas
        </p>
      </div>

      {/* Group tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 24, paddingBottom: 4 }}>
        {Object.keys(GROUPS).map(g => {
          const done = groupProgress[g]
          const total = matches.filter(m => m.group === g).length
          const complete = done === total
          return (
            <button key={g} onClick={() => setActiveGroup(g)} style={{
              flexShrink: 0, background: activeGroup === g ? 'rgba(244,197,66,0.12)' : 'var(--dark3)',
              border: `1px solid ${activeGroup === g ? 'rgba(244,197,66,0.4)' : 'var(--border)'}`,
              borderRadius: 10, padding: '8px 16px', cursor: 'pointer',
              color: activeGroup === g ? 'var(--gold)' : 'var(--muted)',
              fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', letterSpacing: '0.06em',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            }}>
              Grupo {g}
              <span style={{ fontSize: '0.6rem', color: complete ? 'var(--green)' : 'var(--muted)' }}>
                {complete ? '✓' : `${done}/${total}`}
              </span>
            </button>
          )
        })}
      </div>

      {/* Scoring reminder */}
      <div style={{
        display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap',
      }}>
        {[{pts:'3pts',label:'Resultado exacto',c:'var(--gold)'},{pts:'1pt',label:'Aciertas el ganador/empate',c:'var(--blue)'}].map(s => (
          <div key={s.pts} style={{ background: 'var(--dark3)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', fontSize: '0.8rem', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ color: s.c, fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem' }}>{s.pts}</span>
            <span style={{ color: 'var(--muted)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Matches */}
      {groupMatches.map(match => {
        const pred = preds[match.id] || { home_score: '', away_score: '' }
        const pts = getPoints(match.id, pred)
        const res = getMatchResult(match.id)
        return (
          <div key={match.id} style={{ position: 'relative' }}>
            {pts !== null && (
              <div style={{
                position: 'absolute', top: 12, right: 12, zIndex: 2,
                fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem',
                background: pts === 3 ? 'rgba(244,197,66,0.15)' : pts === 1 ? 'rgba(59,130,246,0.15)' : 'rgba(214,40,40,0.12)',
                color: pts === 3 ? 'var(--gold)' : pts === 1 ? 'var(--blue)' : 'var(--muted)',
                border: `1px solid ${pts === 3 ? 'rgba(244,197,66,0.3)' : pts === 1 ? 'rgba(59,130,246,0.3)' : 'rgba(214,40,40,0.2)'}`,
                borderRadius: 8, padding: '2px 10px',
              }}>
                {pts === 3 ? '+3 🎯' : pts === 1 ? '+1 ✓' : '0 ✗'}&nbsp;
                {res && <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Real: {res.home_score}-{res.away_score}</span>}
              </div>
            )}
            <MatchCard
              matchId={match.id}
              homeFlag={match.home.flag}
              homeName={match.home.name}
              awayFlag={match.away.flag}
              awayName={match.away.name}
              group={match.group}
              label={`${match.home.name} vs ${match.away.name}`}
              homeScore={pred.home_score}
              awayScore={pred.away_score}
              onHomeChange={v => updatePred(match.id, 'home', v)}
              onAwayChange={v => updatePred(match.id, 'away', v)}
              saving={saving[match.id]}
              saved={saved[match.id]}
            />
          </div>
        )
      })}
    </div>
  )
}
