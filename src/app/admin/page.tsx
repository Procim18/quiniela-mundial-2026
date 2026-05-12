'use client'
import { useEffect, useState, useCallback } from 'react'
import KnockoutPanel from './knockout-panel'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { getGroupMatches, KNOCKOUT_ROUNDS, ALL_TEAMS } from '@/lib/data'

type ResultMap = Record<string, { home_score: string; away_score: string }>
type KnockResultMap = Record<string, any>

export default function AdminPage() {
  const { player, loading } = useAuth()
  const router = useRouter()
  const [adminPass, setAdminPass] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [activeTab, setActiveTab] = useState('grupos')
  const [activeGroup, setActiveGroup] = useState('A')
  const [activeRound, setActiveRound] = useState('R16')
  const [results, setResults] = useState<ResultMap>({})
  const [knockResults, setKnockResults] = useState<KnockResultMap>({})
  const [champion, setChampion] = useState('')
  const [scorerResult, setScorerResult] = useState('')
  const [scorerInput, setScorerInput] = useState('')
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [msg, setMsg] = useState('')
  const [players, setPlayers] = useState<{id: string; username: string; is_active: boolean; email?: string}[]>([])
  const [resetPass, setResetPass] = useState<Record<string, string>>({})
  const [resetMsg, setResetMsg] = useState<Record<string, string>>({})
  const [newUsername, setNewUsername] = useState<Record<string, string>>({})
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const groupMatches = getGroupMatches()

  useEffect(() => {
    if (!loading && !player) router.push('/login')
  }, [player, loading])

  const verifyAdmin = async () => {
    const res = await fetch('/api/results', {
      headers: { 'x-admin-password': adminPass },
      method: 'GET',
    })
    // Try posting a dummy - actually just verify via a dedicated check
    // We'll load results; if unauthorized the saves will fail
    loadResults()
    loadPlayers()
    loadPredStats()
    setAuthed(true)
  }

  const loadPlayers = async () => {
    const res = await fetch('/api/players')
    const { data } = await res.json()
    setPlayers(data || [])
  }

  const [predStats, setPredStats] = useState<Record<string, number>>({})

  const loadPredStats = async () => {
    const [playersRes, predsRes] = await Promise.all([
      fetch('/api/players').then(r => r.json()),
      fetch('/api/predictions/all?t=' + Date.now(), { cache: 'no-store' }).then(r => r.json()),
    ])
    const players = playersRes.data || []
    const preds = predsRes.data || []
    const stats: Record<string, number> = {}
    players.forEach((p: any) => {
      stats[p.id] = preds.filter((pr: any) => pr.player_id === p.id && pr.home_score !== null && pr.away_score !== null).length
    })
    setPredStats(stats)
  }

  const loadResults = async () => {
    const [gr, kr, cr] = await Promise.all([
      fetch('/api/results').then(r => r.json()),
      fetch('/api/results/knockout').then(r => r.json()),
      fetch('/api/results/champion').then(r => r.json()),
      fetch('/api/results/scorer').then(r => r.json()),
    ])
    const map: ResultMap = {}
    ;(gr.data || []).forEach((r: any) => { map[r.match_id] = { home_score: String(r.home_score), away_score: String(r.away_score) } })
    setResults(map)
    const kmap: KnockResultMap = {}
    ;(kr.data || []).forEach((r: any) => { kmap[r.match_id] = r })
    setKnockResults(kmap)
    if (cr.data?.team) setChampion(cr.data.team)
  }

  const saveGroupResult = useCallback(async (matchId: string, home: string, away: string) => {
    if (home === undefined || away === undefined) return
    setSaving(s => ({ ...s, [matchId]: true }))
    if (home === '' && away === '') {
      await fetch('/api/results?match_id=' + matchId, {
        method: 'DELETE',
        headers: { 'x-admin-password': adminPass },
      })
      setSaving(s => ({ ...s, [matchId]: false }))
      setSaved(s => ({ ...s, [matchId]: true }))
      setTimeout(() => setSaved(s => ({ ...s, [matchId]: false })), 2500)
      return
    }
    if (home === '' || away === '') {
      setSaving(s => ({ ...s, [matchId]: false }))
      return
    }
    const res = await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPass },
      body: JSON.stringify({ match_id: matchId, home_score: parseInt(home), away_score: parseInt(away) }),
    })
    setSaving(s => ({ ...s, [matchId]: false }))
    if (res.ok) {
      setSaved(s => ({ ...s, [matchId]: true }))
      setTimeout(() => setSaved(s => ({ ...s, [matchId]: false })), 2500)
    } else {
      setMsg('❌ Error al guardar. Verifica la contraseña de admin.')
    }
  }, [adminPass])

  const updateResult = (matchId: string, side: 'home' | 'away', val: string) => {
    const current = results[matchId] || { home_score: '', away_score: '' }
    const updated = { ...current, [side === 'home' ? 'home_score' : 'away_score']: val }
    setResults(r => ({ ...r, [matchId]: updated }))
  }

  const handleBlurResult = (_matchId: string) => {
    // save handled by explicit save button only
  }

  const saveKnockResult = async (matchId: string, data: any) => {
    setSaving(s => ({ ...s, [matchId]: true }))
    await fetch('/api/results/knockout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPass },
      body: JSON.stringify({ match_id: matchId, ...data }),
    })
    setSaving(s => ({ ...s, [matchId]: false }))
    setSaved(s => ({ ...s, [matchId]: true }))
    setTimeout(() => setSaved(s => ({ ...s, [matchId]: false })), 2500)
  }

  const updateKnockResult = (matchId: string, field: string, val: string) => {
    const current = knockResults[matchId] || {}
    const updated = { ...current, [field]: val }
    setKnockResults(k => ({ ...k, [matchId]: updated }))
    saveKnockResult(matchId, updated)
  }

  const saveChampion = async (team: string) => {
    setChampion(team)
    await fetch('/api/results/champion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPass },
      body: JSON.stringify({ team }),
    })
    setMsg('✅ Campeón guardado')
    setTimeout(() => setMsg(''), 3000)
  }

  if (loading || !player) return null

  if (!authed) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: 'var(--dark3)', border: '1px solid rgba(214,40,40,0.3)', borderRadius: 20, padding: 40, maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔧</div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: '#FF6B6B', marginBottom: 8 }}>Panel Admin</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 24 }}>Ingresa la contraseña de administrador</p>
          <input
            type="password" value={adminPass}
            onChange={e => setAdminPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && verifyAdmin()}
            placeholder="Contraseña admin..."
            style={{ width: '100%', background: 'var(--dark4)', border: '1px solid rgba(214,40,40,0.3)', borderRadius: 10, padding: '12px 16px', color: 'var(--text)', fontFamily: "'Outfit', sans-serif", fontSize: '0.95rem', outline: 'none', marginBottom: 16 }}
          />
          {authError && <p style={{ color: '#FF6B6B', fontSize: '0.85rem', marginBottom: 12 }}>{authError}</p>}
          <button onClick={verifyAdmin} style={{ width: '100%', background: 'linear-gradient(135deg, #D62828, #F97316)', color: '#fff', border: 'none', borderRadius: 10, padding: 14, fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.08em', cursor: 'pointer' }}>
            🔓 Acceder
          </button>
        </div>
      </div>
    )
  }

  const currentRound = KNOCKOUT_ROUNDS.find(r => r.id === activeRound)
  const currentGroupMatches = groupMatches.filter(m => m.group === activeGroup)

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 20px 60px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.2rem', color: '#FF6B6B', letterSpacing: '0.06em' }}>
          🔧 Panel de Administración
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 4 }}>
          Ingresa los resultados reales para calcular los puntos automáticamente.
        </p>
        {msg && <div style={{ marginTop: 12, background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.3)', borderRadius: 8, padding: '8px 16px', color: 'var(--green)', fontSize: '0.85rem' }}>{msg}</div>}
        <div style={{ marginTop: 16 }}>
          <button onClick={async () => {
            const res = await fetch('/api/sync-results', { method: 'POST', headers: { 'x-admin-password': adminPass } })
            const data = await res.json()
            if (data.ok) setMsg('✅ ' + (data.message || (data.synced + ' resultados sincronizados')))
            else setMsg('❌ Error: ' + data.error)
            setTimeout(() => setMsg(''), 6000)
          }} style={{ background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.3)', color: 'var(--green)', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
            🔄 Sincronizar resultados automaticamente
          </button>
          <span style={{ color: 'var(--muted)', fontSize: '0.75rem', marginLeft: 10 }}>Importa resultados reales desde football-data.org</span>
        </div>
      </div>

      {/* Tab selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['grupos', 'eliminatorias', 'campeon', 'usuarios'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            background: activeTab === t ? 'rgba(214,40,40,0.15)' : 'var(--dark3)',
            border: `1px solid ${activeTab === t ? 'rgba(214,40,40,0.4)' : 'var(--border)'}`,
            color: activeTab === t ? '#FF6B6B' : 'var(--muted)',
            borderRadius: 10, padding: '8px 20px', cursor: 'pointer',
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', letterSpacing: '0.06em',
          }}>
            {t === 'grupos' ? '⚽ Grupos' : t === 'eliminatorias' ? '🏆 Eliminatorias' : t === 'campeon' ? '👑 Campeon' : '👥 Usuarios'}
          </button>
        ))}
      </div>

      {/* GRUPOS */}
      {activeTab === 'grupos' && (
        <div>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 20 }}>
            {['A','B','C','D','E','F','G','H','I','J','K','L'].map(g => (
              <button key={g} onClick={() => setActiveGroup(g)} style={{
                flexShrink: 0, background: activeGroup === g ? 'rgba(244,197,66,0.12)' : 'var(--dark3)',
                border: `1px solid ${activeGroup === g ? 'rgba(244,197,66,0.4)' : 'var(--border)'}`,
                borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
                color: activeGroup === g ? 'var(--gold)' : 'var(--muted)',
                fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.95rem',
              }}>Grupo {g}</button>
            ))}
          </div>
          {currentGroupMatches.map(match => {
            const res = results[match.id] || { home_score: '', away_score: '' }
            return (
              <div key={match.id} style={{ background: 'var(--dark3)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                  <span style={{ fontSize: '1.4rem' }}>{match.home.flag}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{match.home.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <input type="number" min={0} max={20} value={res.home_score} onChange={e => updateResult(match.id, 'home', e.target.value)} onBlur={() => handleBlurResult(match.id)} placeholder="0"
                    style={{ width: 48, height: 48, background: 'rgba(214,40,40,0.12)', border: '1px solid rgba(214,40,40,0.35)', borderRadius: 10, textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: '#FF6B6B', outline: 'none' }} />
                  <span style={{ color: 'var(--muted)', fontFamily: "'Bebas Neue', sans-serif" }}>-</span>
                  <input type="number" min={0} max={20} value={res.away_score} onChange={e => updateResult(match.id, 'away', e.target.value)} onBlur={() => handleBlurResult(match.id)} placeholder="0"
                    style={{ width: 48, height: 48, background: 'rgba(214,40,40,0.12)', border: '1px solid rgba(214,40,40,0.35)', borderRadius: 10, textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: '#FF6B6B', outline: 'none' }} />
                  <button onClick={async () => {
                    const r = results[match.id]
                    if (!r || r.home_score === '' || r.away_score === '') return
                    await saveGroupResult(match.id, r.home_score, r.away_score)
                  }} disabled={!(results[match.id] && results[match.id].home_score !== '' && results[match.id].away_score !== '')} style={{ background: (results[match.id] && results[match.id].home_score !== '' && results[match.id].away_score !== '') ? 'rgba(46,204,113,0.15)' : 'rgba(255,255,255,0.03)', border: '1px solid rgba(46,204,113,0.3)', color: (results[match.id] && results[match.id].home_score !== '' && results[match.id].away_score !== '') ? 'var(--green)' : 'var(--muted)', borderRadius: 8, padding: '4px 12px', cursor: (results[match.id] && results[match.id].home_score !== '' && results[match.id].away_score !== '') ? 'pointer' : 'not-allowed', fontSize: '0.85rem', marginLeft: 4, fontWeight: 600 }}>✓ Guardar</button>
                  <button onClick={async () => {
                    setResults(r => ({ ...r, [match.id]: { home_score: '', away_score: '' } }))
                    await fetch('/api/results/delete', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPass },
                      body: JSON.stringify({ match_id: match.id })
                    })
                    setSaved(s => ({ ...s, [match.id]: true }))
                    setTimeout(() => setSaved(s => ({ ...s, [match.id]: false })), 2000)
                  }} style={{ background: 'rgba(214,40,40,0.12)', border: '1px solid rgba(214,40,40,0.3)', color: '#FF6B6B', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: '0.9rem', marginLeft: 4 }}>🗑️</button>
                  {saving[match.id] && <span style={{ color: 'var(--gold)', fontSize: '0.8rem', marginLeft: 4 }}>...</span>}
                  {saved[match.id] && <span style={{ color: 'var(--green)', fontSize: '0.8rem', marginLeft: 4 }}>✓</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', textAlign: 'right' }}>{match.away.name}</span>
                  <span style={{ fontSize: '1.4rem' }}>{match.away.flag}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ELIMINATORIAS */}
      {activeTab === 'eliminatorias' && (
        <div>
          <KnockoutPanel adminPass={adminPass} />
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 20 }}>
            {KNOCKOUT_ROUNDS.map(r => (
              <button key={r.id} onClick={() => setActiveRound(r.id)} style={{
                flexShrink: 0, background: activeRound === r.id ? 'rgba(244,197,66,0.12)' : 'var(--dark3)',
                border: `1px solid ${activeRound === r.id ? 'rgba(244,197,66,0.4)' : 'var(--border)'}`,
                borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
                color: activeRound === r.id ? 'var(--gold)' : 'var(--muted)',
                fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.9rem',
                whiteSpace: 'nowrap',
              }}>{r.label}</button>
            ))}
          </div>
          {currentRound?.matches.map(match => {
            const res = knockResults[match.id] || {}
            return (
              <div key={match.id} style={{ background: 'var(--dark3)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', marginBottom: 12 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.12em', marginBottom: 14, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{currentRound.label} · {match.label}</span>
                  <span>{saving[match.id] ? '⏳' : saved[match.id] ? '✓ Guardado' : ''}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                  <select value={res.home_team || ''} onChange={e => updateKnockResult(match.id, 'home_team', e.target.value)}
                    style={{ background: 'var(--dark4)', border: '1px solid var(--border2)', borderRadius: 8, padding: '8px', color: 'var(--text)', fontFamily: "'Outfit', sans-serif", fontSize: '0.85rem', outline: 'none' }}>
                    <option value="">Equipo local...</option>
                    {ALL_TEAMS.filter((t, i, arr) => arr.findIndex(x => x.name === t.name) === i).map(t => <option key={t.name} value={t.name}>{t.flag} {t.name}</option>)}
                  </select>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="number" min={0} max={20} value={res.home_score ?? ''} onChange={e => updateKnockResult(match.id, 'home_score', e.target.value)}
                      style={{ width: 48, height: 44, background: 'rgba(214,40,40,0.12)', border: '1px solid rgba(214,40,40,0.35)', borderRadius: 10, textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: '#FF6B6B', outline: 'none' }} />
                    <span style={{ color: 'var(--muted)', fontFamily: "'Bebas Neue', sans-serif" }}>-</span>
                    <input type="number" min={0} max={20} value={res.away_score ?? ''} onChange={e => updateKnockResult(match.id, 'away_score', e.target.value)}
                      style={{ width: 48, height: 44, background: 'rgba(214,40,40,0.12)', border: '1px solid rgba(214,40,40,0.35)', borderRadius: 10, textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: '#FF6B6B', outline: 'none' }} />
                  </div>
                  <select value={res.away_team || ''} onChange={e => updateKnockResult(match.id, 'away_team', e.target.value)}
                    style={{ background: 'var(--dark4)', border: '1px solid var(--border2)', borderRadius: 8, padding: '8px', color: 'var(--text)', fontFamily: "'Outfit', sans-serif", fontSize: '0.85rem', outline: 'none' }}>
                    <option value="">Equipo visitante...</option>
                    {ALL_TEAMS.filter((t, i, arr) => arr.findIndex(x => x.name === t.name) === i).map(t => <option key={t.name} value={t.name}>{t.flag} {t.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Equipo que avanza:</span>
                  <select value={res.winner || ''} onChange={e => updateKnockResult(match.id, 'winner', e.target.value)}
                    style={{ background: 'var(--dark4)', border: '1px solid var(--border2)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontFamily: "'Outfit', sans-serif", fontSize: '0.85rem', outline: 'none' }}>
                    <option value="">Seleccionar...</option>
                    {res.home_team && <option value={res.home_team}>{res.home_team}</option>}
                    {res.away_team && <option value={res.away_team}>{res.away_team}</option>}
                  </select>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* USUARIOS */}
      {activeTab === 'usuarios' && (
        <div>
          <div style={{ background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', background: 'rgba(255,255,255,0.03)', fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Usuarios registrados
            </div>
            {players.map((p, i) => (
              <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--red))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.9rem', color: 'var(--dark)' }}>
                    {p.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.username}</span>
                    {p.email && <span style={{ marginLeft: 8, fontSize: '0.72rem', color: 'var(--muted)' }}>{p.email}</span>}
                    <span style={{ marginLeft: 8, fontSize: '0.7rem', padding: '2px 8px', borderRadius: 6, background: p.is_active ? 'rgba(46,204,113,0.1)' : 'rgba(214,40,40,0.1)', color: p.is_active ? 'var(--green)' : '#FF6B6B', border: '1px solid ' + (p.is_active ? 'rgba(46,204,113,0.3)' : 'rgba(214,40,40,0.3)') }}>
                      {p.is_active ? 'Activo' : 'Pendiente'}
                    </span>
                    <span style={{ marginLeft: 6, fontSize: '0.7rem', padding: '2px 8px', borderRadius: 6, background: (predStats[p.id] || 0) === 72 ? 'rgba(46,204,113,0.1)' : (predStats[p.id] || 0) > 0 ? 'rgba(244,197,66,0.1)' : 'rgba(214,40,40,0.1)', color: (predStats[p.id] || 0) === 72 ? 'var(--green)' : (predStats[p.id] || 0) > 0 ? 'var(--gold)' : '#FF6B6B', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {predStats[p.id] || 0}/72 pred
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <input
                    type="text"
                    placeholder="Nuevo username..."
                    value={newUsername[p.id] || ''}
                    onChange={e => setNewUsername(r => ({ ...r, [p.id]: e.target.value }))}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontFamily: "'Outfit', sans-serif", fontSize: '0.85rem', outline: 'none' }}
                  />
                  <input
                    type="text"
                    placeholder="Nueva contrasena..."
                    value={resetPass[p.id] || ''}
                    onChange={e => setResetPass(r => ({ ...r, [p.id]: e.target.value }))}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontFamily: "'Outfit', sans-serif", fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button onClick={async () => {
                      const name = newUsername[p.id]
                      if (!name || name.length < 2) { setResetMsg(m => ({ ...m, [p.id]: 'Min 2 caracteres' })); return }
                      const res = await fetch('/api/admin/rename-player', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPass },
                        body: JSON.stringify({ player_id: p.id, new_username: name }),
                      })
                      if (res.ok) {
                        setPlayers(pl => pl.map(pl2 => pl2.id === p.id ? { ...pl2, username: name } : pl2))
                        setNewUsername(r => ({ ...r, [p.id]: '' }))
                        setResetMsg(m => ({ ...m, [p.id]: 'Username cambiado' }))
                      } else setResetMsg(m => ({ ...m, [p.id]: 'Error' }))
                      setTimeout(() => setResetMsg(m => ({ ...m, [p.id]: '' })), 2000)
                    }} style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: 'var(--blue)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
                      Renombrar
                    </button>
                    <button onClick={async () => {
                      const res = await fetch('/api/admin/toggle-active', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPass },
                        body: JSON.stringify({ player_id: p.id, is_active: !p.is_active }),
                      })
                      if (res.ok) {
                        setPlayers(pl => pl.map(pl2 => pl2.id === p.id ? { ...pl2, is_active: !p.is_active } : pl2))
                        setResetMsg(m => ({ ...m, [p.id]: p.is_active ? 'Desactivado' : 'Activado' }))
                        setTimeout(() => setResetMsg(m => ({ ...m, [p.id]: '' })), 2000)
                      }
                    }} style={{ background: p.is_active ? 'rgba(214,40,40,0.12)' : 'rgba(46,204,113,0.12)', border: '1px solid ' + (p.is_active ? 'rgba(214,40,40,0.3)' : 'rgba(46,204,113,0.3)'), color: p.is_active ? '#FF6B6B' : 'var(--green)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
                      {p.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button onClick={async () => {
                      const pass = resetPass[p.id]
                      if (!pass || pass.length < 4) { setResetMsg(m => ({ ...m, [p.id]: 'Min 4 caracteres' })); return }
                      const res = await fetch('/api/admin/reset-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPass },
                        body: JSON.stringify({ player_id: p.id, new_password: pass }),
                      })
                      if (res.ok) {
                        setResetMsg(m => ({ ...m, [p.id]: 'Contrasena cambiada' }))
                        setResetPass(r => ({ ...r, [p.id]: '' }))
                      } else {
                        setResetMsg(m => ({ ...m, [p.id]: 'Error' }))
                      }
                      setTimeout(() => setResetMsg(m => ({ ...m, [p.id]: '' })), 3000)
                    }} style={{ background: 'rgba(46,204,113,0.15)', border: '1px solid rgba(46,204,113,0.3)', color: 'var(--green)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
                      Resetear
                    </button>
                  </div>
                  {resetMsg[p.id] && <span style={{ fontSize: '0.72rem', color: resetMsg[p.id].includes('Error') || resetMsg[p.id].includes('Min') ? '#FF6B6B' : 'var(--green)' }}>{resetMsg[p.id]}</span>}
                  {confirmDelete === p.id ? (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: '#FF6B6B' }}>¿Confirmar borrado?</span>
                      <button onClick={async () => {
                        const res = await fetch('/api/admin/delete-player', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPass },
                          body: JSON.stringify({ player_id: p.id }),
                        })
                        if (res.ok) setPlayers(pl => pl.filter(pl2 => pl2.id !== p.id))
                        setConfirmDelete(null)
                      }} style={{ background: 'rgba(214,40,40,0.2)', border: '1px solid rgba(214,40,40,0.4)', color: '#FF6B6B', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>Si, borrar</button>
                      <button onClick={() => setConfirmDelete(null)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--muted)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: '0.78rem' }}>Cancelar</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(p.id)} style={{ background: 'rgba(214,40,40,0.08)', border: '1px solid rgba(214,40,40,0.2)', color: '#FF6B6B', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: '0.78rem', alignSelf: 'flex-start' }}>
                      🗑️ Borrar usuario
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CAMPEÓN */}
      {activeTab === 'campeon' && (
        <div>
          <div style={{ background: 'var(--dark3)', border: '1px solid rgba(244,197,66,0.3)', borderRadius: 16, padding: 28 }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', color: 'var(--gold)', marginBottom: 8 }}>👑 Campeón del Mundial</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 24 }}>
              Selecciona el campeón real. Los jugadores que lo hayan acertado recibirán 10 puntos.
            </p>
            {champion && (
              <div style={{ marginBottom: 20, background: 'rgba(244,197,66,0.1)', border: '1px solid rgba(244,197,66,0.3)', borderRadius: 10, padding: '12px 18px', display: 'inline-block' }}>
                <strong style={{ color: 'var(--gold)' }}>Campeón actual: {champion}</strong>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
              {ALL_TEAMS.filter((t, i, arr) => arr.findIndex(x => x.name === t.name) === i).map(team => (
                <button key={team.name} onClick={() => saveChampion(team.name)} style={{
                  background: champion === team.name ? 'rgba(244,197,66,0.15)' : 'var(--dark4)',
                  border: `1px solid ${champion === team.name ? 'rgba(244,197,66,0.5)' : 'var(--border2)'}`,
                  borderRadius: 10, padding: '10px 14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                  color: champion === team.name ? 'var(--gold)' : 'var(--text)',
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
    </div>
  )
}
