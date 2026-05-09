'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

interface PlayerScore {
  id: string; username: string; pts: number
  exactGroup: number; winnerGroup: number
  exactKnockout: number; winnerKnockout: number; champPts: number
}

interface FavoriteTeam { name: string; flag: string; count: number; pct: number }

const COLORS = [
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
  const { player, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !player) router.push('/login')
  }, [player, authLoading])
  const [scores, setScores] = useState<PlayerScore[]>([])
  const [favorites, setFavorites] = useState<FavoriteTeam[]>([])
  const [favTotal, setFavTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const load = async () => {
    setLoading(true)
    const [lb, fav] = await Promise.all([
      fetch('/api/leaderboard').then(r => r.json()),
      fetch('/api/favorites').then(r => r.json()),
    ])
    setScores(lb.data || [])
    setFavorites(fav.data || [])
    setFavTotal(fav.total || 0)
    setLastUpdated(new Date())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const top3 = scores.slice(0, 3)
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean)
  const podiumH = [70, 100, 50]
  const medals = ['🥈', '🥇', '🥉']

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: 'var(--gold)', letterSpacing: '0.06em' }}>Clasificacion</h1>
          {lastUpdated && <p style={{ color: 'var(--muted)', fontSize: '0.75rem', marginTop: 2 }}>Actualizado: {lastUpdated.toLocaleTimeString('es-VE')}</p>}
        </div>
        <button onClick={load} style={{ background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text)', borderRadius: 10, padding: '8px 18px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontSize: '0.85rem' }}>
          Actualizar
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>Cargando...</div>
      ) : (
        <>
          {favorites.length > 0 && (
            <div style={{ background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(244,197,66,0.2)', borderRadius: 16, padding: '22px 24px', marginBottom: 28, backdropFilter: 'blur(12px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: '1.3rem' }}>👑</span>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: 'var(--gold)', letterSpacing: '0.06em' }}>Top Favoritas al Titulo</h2>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', marginLeft: 'auto' }}>{favTotal} votos totales</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {favorites.map((team, i) => (
                  <div key={team.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', color: i === 0 ? 'var(--gold)' : 'var(--muted)', minWidth: 20, textAlign: 'right' }}>{i + 1}</span>
                    <span style={{ fontSize: '1.3rem' }}>{team.flag}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', minWidth: 110 }}>{team.name}</span>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 100, height: 8, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 100, background: i === 0 ? 'linear-gradient(90deg, var(--gold), var(--nike-red))' : i === 1 ? 'linear-gradient(90deg,#C0C0C0,#E8E8E8)' : 'linear-gradient(90deg,#CD7F32,#E8A87C)', width: team.pct + '%', transition: 'width 0.6s ease' }} />
                    </div>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', color: i === 0 ? 'var(--gold)' : 'var(--text)', minWidth: 42, textAlign: 'right' }}>{team.pct}%</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)', minWidth: 50 }}>{team.count} votos</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {scores.length >= 2 && (
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 16, marginBottom: 32, padding: '0 20px' }}>
              {podiumOrder.map((p, vi) => {
                const ci = scores.findIndex(s => s.id === p.id) % COLORS.length
                return (
                  <div key={p.id} style={{ textAlign: 'center', flex: 1, maxWidth: 180 }}>
                    <div style={{ width: 58, height: 58, borderRadius: '50%', background: COLORS[ci], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', color: 'var(--dark)', margin: '0 auto 8px', border: vi === 1 ? '3px solid var(--gold)' : vi === 0 ? '3px solid #C0C0C0' : '3px solid #CD7F32' }}>
                      {p.username.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 2 }}>{medals[vi]} {p.username}</div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: 'var(--gold)', lineHeight: 1 }}>
                      {p.pts}<span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>pts</span>
                    </div>
                    <div style={{ marginTop: 8, borderRadius: '8px 8px 0 0', background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(255,255,255,0.07)', height: podiumH[vi] }} />
                  </div>
                )
              })}
            </div>
          )}

          {scores.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>📊</div>
              <p style={{ color: 'var(--muted)' }}>Aun no hay datos. Haz tus predicciones y espera los resultados.</p>
            </div>
          ) : (
            <div style={{ background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden', backdropFilter: 'blur(12px)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 56px 80px 80px 70px', padding: '10px 18px', background: 'rgba(255,255,255,0.03)', fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                <span>#</span><span>Jugador</span>
                <span style={{ textAlign: 'center' }}>Pts</span>
                <span style={{ textAlign: 'center' }}>Grupos</span>
                <span style={{ textAlign: 'center' }}>Elim.</span>
                <span style={{ textAlign: 'center' }}>Camp.</span>
              </div>
              {scores.map((p, i) => {
                const ci = i % COLORS.length
                const isMe = player?.id === p.id
                return (
                  <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '44px 1fr 56px 80px 80px 70px', padding: '12px 18px', borderTop: '1px solid rgba(255,255,255,0.05)', background: isMe ? 'rgba(244,197,66,0.04)' : 'transparent' }}>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: i < 3 ? 'var(--gold)' : 'var(--muted)' }}>{i + 1}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: COLORS[ci], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.9rem', color: 'var(--dark)', flexShrink: 0 }}>
                        {p.username.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                        {p.username}
                        {isMe && <span style={{ marginLeft: 6, fontSize: '0.68rem', color: 'var(--gold)', background: 'rgba(244,197,66,0.1)', borderRadius: 4, padding: '1px 5px' }}>tu</span>}
                      </span>
                    </div>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: 'var(--gold)', textAlign: 'center' }}>{p.pts}</span>
                    <div style={{ textAlign: 'center', fontSize: '0.78rem' }}>
                      <span style={{ color: 'var(--gold)' }}>+3x{p.exactGroup}</span> <span style={{ color: 'var(--blue)' }}>+1x{p.winnerGroup}</span>
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '0.78rem' }}>
                      <span style={{ color: 'var(--gold)' }}>{p.exactKnockout}</span> <span style={{ color: 'var(--blue)' }}>{p.winnerKnockout}</span>
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '0.78rem' }}>
                      {p.champPts > 0 ? <span style={{ color: 'var(--purple)' }}>+{p.champPts}</span> : <span style={{ color: 'var(--muted)' }}>-</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
