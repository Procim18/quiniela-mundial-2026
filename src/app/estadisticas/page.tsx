'use client'
import { useEffect, useState } from 'react'
import { getGroupMatches } from '@/lib/data'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

interface Player { id: string; username: string }
interface Pred { player_id: string; match_id: string; home_score: number | null; away_score: number | null }
interface Result { match_id: string; home_score: number; away_score: number }

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

export default function EstadisticasPage() {
  const { player: authPlayer, loading: authLoading } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (!authLoading && !authPlayer) router.push('/login')
  }, [authPlayer, authLoading])
  const [players, setPlayers] = useState<Player[]>([])
  const [preds, setPreds] = useState<Pred[]>([])
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
      setPreds(pr.data || [])
      setResults(rs.data || [])
      setLoading(false)
    })
  }, [])

  const playedMatches = results.filter(r => r.home_score !== null && r.away_score !== null)

  const stats = players.map((player, idx) => {
    const myPreds = preds.filter(p => p.player_id === player.id && p.home_score !== null && p.away_score !== null)
    let exact = 0, winner = 0, fail = 0, totalGoalsDiff = 0, empates = 0, totalPreds = myPreds.length

    myPreds.forEach(pred => {
      const res = playedMatches.find(r => r.match_id === pred.match_id)
      if (!res) return
      const ph = pred.home_score!, pa = pred.away_score!
      const rh = res.home_score, ra = res.away_score
      if (ph === rh && pa === ra) exact++
      else {
        const po = ph > pa ? 'H' : pa > ph ? 'A' : 'D'
        const ro = rh > ra ? 'H' : ra > rh ? 'A' : 'D'
        if (po === ro) winner++
        else fail++
      }
      totalGoalsDiff += Math.abs((ph + pa) - (rh + ra))
      if (ph === pa) empates++
    })

    const played = exact + winner + fail
    const accuracy = played > 0 ? Math.round(((exact + winner) / played) * 100) : 0
    const avgGoalDiff = played > 0 ? (totalGoalsDiff / played).toFixed(1) : '-'
    const empateRate = totalPreds > 0 ? Math.round((empates / totalPreds) * 100) : 0

    return { player, idx, exact, winner, fail, accuracy, avgGoalDiff, empateRate, totalPreds, played }
  }).sort((a, b) => b.accuracy - a.accuracy)

  const completionStats = players.map(player => {
    const myPreds = preds.filter(p => p.player_id === player.id && p.home_score !== null && p.away_score !== null)
    return { player, count: myPreds.length, pct: Math.round((myPreds.length / matches.length) * 100) }
  }).sort((a, b) => b.count - a.count)

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px 60px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: 'var(--gold)', letterSpacing: '0.06em' }}>
          Estadisticas
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 4 }}>
          Analisis detallado de las predicciones de cada jugador.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>Cargando...</div>
      ) : playedMatches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(17,17,24,0.8)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📊</div>
          <p style={{ color: 'var(--muted)' }}>Las estadisticas apareceran cuando se jueguen los primeros partidos.</p>
        </div>
      ) : (
        <>
          {/* Precision por jugador */}
          <div style={{ background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '22px 24px', marginBottom: 24, backdropFilter: 'blur(12px)' }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: 'var(--gold)', marginBottom: 20, letterSpacing: '0.06em' }}>
              🎯 Precision por Jugador
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {stats.map(({ player, idx, exact, winner, fail, accuracy, avgGoalDiff, empateRate, played }) => (
                <div key={player.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: COLORS[idx % COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.9rem', color: 'var(--dark)', flexShrink: 0 }}>
                      {player.username.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', flex: 1 }}>{player.username}</span>
                    <div style={{ display: 'flex', gap: 16, fontSize: '0.78rem' }}>
                      <span style={{ color: 'var(--gold)' }}>🎯 {exact} exactos</span>
                      <span style={{ color: 'var(--blue)' }}>✓ {winner} ganador</span>
                      <span style={{ color: '#FF6B6B' }}>✗ {fail} fallos</span>
                      <span style={{ color: 'var(--muted)' }}>~{avgGoalDiff} goles dif</span>
                    </div>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: accuracy >= 60 ? 'var(--green)' : accuracy >= 40 ? 'var(--gold)' : '#FF6B6B', minWidth: 50, textAlign: 'right' }}>{accuracy}%</span>
                  </div>
                  <div style={{ display: 'flex', height: 8, borderRadius: 100, overflow: 'hidden', gap: 2 }}>
                    {played > 0 && (
                      <>
                        <div style={{ width: (exact / played * 100) + '%', background: 'var(--gold)', borderRadius: '100px 0 0 100px', transition: 'width 0.6s' }} />
                        <div style={{ width: (winner / played * 100) + '%', background: 'var(--blue)', transition: 'width 0.6s' }} />
                        <div style={{ width: (fail / played * 100) + '%', background: '#FF6B6B', borderRadius: '0 100px 100px 0', transition: 'width 0.6s' }} />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: '0.72rem', color: 'var(--muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 10, height: 10, background: 'var(--gold)', borderRadius: 2 }} /> Exacto</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 10, height: 10, background: 'var(--blue)', borderRadius: 2 }} /> Ganador</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 10, height: 10, background: '#FF6B6B', borderRadius: 2 }} /> Fallo</span>
            </div>
          </div>

          {/* Fun stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
            {/* Mas optimista */}
            {(() => {
              const avgGoals = players.map(player => {
                const myPreds = preds.filter(p => p.player_id === player.id && p.home_score !== null && p.away_score !== null)
                const total = myPreds.reduce((s, p) => s + (p.home_score! + p.away_score!), 0)
                return { player, avg: myPreds.length > 0 ? total / myPreds.length : 0 }
              }).sort((a, b) => b.avg - a.avg)
              const top = avgGoals[0]
              return top ? (
                <div style={{ background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(244,197,66,0.2)', borderRadius: 14, padding: '18px 20px', backdropFilter: 'blur(12px)' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>⚡</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 4 }}>MAS GOLES PREDICE</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--gold)' }}>{top.player.username}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: 4 }}>{top.avg.toFixed(1)} goles por partido en promedio</div>
                </div>
              ) : null
            })()}

            {/* Mas empates predice */}
            {(() => {
              const empateStats = stats.sort((a, b) => b.empateRate - a.empateRate)[0]
              return empateStats ? (
                <div style={{ background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 14, padding: '18px 20px', backdropFilter: 'blur(12px)' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>🤝</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 4 }}>MAS EMPATES PREDICE</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--blue)' }}>{empateStats.player.username}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: 4 }}>{empateStats.empateRate}% de sus predicciones son empate</div>
                </div>
              ) : null
            })()}

            {/* Mas preciso */}
            {(() => {
              const top = [...stats].sort((a, b) => b.exact - a.exact)[0]
              return top ? (
                <div style={{ background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(46,204,113,0.2)', borderRadius: 14, padding: '18px 20px', backdropFilter: 'blur(12px)' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>🎯</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 4 }}>MAS EXACTOS</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--green)' }}>{top.player.username}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: 4 }}>{top.exact} resultados exactos</div>
                </div>
              ) : null
            })()}
          </div>

          {/* Completitud */}
          <div style={{ background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '22px 24px', backdropFilter: 'blur(12px)' }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: 'var(--gold)', marginBottom: 20, letterSpacing: '0.06em' }}>
              📋 Predicciones Completadas
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {completionStats.map(({ player, count, pct }, idx) => (
                <div key={player.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: COLORS[idx % COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.85rem', color: 'var(--dark)', flexShrink: 0 }}>
                    {player.username.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', minWidth: 100 }}>{player.username}</span>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 100, height: 8, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 100, background: pct === 100 ? 'var(--green)' : pct >= 50 ? 'var(--gold)' : '#FF6B6B', width: pct + '%', transition: 'width 0.6s' }} />
                  </div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--muted)', minWidth: 80, textAlign: 'right' }}>{count}/{matches.length} ({pct}%)</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
