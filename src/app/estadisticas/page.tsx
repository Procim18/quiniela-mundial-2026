'use client'
import { useEffect, useState } from 'react'
import { getGroupMatches } from '@/lib/data'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

interface Player { id: string; username: string }
interface Pred { player_id: string; match_id: string; home_score: number | null; away_score: number | null }
interface Result { match_id: string; home_score: number; away_score: number }

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

const TargetIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
const TrendIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
const StarIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const ZapIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
const HandshakeIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/></svg>
const ClipboardIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>

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
    let exact = 0, winner = 0, fail = 0, totalGoals = 0, empates = 0

    myPreds.forEach(pred => {
      const res = playedMatches.find(r => r.match_id === pred.match_id)
      if (!res) return
      const ph = pred.home_score!, pa = pred.away_score!
      const rh = res.home_score, ra = res.away_score
      totalGoals += ph + pa
      if (ph === pa) empates++
      if (ph === rh && pa === ra) exact++
      else {
        const po = ph > pa ? 'H' : pa > ph ? 'A' : 'D'
        const ro = rh > ra ? 'H' : ra > rh ? 'A' : 'D'
        if (po === ro) winner++
        else fail++
      }
    })

    const played = exact + winner + fail
    const accuracy = played > 0 ? Math.round(((exact + winner) / played) * 100) : 0
    const avgGoals = myPreds.length > 0 ? (totalGoals / myPreds.length).toFixed(1) : '0'
    const empateRate = myPreds.length > 0 ? Math.round((empates / myPreds.length) * 100) : 0
    const predCount = myPreds.length

    return { player, idx, exact, winner, fail, accuracy, avgGoals, empateRate, predCount, played }
  }).sort((a, b) => b.accuracy - a.accuracy)

  const completionStats = players.map(player => {
    const myPreds = preds.filter(p => p.player_id === player.id && p.home_score !== null && p.away_score !== null)
    return { player, count: myPreds.length, pct: Math.round((myPreds.length / matches.length) * 100) }
  }).sort((a, b) => b.count - a.count)

  if (authLoading || !authPlayer) return null

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 60px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: 'var(--text)', letterSpacing: '0.06em', lineHeight: 1 }}>Estadísticas</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: 4 }}>Análisis de predicciones de cada jugador.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)', fontSize: '0.85rem' }}>Cargando...</div>
      ) : playedMatches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(10,10,16,0.8)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ color: 'rgba(255,255,255,0.2)', marginBottom: 12 }}><TargetIcon /></div>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Las estadísticas aparecerán cuando se jueguen los primeros partidos.</p>
        </div>
      ) : (
        <>
          {/* Fun stats cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 20 }}>
            {(() => {
              const topGoals = [...stats].sort((a, b) => parseFloat(b.avgGoals) - parseFloat(a.avgGoals))[0]
              const topExact = [...stats].sort((a, b) => b.exact - a.exact)[0]
              const topEmpate = [...stats].sort((a, b) => b.empateRate - a.empateRate)[0]
              const topAccuracy = [...stats][0]
              return [
                { icon: <ZapIcon />, label: 'Más goles predice', value: topGoals?.player.username, sub: topGoals?.avgGoals + ' por partido', color: '#F4C542', border: 'rgba(244,197,66,0.2)', bg: 'rgba(244,197,66,0.05)' },
                { icon: <TargetIcon />, label: 'Más exactos', value: topExact?.player.username, sub: topExact?.exact + ' resultados exactos', color: 'var(--green)', border: 'rgba(46,204,113,0.2)', bg: 'rgba(46,204,113,0.05)' },
                { icon: <HandshakeIcon />, label: 'Más empates predice', value: topEmpate?.player.username, sub: topEmpate?.empateRate + '% de sus predicciones', color: 'var(--blue)', border: 'rgba(59,130,246,0.2)', bg: 'rgba(59,130,246,0.05)' },
                { icon: <StarIcon />, label: 'Mejor precisión', value: topAccuracy?.player.username, sub: topAccuracy?.accuracy + '% de acierto', color: 'var(--purple)', border: 'rgba(139,92,246,0.2)', bg: 'rgba(139,92,246,0.05)' },
              ].map(card => (
                <div key={card.label} style={{ background: card.bg, border: '1px solid ' + card.border, borderRadius: 12, padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <span style={{ color: card.color }}>{card.icon}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{card.label}</span>
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: card.color, lineHeight: 1, marginBottom: 3 }}>{card.value || '—'}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{card.sub}</div>
                </div>
              ))
            })()}
          </div>

          {/* Precision table */}
          <div style={{ background: 'rgba(10,10,16,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden', marginBottom: 16, backdropFilter: 'blur(12px)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--gold)' }}><TrendIcon /></span>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>PRECISIÓN POR JUGADOR</span>
            </div>
            {stats.map(({ player, idx, exact, winner, fail, accuracy, played }) => (
              <div key={player.id} style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: AVATAR_COLORS[idx % AVATAR_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.95rem', color: 'white', flexShrink: 0 }}>
                    {player.username.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', flex: 1 }}>{player.username}</span>
                  <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--gold)' }}>{exact} exactos</span>
                    <span style={{ color: 'var(--blue)' }}>{winner} ganador</span>
                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>{fail} fallos</span>
                  </div>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: accuracy >= 60 ? 'var(--green)' : accuracy >= 40 ? 'var(--gold)' : '#FF6B6B', minWidth: 52, textAlign: 'right' }}>{accuracy}%</span>
                </div>
                {played > 0 && (
                  <div style={{ display: 'flex', height: 6, borderRadius: 100, overflow: 'hidden', gap: 1 }}>
                    <div style={{ width: (exact / played * 100) + '%', background: '#C89B1A', borderRadius: '100px 0 0 100px' }} />
                    <div style={{ width: (winner / played * 100) + '%', background: '#3B82F6' }} />
                    <div style={{ width: (fail / played * 100) + '%', background: 'rgba(214,40,40,0.5)', borderRadius: '0 100px 100px 0' }} />
                  </div>
                )}
              </div>
            ))}
            <div style={{ padding: '10px 18px', display: 'flex', gap: 16, fontSize: '0.68rem', color: 'var(--muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, background: '#C89B1A', borderRadius: 2 }} /> Exacto</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, background: '#3B82F6', borderRadius: 2 }} /> Ganador</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, background: 'rgba(214,40,40,0.5)', borderRadius: 2 }} /> Fallo</span>
            </div>
          </div>

          {/* Completion */}
          <div style={{ background: 'rgba(10,10,16,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden', backdropFilter: 'blur(12px)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--gold)' }}><ClipboardIcon /></span>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>PREDICCIONES COMPLETADAS</span>
            </div>
            {completionStats.map(({ player, count, pct }, idx) => (
              <div key={player.id} style={{ padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: AVATAR_COLORS[idx % AVATAR_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.85rem', color: 'white', flexShrink: 0 }}>
                  {player.username.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.85rem', minWidth: 90 }}>{player.username}</span>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 100, height: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 100, background: pct === 100 ? 'var(--green)' : pct >= 50 ? '#C89B1A' : '#D62828', width: pct + '%', transition: 'width 0.6s' }} />
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)', minWidth: 70, textAlign: 'right' }}>{count}/{matches.length} ({pct}%)</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
