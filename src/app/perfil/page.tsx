'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { getGroupMatches } from '@/lib/data'
import Link from 'next/link'

interface Score { username: string; pts: number; exactGroup: number; winnerGroup: number; exactKnockout: number; winnerKnockout: number; champPts: number }
interface Pred { match_id: string; home_score: number | null; away_score: number | null }
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

export default function PerfilPage() {
  const { player, loading: authLoading } = useAuth()
  const router = useRouter()
  const [scores, setScores] = useState<Score[]>([])
  const [preds, setPreds] = useState<Pred[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [champion, setChampion] = useState('')
  const [loading, setLoading] = useState(true)
  const matches = getGroupMatches()

  useEffect(() => {
    if (!authLoading && !player) router.push('/login')
  }, [player, authLoading])

  useEffect(() => {
    if (!player) return
    Promise.all([
      fetch('/api/leaderboard?t=' + Date.now(), { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/predictions?player_id=' + player.id + '&t=' + Date.now(), { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/results?t=' + Date.now(), { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/predictions/champion?player_id=' + player.id).then(r => r.json()),
    ]).then(([lb, pr, rs, ch]) => {
      setScores(lb.data || [])
      setPreds(pr.data || [])
      setResults(rs.data || [])
      if (ch.data?.[0]) setChampion(ch.data[0].team)
      setLoading(false)
    })
  }, [player])

  if (authLoading || !player) return null

  const myScore = scores.find(s => s.username === player.username)
  const myRank = scores.findIndex(s => s.username === player.username) + 1
  const myColorIdx = scores.findIndex(s => s.username === player.username)

  const playedMatches = results.filter(r => r.home_score !== null)
  const myPreds = preds.filter(p => p.home_score !== null && p.away_score !== null)
  const predCount = myPreds.length
  const predPct = Math.round((predCount / matches.length) * 100)

  let exact = 0, winner = 0, fail = 0
  myPreds.forEach(pred => {
    const res = playedMatches.find(r => r.match_id === pred.match_id)
    if (!res) return
    if (pred.home_score === res.home_score && pred.away_score === res.away_score) exact++
    else {
      const po = pred.home_score! > pred.away_score! ? 'H' : pred.away_score! > pred.home_score! ? 'A' : 'D'
      const ro = res.home_score > res.away_score ? 'H' : res.away_score > res.home_score ? 'A' : 'D'
      if (po === ro) winner++
      else fail++
    }
  })
  const played = exact + winner + fail
  const accuracy = played > 0 ? Math.round(((exact + winner) / played) * 100) : 0

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 60px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32, background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(244,197,66,0.15)', borderRadius: 20, padding: '24px', backdropFilter: 'blur(12px)' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: COLORS[myColorIdx % COLORS.length] || COLORS[0], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: 'var(--dark)', flexShrink: 0, boxShadow: '0 0 24px rgba(244,197,66,0.2)' }}>
          {player.username.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: 'var(--gold)', letterSpacing: '0.06em', lineHeight: 1 }}>{player.username}</h1>
          {myRank > 0 && (
            <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                Posicion: <span style={{ color: 'var(--gold)', fontWeight: 700 }}>#{myRank}</span>
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                Puntos: <span style={{ color: 'var(--text)', fontWeight: 700 }}>{myScore?.pts ?? 0}</span>
              </span>
              {champion && (
                <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                  Campeon elegido: <span style={{ color: 'var(--purple)', fontWeight: 700 }}>{champion}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>Cargando...</div>
      ) : (
        <>
          {/* Stats cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Posicion', value: myRank > 0 ? '#' + myRank : '-', color: 'var(--gold)', bg: 'rgba(244,197,66,0.08)', border: 'rgba(244,197,66,0.2)' },
              { label: 'Puntos totales', value: String(myScore?.pts ?? 0), color: 'var(--text)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)' },
              { label: 'Exactos grupos', value: String(myScore?.exactGroup ?? 0), color: 'var(--gold)', bg: 'rgba(244,197,66,0.06)', border: 'rgba(244,197,66,0.15)' },
              { label: 'Ganadores', value: String(myScore?.winnerGroup ?? 0), color: 'var(--blue)', bg: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.15)' },
              { label: 'Precision', value: accuracy + '%', color: accuracy >= 60 ? 'var(--green)' : accuracy >= 40 ? 'var(--gold)' : '#FF6B6B', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)' },
              { label: 'Predicciones', value: predCount + '/' + matches.length, color: 'var(--text)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)' },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, border: '1px solid ' + s.border, borderRadius: 14, padding: '16px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{ background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px', marginBottom: 24, backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Predicciones completadas</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--gold)' }}>{predCount}/{matches.length} ({predPct}%)</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 100, height: 10, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 100, background: predPct === 100 ? 'var(--green)' : predPct >= 50 ? 'var(--gold)' : '#FF6B6B', width: predPct + '%', transition: 'width 0.6s' }} />
            </div>
            {predPct < 100 && (
              <p style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: 8 }}>
                Te faltan {matches.length - predCount} predicciones por completar.{' '}
                <Link href="/grupos" style={{ color: 'var(--gold)' }}>Ir a completarlas →</Link>
              </p>
            )}
          </div>

          {/* Accuracy breakdown */}
          {played > 0 && (
            <div style={{ background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px', marginBottom: 24, backdropFilter: 'blur(12px)' }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: 'var(--gold)', marginBottom: 16, letterSpacing: '0.06em' }}>Desglose de precision</h2>
              <div style={{ display: 'flex', gap: 2, height: 12, borderRadius: 100, overflow: 'hidden', marginBottom: 12 }}>
                {exact > 0 && <div style={{ width: (exact/played*100)+'%', background: 'var(--gold)' }} />}
                {winner > 0 && <div style={{ width: (winner/played*100)+'%', background: 'var(--blue)' }} />}
                {fail > 0 && <div style={{ width: (fail/played*100)+'%', background: '#FF6B6B' }} />}
              </div>
              <div style={{ display: 'flex', gap: 20, fontSize: '0.82rem', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--gold)' }}>🎯 {exact} exactos</span>
                <span style={{ color: 'var(--blue)' }}>✓ {winner} ganador</span>
                <span style={{ color: '#FF6B6B' }}>✗ {fail} fallos</span>
                <span style={{ color: 'var(--muted)' }}>{played} partidos jugados</span>
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/grupos" style={{ background: 'rgba(244,197,66,0.1)', border: '1px solid rgba(244,197,66,0.3)', color: 'var(--gold)', borderRadius: 10, padding: '10px 18px', fontSize: '0.88rem', fontWeight: 600 }}>
              ⚽ Mis predicciones grupos
            </Link>
            <Link href="/eliminatorias" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: 'var(--blue)', borderRadius: 10, padding: '10px 18px', fontSize: '0.88rem', fontWeight: 600 }}>
              🏆 Mis predicciones eliminatorias
            </Link>
            <Link href="/clasificacion" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--muted)', borderRadius: 10, padding: '10px 18px', fontSize: '0.88rem', fontWeight: 600 }}>
              📊 Ver tabla
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
