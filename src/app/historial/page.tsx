'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

interface HistoryEntry {
  date: string
  scores: { username: string; pts: number }[]
}

const COLORS = [
  '#F4C542', '#3B82F6', '#D62828', '#2ECC71',
  '#8B5CF6', '#F97316', '#10B981', '#EC4899',
]

export default function HistorialPage() {
  const { player, loading: authLoading } = useAuth()
  const router = useRouter()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [players, setPlayers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !player) router.push('/login')
  }, [player, authLoading])

  useEffect(() => {
    if (!player) return
    fetch('/api/leaderboard?t=' + Date.now(), { cache: 'no-store' })
      .then(r => r.json())
      .then(({ data }) => {
        if (!data || data.length === 0) { setLoading(false); return }
        setPlayers(data.map((p: any) => p.username))
        // For now show current standings as single point
        const entry: HistoryEntry = {
          date: new Date().toLocaleDateString('es-VE', { day: 'numeric', month: 'short' }),
          scores: data.map((p: any) => ({ username: p.username, pts: p.pts }))
        }
        setHistory([entry])
        setLoading(false)
      })
  }, [player])

  if (authLoading || !player) return null

  const maxPts = Math.max(...history.flatMap(h => h.scores.map(s => s.pts)), 10)

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px 60px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: 'var(--gold)', letterSpacing: '0.06em' }}>
          Historial de Posiciones
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 4 }}>
          Evolucion de puntos a lo largo del torneo.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>Cargando...</div>
      ) : history.length === 0 || history.every(h => h.scores.every(s => s.pts === 0)) ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(17,17,24,0.8)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📈</div>
          <p style={{ color: 'var(--muted)' }}>El historial aparecer una vez que se jueguen los primeros partidos.</p>
        </div>
      ) : (
        <>
          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
            {players.map((p, i) => (
              <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                <span style={{ fontSize: '0.82rem', color: p === player.username ? 'var(--gold)' : 'var(--text)', fontWeight: p === player.username ? 700 : 400 }}>{p}</span>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div style={{ background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px', backdropFilter: 'blur(12px)', overflowX: 'auto' }}>
            <div style={{ minWidth: 400, position: 'relative' }}>
              {/* Y axis labels */}
              <div style={{ display: 'flex', gap: 0 }}>
                <div style={{ width: 40, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: 8, height: 300 }}>
                  {[maxPts, Math.round(maxPts*0.75), Math.round(maxPts*0.5), Math.round(maxPts*0.25), 0].map(v => (
                    <span key={v} style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{v}</span>
                  ))}
                </div>

                {/* Chart area */}
                <div style={{ flex: 1, height: 300, position: 'relative', borderLeft: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {/* Grid lines */}
                  {[0.25, 0.5, 0.75].map(v => (
                    <div key={v} style={{ position: 'absolute', left: 0, right: 0, top: (1-v)*100+'%', borderTop: '1px dashed rgba(255,255,255,0.05)' }} />
                  ))}

                  {/* Lines per player */}
                  {players.map((username, pi) => {
                    const color = COLORS[pi % COLORS.length]
                    return history.map((entry, ei) => {
                      const score = entry.scores.find(s => s.username === username)
                      if (!score) return null
                      const x = history.length === 1 ? 50 : (ei / (history.length - 1)) * 100
                      const y = (1 - score.pts / maxPts) * 100
                      return (
                        <div key={username + ei} style={{ position: 'absolute', left: x + '%', top: y + '%', transform: 'translate(-50%, -50%)', width: 10, height: 10, borderRadius: '50%', background: color, border: '2px solid var(--dark)', zIndex: 2, cursor: 'pointer' }} title={username + ': ' + score.pts + ' pts'} />
                      )
                    })
                  })}
                </div>
              </div>

              {/* X axis labels */}
              <div style={{ display: 'flex', marginLeft: 40, marginTop: 8 }}>
                {history.map((entry, i) => (
                  <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.68rem', color: 'var(--muted)' }}>{entry.date}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Current standings */}
          <div style={{ marginTop: 24, background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px', backdropFilter: 'blur(12px)' }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: 'var(--gold)', marginBottom: 16, letterSpacing: '0.06em' }}>Puntos Actuales</h2>
            {history[history.length - 1]?.scores.sort((a, b) => b.pts - a.pts).map((s, i) => (
              <div key={s.username} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < history[0].scores.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: COLORS[players.indexOf(s.username) % COLORS.length], flexShrink: 0 }} />
                <span style={{ flex: 1, fontWeight: s.username === player.username ? 700 : 400, color: s.username === player.username ? 'var(--gold)' : 'var(--text)' }}>{s.username}</span>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: 'var(--gold)' }}>{s.pts} pts</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
