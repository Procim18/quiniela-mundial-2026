'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

interface Score { username: string; pts: number; exactGroup: number; winnerGroup: number; exactKnockout: number; winnerKnockout: number; champPts: number }
interface FavoriteTeam { name: string; flag: string; count: number; pct: number }

const AVATAR_COLORS = [
  'linear-gradient(135deg,#C89B1A,#F4C542)',
  'linear-gradient(135deg,#1A4FBF,#3B82F6)',
  'linear-gradient(135deg,#8B1A1A,#D62828)',
  'linear-gradient(135deg,#1A7A3C,#2ECC71)',
  'linear-gradient(135deg,#5B2C8B,#8B5CF6)',
  'linear-gradient(135deg,#BF6B1A,#F97316)',
  'linear-gradient(135deg,#0E7C6A,#10B981)',
  'linear-gradient(135deg,#8B1A6B,#EC4899)',
]

const TrophyIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M18 2H6v7a6 6 0 0 0 12 0V2z"/>
    <path d="M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
  </svg>
)

const RefreshIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.86-8.62L23 10"/>
  </svg>
)

const PrintIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
  </svg>
)

const MEDAL_COLORS = ['#F4C542', '#C0C0C0', '#CD7F32']
const MEDAL_LABELS = ['1°', '2°', '3°']

