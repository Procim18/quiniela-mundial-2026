'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'

interface PlayerScore {
  id: string
  username: string
  pts: number
  exactGroup: number
  winnerGroup: number
  exactKnockout: number
  winnerKnockout: number
  champPts: number
}

const AVATAR_COLORS = [
  'linear-gradient(135deg,#F4C542,#E8A87C)',
  'linear-gradient(135deg,#3B82F6,#06B6D4)',
  'linear-gradient(135deg,#D62828,#F97316)',
  'linear-gradient(135deg,#2ECC71,#06B6D4)',
  'linear-gradient(135deg,#8B5CF6,#EC4899)',
  'linear-gradient(135deg,#F97316,#EF4444)',
  'linear-gradient(135deg,#10B981,#84CC16)',
  'linear-gradient(135deg,#EC4899,#8B5CF6)',
]

export default function ClasificacionPage() {
  const { player } = useAuth()
  const [scores, setScores] = useState<PlayerScore[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/leaderboard')
    const { data } = await res.json()
    setScores(data || [])
    setLastUpdated(new Date())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const top3 = scores.slice(0, 3)
  // Podium visual order: 2nd, 1st, 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean)
  const podiumHeights = [70, 100, 50]
  const podiumMedals = ['🥈', '🥇', '🥉']

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 60px' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.2rem', color: 'var(--gold)', letterSpacing: '0.06em' }}>
            📊 Clasificación
          </h1>
          {lastUpdated && (
            <p style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: 4 }}>
              Actualizado: {lastUpdated.toLocaleTimeString('es-VE')}
            </p>
          )}
        </div>
        <button onClick={load} style={{
          background: 'var(--dark3)', border: '1px solid var(--border)',
          color: 'var(--text)', borderRadius: 10, padding: '8px 18px',
          cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontSize: '0.85rem',
        }}>
          🔄 Actualizar
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
          Cargando clasificación...
        </div>
      ) : scores.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📊</div>
          <p style={{ color: 'var(--muted)' }}>Aún no hay datos. ¡Haz tus predicciones y espera los resultados!</p>
        </div>
      ) : (
        <>
          {/* Podium */}
          {scores.length >= 2 && (
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 16, marginBottom: 40, padding: '0 20px' }}>
              {podiumOrder.map((p, vi) => {
                const ci = scores.findIndex(s => s.id === p.id) % AVATAR_COLORS.length
                return (
                  <div key={p.id} style={{ textAlign: 'center', flex: 1, maxWidth: 180 }}>
                    <div style={{
                      width: 60, height: 60, borderRadius: '50%',
                      background: AVATAR_COLORS[ci],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', color: 'var(--dark)',
                      margin: '0 auto 8px',
                      border: `3px solid ${vi === 1 ? 'var(--gold)' : vi === 0 ? '#C0C0C0' : '#CD7F32'}`,
                    }}>
                      {p.username.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>{podiumMedals[vi]} {p.username}</div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: 'var(--gold)', lineHeight: 1 }}>
                      {p.pts}<span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>pts</span>
                    </div>
                    <div style={{
                      marginTop: 10, borderRadius: '8px 8px 0 0',
                      background: 'var(--dark3)', border: '1px solid var(--border)',
                      height: podiumHeights[vi],
                    }} />
                  </div>
                )
              })}
            </div>
          )}

          {/* Table */}
          <div style={{ background: 'var(--dark3)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 64px 80px 80px 80px', padding: '12px 20px', background: 'var(--dark4)', fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              <span>#</span>
              <span>Jugador</span>
              <span style={{ textAlign: 'center' }}>Pts</span>
              <span style={{ textAlign: 'center' }}>🎯 Grupos</span>
              <span style={{ textAlign: 'center' }}>🏆 Elim.</span>
              <span style={{ textAlign: 'center' }}>👑 Camp.</span>
            </div>

            {scores.map((p, i) => {
              const ci = i % AVATAR_COLORS.length
              const isMe = player?.id === p.id
              return (
                <div key={p.id} style={{
                  display: 'grid', gridTemplateColumns: '48px 1fr 64px 80px 80px 80px',
                  padding: '14px 20px', borderTop: '1px solid var(--border)',
                  background: isMe ? 'rgba(244,197,66,0.04)' : 'transparent',
                  transition: 'background 0.15s',
                }}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: i < 3 ? 'var(--gold)' : 'var(--muted)' }}>
                    {i + 1}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%', background: AVATAR_COLORS[ci],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.95rem', color: 'var(--dark)', flexShrink: 0,
                    }}>
                      {p.username.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                      {p.username}
                      {isMe && <span style={{ marginLeft: 6, fontSize: '0.72rem', color: 'var(--gold)', background: 'rgba(244,197,66,0.1)', borderRadius: 4, padding: '1px 6px' }}>tú</span>}
                    </span>
                  </div>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: 'var(--gold)', textAlign: 'center' }}>
                    {p.pts}
                  </span>
                  <div style={{ textAlign: 'center', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--gold)' }}>+3×{p.exactGroup}</span>
                    <span style={{ color: 'var(--muted)' }}> </span>
                    <span style={{ color: 'var(--blue)' }}>+1×{p.winnerGroup}</span>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--gold)' }}>✓{p.exactKnockout}</span>
                    <span style={{ color: 'var(--muted)' }}> </span>
                    <span style={{ color: 'var(--blue)' }}>✓{p.winnerKnockout}</span>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '0.82rem' }}>
                    {p.champPts > 0
                      ? <span style={{ color: 'var(--purple)' }}>+{p.champPts} 👑</span>
                      : <span style={{ color: 'var(--muted)' }}>-</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
