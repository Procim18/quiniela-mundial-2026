'use client'
import { useEffect, useState } from 'react'
import { GROUPS, getGroupMatches, GroupMatch } from '@/lib/data'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

interface Player { id: string; username: string }
interface Pred { player_id: string; match_id: string; home_score: number | null; away_score: number | null }
interface Result { match_id: string; home_score: number; away_score: number }

function getOutcome(h: number, a: number) {
  if (h > a) return 'H'
  if (a > h) return 'A'
  return 'D'
}

function getPoints(pred: Pred, result: Result | undefined) {
  if (!result || pred.home_score === null || pred.away_score === null) return null
  if (pred.home_score === result.home_score && pred.away_score === result.away_score) return 3
  if (getOutcome(pred.home_score, pred.away_score) === getOutcome(result.home_score, result.away_score)) return 1
  return 0
}

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

export default function PrediccionesPage() {
  const { player: authPlayer, loading: authLoading } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (!authLoading && !authPlayer) router.push('/login')
  }, [authPlayer, authLoading])
  const [activeGroup, setActiveGroup] = useState('A')
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [allPreds, setAllPreds] = useState<Pred[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)
  const matches = getGroupMatches()

  useEffect(() => {
    Promise.all([
      fetch('/api/players?t=' + Date.now(), { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/predictions/all?t=' + Date.now(), { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/results?t=' + Date.now(), { cache: 'no-store' }).then(r => r.json()),
    ]).then(([p, pr, rs]) => {
      setPlayers(p.data || [])
      setAllPreds(pr.data || [])
      setResults(rs.data || [])
      setLoading(false)
    })
  }, [])

  const groupMatches = matches.filter(m => m.group === activeGroup)

  const getMatchPreds = (matchId: string) =>
    players.map(player => ({
      player,
      pred: allPreds.find(p => p.player_id === player.id && p.match_id === matchId) || null,
    }))

  const getResult = (matchId: string) => results.find(r => r.match_id === matchId)

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px 60px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: 'var(--gold)', letterSpacing: '0.06em' }}>
          Predicciones
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 4 }}>
          Haz clic en un partido para ver lo que predijo cada jugador.
        </p>
      </div>

      {/* Group tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 24, paddingBottom: 4 }}>
        {Object.keys(GROUPS).map(g => (
          <button key={g} onClick={() => { setActiveGroup(g); setExpandedMatch(null) }} style={{
            flexShrink: 0,
            background: activeGroup === g ? 'rgba(244,197,66,0.15)' : 'rgba(17,17,24,0.8)',
            border: '1px solid ' + (activeGroup === g ? 'rgba(244,197,66,0.5)' : 'rgba(255,255,255,0.08)'),
            borderRadius: 10, padding: '8px 14px', cursor: 'pointer',
            color: activeGroup === g ? 'var(--gold)' : 'var(--muted)',
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', letterSpacing: '0.06em',
          }}>
            Grupo {g}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>Cargando...</div>
      ) : (
        groupMatches.map(match => {
          const res = getResult(match.id)
          const isExpanded = expandedMatch === match.id
          const matchPreds = getMatchPreds(match.id)
          const predCount = matchPreds.filter(mp => mp.pred !== null).length

          return (
            <div key={match.id} style={{ marginBottom: 10 }}>
              {/* Match row - clickable */}
              <div onClick={() => setExpandedMatch(isExpanded ? null : match.id)}
                style={{
                  background: isExpanded ? 'rgba(244,197,66,0.08)' : 'rgba(17,17,24,0.8)',
                  border: '1px solid ' + (isExpanded ? 'rgba(244,197,66,0.3)' : 'rgba(255,255,255,0.07)'),
                  borderRadius: isExpanded ? '14px 14px 0 0' : 14,
                  padding: '14px 18px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 12,
                  backdropFilter: 'blur(12px)',
                  transition: 'all 0.2s',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                  <span style={{ fontSize: '1.3rem' }}>{match.home.flag}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{match.home.name}</span>
                </div>

                {res ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <div style={{ width: 36, height: 36, background: 'rgba(244,197,66,0.12)', border: '1px solid rgba(244,197,66,0.35)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: 'var(--gold)' }}>{res.home_score}</div>
                    <span style={{ color: 'var(--muted)', fontFamily: "'Bebas Neue', sans-serif" }}>-</span>
                    <div style={{ width: 36, height: 36, background: 'rgba(244,197,66,0.12)', border: '1px solid rgba(244,197,66,0.35)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: 'var(--gold)' }}>{res.away_score}</div>
                  </div>
                ) : (
                  <div style={{ flexShrink: 0, fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.9rem', color: 'var(--muted)', padding: '0 12px' }}>VS</div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{match.away.name}</span>
                  <span style={{ fontSize: '1.3rem' }}>{match.away.flag}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '3px 8px' }}>
                    {predCount}/{players.length} predicciones
                  </span>
                  <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expanded predictions */}
              {isExpanded && (
                <div style={{ background: 'rgba(17,17,24,0.7)', border: '1px solid rgba(244,197,66,0.2)', borderTop: 'none', borderRadius: '0 0 14px 14px', padding: '16px 18px', backdropFilter: 'blur(12px)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
                    Predicciones · {match.stadium}, {match.city} · {match.time} hs
                  </div>

                  {players.length === 0 ? (
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No hay jugadores registrados aun.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {matchPreds.map(({ player, pred }, idx) => {
                        const pts = pred ? getPoints(pred, res) : null
                        return (
                          <div key={player.id} style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 14px',
                            border: '1px solid ' + (pts === 3 ? 'rgba(244,197,66,0.25)' : pts === 1 ? 'rgba(59,130,246,0.2)' : pts === 0 ? 'rgba(214,40,40,0.15)' : 'rgba(255,255,255,0.05)'),
                          }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: COLORS[idx % COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.9rem', color: 'var(--dark)', flexShrink: 0 }}>
                              {player.username.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '0.88rem', minWidth: 80 }}>{player.username}</span>
                            {pred && pred.home_score !== null && pred.away_score !== null ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: 'var(--text)' }}>{pred.home_score}</div>
                                <span style={{ color: 'var(--muted)', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.9rem' }}>-</span>
                                <div style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: 'var(--text)' }}>{pred.away_score}</div>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>Sin prediccion</span>
                            )}
                            {pts !== null && (
                              <span style={{ marginLeft: 'auto', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.95rem', color: pts === 3 ? 'var(--gold)' : pts === 1 ? 'var(--blue)' : 'var(--muted)', background: pts === 3 ? 'rgba(244,197,66,0.12)' : pts === 1 ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '3px 10px' }}>
                                {pts === 3 ? '+3 pts' : pts === 1 ? '+1 pt' : '0 pts'}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