export default function ClasificacionPage() {
  const { player, loading: authLoading } = useAuth()
  const router = useRouter()
  const [scores, setScores] = useState<Score[]>([])
  const [favorites, setFavorites] = useState<FavoriteTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [prevRanks, setPrevRanks] = useState<Record<string, number>>({})
  const [movers, setMovers] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!authLoading && !player) router.push('/login')
  }, [player, authLoading])

  const load = async () => {
    setLoading(true)
    const [lb, fav] = await Promise.all([
      fetch('/api/leaderboard?t=' + Date.now(), { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/favorites?t=' + Date.now(), { cache: 'no-store' }).then(r => r.json()),
    ])
    const newScores = lb.data || []
    if (scores.length > 0) {
      const newMovers: Record<string, number> = {}
      newScores.forEach((p: Score, i: number) => {
        const oldRank = prevRanks[p.username]
        if (oldRank !== undefined && oldRank !== i) newMovers[p.username] = oldRank - i
      })
      setMovers(newMovers)
      setTimeout(() => setMovers({}), 3000)
    }
    const newRanks: Record<string, number> = {}
    newScores.forEach((p: Score, i: number) => { newRanks[p.username] = i })
    setPrevRanks(newRanks)
    setScores(newScores)
    setFavorites(fav.data?.slice(0, 6) || [])
    setLastUpdated(new Date())
    setLoading(false)
  }

  useEffect(() => { if (player) load() }, [player])

  if (authLoading || !player) return null

  const top3 = scores.slice(0, 3)
  const rest = scores.slice(3)
  const myRank = scores.findIndex(s => s.username === player.username)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 60px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: 'var(--text)', letterSpacing: '0.06em', lineHeight: 1 }}>Clasificación</h1>
          {lastUpdated && <p style={{ color: 'var(--muted)', fontSize: '0.72rem', marginTop: 4 }}>Actualizado: {lastUpdated.toLocaleTimeString('es-VE')}</p>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--muted)', borderRadius: 7, padding: '7px 14px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500 }}>
            <RefreshIcon /> Actualizar
          </button>
          <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(244,197,66,0.08)', border: '1px solid rgba(244,197,66,0.2)', color: 'var(--gold)', borderRadius: 7, padding: '7px 14px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500 }}>
            <PrintIcon /> Exportar
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)', fontSize: '0.85rem' }}>Cargando...</div>
      ) : (
        <>
          {/* Podium */}
          {top3.length > 0 && (
            <div style={{ background: 'rgba(10,10,16,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '28px 20px 20px', marginBottom: 16, backdropFilter: 'blur(12px)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 12, marginBottom: 16 }}>
                {[top3[1], top3[0], top3[2]].filter(Boolean).map((p, idx) => {
                  const realIdx = idx === 0 ? 1 : idx === 1 ? 0 : 2
                  const heights = [80, 110, 60]
                  const colorIdx = scores.findIndex(s => s.username === p.username)
                  return (
                    <div key={p.username} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <div style={{ position: 'relative' }}>
                        {realIdx === 0 && (
                          <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', fontSize: '1.1rem' }}>👑</div>
                        )}
                        <div style={{ width: 52, height: 52, borderRadius: '50%', background: AVATAR_COLORS[colorIdx % AVATAR_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: 'white', boxShadow: `0 0 20px ${MEDAL_COLORS[realIdx]}30`, border: `2px solid ${MEDAL_COLORS[realIdx]}50` }}>
                          {p.username.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: realIdx === 0 ? 'var(--gold)' : 'var(--text)' }}>{p.username}</div>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: MEDAL_COLORS[realIdx], lineHeight: 1 }}>{p.pts}<span style={{ fontSize: '0.7rem', marginLeft: 2 }}>pts</span></div>
                      </div>
                      <div style={{ width: 80, height: heights[idx], background: `linear-gradient(180deg, ${MEDAL_COLORS[realIdx]}20, ${MEDAL_COLORS[realIdx]}08)`, border: `1px solid ${MEDAL_COLORS[realIdx]}30`, borderRadius: '6px 6px 0 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 8 }}>
                        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: MEDAL_COLORS[realIdx], opacity: 0.6 }}>{MEDAL_LABELS[realIdx]}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* My position highlight */}
          {myRank >= 3 && (
            <div style={{ background: 'rgba(244,197,66,0.06)', border: '1px solid rgba(244,197,66,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', color: 'var(--gold)', minWidth: 32 }}>#{myRank + 1}</span>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: AVATAR_COLORS[myRank % AVATAR_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', color: 'white' }}>
                {player.username.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontWeight: 700, color: 'var(--gold)', flex: 1 }}>{player.username} <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 400 }}>— Tu posición</span></span>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: 'var(--gold)' }}>{scores[myRank]?.pts ?? 0} pts</span>
            </div>
          )}

          {/* Full table */}
          <div style={{ background: 'rgba(10,10,16,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden', backdropFilter: 'blur(12px)', marginBottom: 20 }}>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 70px 120px 50px', gap: 0, padding: '10px 16px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>#</span>
              <span style={{ fontSize: '0.62rem', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Jugador</span>
              <span style={{ fontSize: '0.62rem', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase', textAlign: 'center' }}>Pts</span>
              <span style={{ fontSize: '0.62rem', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase', textAlign: 'center' }}>Grupos</span>
              <span style={{ fontSize: '0.62rem', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase', textAlign: 'center' }}>Camp.</span>
            </div>

            {scores.map((p, i) => {
              const isMe = p.username === player.username
              const colorIdx = i
              return (
                <div key={p.username} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 70px 120px 50px', gap: 0, padding: '12px 16px', borderBottom: i < scores.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: isMe ? 'rgba(244,197,66,0.04)' : 'none', alignItems: 'center' }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', color: i < 3 ? MEDAL_COLORS[i] : 'var(--muted)' }}>{i + 1}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: AVATAR_COLORS[colorIdx % AVATAR_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.95rem', color: 'white', flexShrink: 0 }}>
                      {p.username.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem', color: isMe ? 'var(--gold)' : 'var(--text)' }}>{p.username}</span>
                      {isMe && <span style={{ fontSize: '0.62rem', color: 'var(--gold)', background: 'rgba(244,197,66,0.1)', borderRadius: 4, padding: '1px 5px' }}>TÚ</span>}
                      {movers[p.username] > 0 && <span style={{ fontSize: '0.65rem', color: 'var(--green)', background: 'rgba(46,204,113,0.1)', borderRadius: 4, padding: '1px 5px' }}>▲{movers[p.username]}</span>}
                      {movers[p.username] < 0 && <span style={{ fontSize: '0.65rem', color: '#FF6B6B', background: 'rgba(214,40,40,0.1)', borderRadius: 4, padding: '1px 5px' }}>▼{Math.abs(movers[p.username])}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: isMe ? 'var(--gold)' : 'var(--text)' }}>{p.pts}</div>
                  <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted)' }}>
                    <span style={{ color: 'var(--gold)' }}>+3×{p.exactGroup}</span>
                    <span style={{ margin: '0 4px', opacity: 0.3 }}>·</span>
                    <span style={{ color: 'var(--blue)' }}>+1×{p.winnerGroup}</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    {p.champPts > 0
                      ? <span style={{ fontSize: '0.75rem', color: 'var(--purple)', fontWeight: 700 }}>+{p.champPts}</span>
                      : <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.15)' }}>—</span>
                    }
                  </div>
                </div>
              )
            })}
          </div>

          {/* Top favorites */}
          {favorites.length > 0 && (
            <div style={{ background: 'rgba(10,10,16,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px', backdropFilter: 'blur(12px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <TrophyIcon size={13} />
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>FAVORITAS AL TÍTULO</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {favorites.map((t, i) => (
                  <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 8, background: i === 0 ? 'rgba(244,197,66,0.08)' : 'rgba(255,255,255,0.03)', border: '1px solid ' + (i === 0 ? 'rgba(244,197,66,0.2)' : 'rgba(255,255,255,0.06)'), borderRadius: 8, padding: '8px 12px', flexShrink: 0 }}>
                    <span style={{ fontSize: '1.2rem' }}>{t.flag}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: i === 0 ? 'var(--gold)' : 'var(--text)' }}>{t.name}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>{t.count} votos · {t.pct}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
