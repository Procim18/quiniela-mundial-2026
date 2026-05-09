'use client'
import { useState, useEffect, useCallback } from 'react'
import { ALL_KNOCKOUT_ROUNDS, KnockoutMatch } from '@/lib/knockout'
import { ALL_TEAMS } from '@/lib/data'

interface Props {
  adminPass: string
}

type ResultMap = Record<string, any>

export default function KnockoutPanel({ adminPass }: Props) {
  const [activeRound, setActiveRound] = useState('R32')
  const [results, setResults] = useState<ResultMap>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [msg, setMsg] = useState('')

  const uniqueTeams = ALL_TEAMS.filter((t, i, arr) => arr.findIndex(x => x.name === t.name) === i)

  useEffect(() => {
    fetch('/api/knockout?type=results')
      .then(r => r.json()).then(({ data }) => {
        const map: ResultMap = {}
        ;(data || []).forEach((r: any) => { map[r.match_id] = r })
        setResults(map)
      })
  }, [])

  const saveResult = useCallback(async (matchId: string, data: any) => {
    if (!data.home_team || !data.away_team) return
    setSaving(s => ({ ...s, [matchId]: true }))
    const res = await fetch('/api/knockout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPass },
      body: JSON.stringify({ type: 'result', match_id: matchId, ...data }),
    })
    setSaving(s => ({ ...s, [matchId]: false }))
    if (res.ok) {
      setSaved(s => ({ ...s, [matchId]: true }))
      setTimeout(() => setSaved(s => ({ ...s, [matchId]: false })), 2500)
    } else {
      setMsg('Error al guardar')
      setTimeout(() => setMsg(''), 3000)
    }
  }, [adminPass])

  const updateResult = (matchId: string, field: string, val: string) => {
    const current = results[matchId] || {}
    setResults(r => ({ ...r, [matchId]: { ...current, [field]: val } }))
  }

  const deleteResult = async (matchId: string) => {
    setResults(r => { const n = { ...r }; delete n[matchId]; return n })
    await fetch('/api/knockout?match_id=' + matchId, {
      method: 'DELETE',
      headers: { 'x-admin-password': adminPass },
    })
    setSaved(s => ({ ...s, [matchId]: true }))
    setTimeout(() => setSaved(s => ({ ...s, [matchId]: false })), 2000)
  }

  const currentRound = ALL_KNOCKOUT_ROUNDS.find(r => r.id === activeRound)

  return (
    <div>
      {msg && <div style={{ marginBottom: 12, background: 'rgba(214,40,40,0.12)', border: '1px solid rgba(214,40,40,0.3)', borderRadius: 8, padding: '8px 14px', color: '#FF6B6B', fontSize: '0.85rem' }}>{msg}</div>}

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 20, paddingBottom: 4 }}>
        {ALL_KNOCKOUT_ROUNDS.map(r => (
          <button key={r.id} onClick={() => setActiveRound(r.id)} style={{
            flexShrink: 0,
            background: activeRound === r.id ? 'rgba(244,197,66,0.12)' : 'rgba(17,17,24,0.8)',
            border: '1px solid ' + (activeRound === r.id ? 'rgba(244,197,66,0.4)' : 'rgba(255,255,255,0.08)'),
            borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
            color: activeRound === r.id ? 'var(--gold)' : 'var(--muted)',
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.9rem',
            whiteSpace: 'nowrap',
          }}>{r.label}</button>
        ))}
      </div>

      {currentRound?.matches.map((match: KnockoutMatch) => {
        const res = results[match.id] || {}
        return (
          <div key={match.id} style={{ background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px 18px', marginBottom: 12 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{match.label} · {match.date} · {match.stadium}, {match.city}</span>
              <span style={{ color: 'var(--muted)', opacity: 0.6 }}>{match.homeDesc} vs {match.awayDesc}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {saving[match.id] && <span style={{ color: 'var(--gold)' }}>...</span>}
                {saved[match.id] && <span style={{ color: 'var(--green)' }}>✓</span>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <select value={res.home_team || ''} onChange={e => updateResult(match.id, 'home_team', e.target.value)}
                style={{ background: 'rgba(214,40,40,0.1)', border: '1px solid rgba(214,40,40,0.3)', borderRadius: 8, padding: '8px', color: 'var(--text)', fontFamily: "'Outfit', sans-serif", fontSize: '0.85rem', outline: 'none', minWidth: 140 }}>
                <option value="">Local...</option>
                {uniqueTeams.map(t => <option key={t.name} value={t.name}>{t.flag} {t.name}</option>)}
              </select>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="number" min={0} max={20} value={res.home_score ?? ''} onChange={e => updateResult(match.id, 'home_score', e.target.value)} placeholder="0"
                  style={{ width: 46, height: 44, background: 'rgba(214,40,40,0.12)', border: '1px solid rgba(214,40,40,0.35)', borderRadius: 10, textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: '#FF6B6B', outline: 'none' }} />
                <span style={{ color: 'var(--muted)', fontFamily: "'Bebas Neue', sans-serif" }}>-</span>
                <input type="number" min={0} max={20} value={res.away_score ?? ''} onChange={e => updateResult(match.id, 'away_score', e.target.value)} placeholder="0"
                  style={{ width: 46, height: 44, background: 'rgba(214,40,40,0.12)', border: '1px solid rgba(214,40,40,0.35)', borderRadius: 10, textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: '#FF6B6B', outline: 'none' }} />
              </div>

              <select value={res.away_team || ''} onChange={e => updateResult(match.id, 'away_team', e.target.value)}
                style={{ background: 'rgba(214,40,40,0.1)', border: '1px solid rgba(214,40,40,0.3)', borderRadius: 8, padding: '8px', color: 'var(--text)', fontFamily: "'Outfit', sans-serif", fontSize: '0.85rem', outline: 'none', minWidth: 140 }}>
                <option value="">Visitante...</option>
                {uniqueTeams.map(t => <option key={t.name} value={t.name}>{t.flag} {t.name}</option>)}
              </select>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>Avanza:</span>
                <select value={res.winner || ''} onChange={e => updateResult(match.id, 'winner', e.target.value)}
                  style={{ background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.3)', borderRadius: 8, padding: '8px', color: 'var(--text)', fontFamily: "'Outfit', sans-serif", fontSize: '0.85rem', outline: 'none', minWidth: 140 }}>
                  <option value="">Quien avanza?</option>
                  {res.home_team && <option value={res.home_team}>{res.home_team}</option>}
                  {res.away_team && <option value={res.away_team}>{res.away_team}</option>}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => saveResult(match.id, results[match.id] || {})}
                  disabled={!(results[match.id]?.home_team && results[match.id]?.away_team)}
                  style={{ background: 'rgba(46,204,113,0.15)', border: '1px solid rgba(46,204,113,0.3)', color: 'var(--green)', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                  Guardar
                </button>
                <button onClick={() => deleteResult(match.id)}
                  style={{ background: 'rgba(214,40,40,0.12)', border: '1px solid rgba(214,40,40,0.3)', color: '#FF6B6B', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  🗑️
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
