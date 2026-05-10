'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { getGroupMatches } from '@/lib/data'
import Link from 'next/link'

interface Score { username: string; pts: number; exactGroup: number; winnerGroup: number; champPts: number }
interface Pred { match_id: string; home_score: number | null; away_score: number | null }
interface Result { match_id: string; home_score: number; away_score: number }

const MEDAL_COLORS = ['#F4C542', '#C0C0C0', '#CD7F32']
const AVATAR_COLORS = ['linear-gradient(135deg,#C89B1A,#F4C542)','linear-gradient(135deg,#1A4FBF,#3B82F6)','linear-gradient(135deg,#8B1A1A,#D62828)','linear-gradient(135deg,#1A7A3C,#2ECC71)','linear-gradient(135deg,#5B2C8B,#8B5CF6)','linear-gradient(135deg,#BF6B1A,#F97316)']
const TrophyIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>
const TargetIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
const StarIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const ChevronIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>

export default function PerfilPage() {
  const { player, loading: authLoading } = useAuth()
  const router = useRouter()
  const [scores, setScores] = useState<Score[]>([])
  const [preds, setPreds] = useState<Pred[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [champion, setChampion] = useState('')
  const [dataLoading, setDataLoading] = useState(true)
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
      setDataLoading(false)
    })
  }, [player])

  if (authLoading || !player) return null

  const myRank = scores.findIndex(s => s.username === player.username) + 1
  const myScore = scores.find(s => s.username === player.username)
  const myColorIdx = Math.max(0, scores.findIndex(s => s.username === player.username))
  const playedResults = results.filter(r => r.home_score !== null)
  const myPreds = preds.filter(p => p.home_score !== null && p.away_score !== null)
  const predPct = Math.round((myPreds.length / matches.length) * 100)

  let exact = 0, winnerCount = 0, fail = 0
  myPreds.forEach(pred => {
    const res = playedResults.find(r => r.match_id === pred.match_id)
    if (!res) return
    if (pred.home_score === res.home_score && pred.away_score === res.away_score) { exact++; return }
    const po = (pred.home_score ?? 0) > (pred.away_score ?? 0) ? 'H' : (pred.away_score ?? 0) > (pred.home_score ?? 0) ? 'A' : 'D'
    const ro = res.home_score > res.away_score ? 'H' : res.away_score > res.home_score ? 'A' : 'D'
    if (po === ro) winnerCount++; else fail++
  })
  const played = exact + winnerCount + fail
  const accuracy = played > 0 ? Math.round(((exact + winnerCount) / played) * 100) : 0
  const medalColor = myRank >= 1 && myRank <= 3 ? MEDAL_COLORS[myRank - 1] : null

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 16px 60px' }}>
      <div style={{ background: 'rgba(10,10,16,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ height: 3, background: medalColor ? 'linear-gradient(90deg, ' + medalColor + '80, ' + medalColor + ')' : 'linear-gradient(90deg, #1A1A2E, #2A2A4E)' }} />
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 68, height: 68, borderRadius: '50%', background: AVATAR_COLORS[myColorIdx % AVATAR_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: 'white', border: medalColor ? 2px solid ${medalColor}50 : '2px solid rgba(255,255,255,0.08)' }}>
              {player.username.charAt(0).toUpperCase()}
            </div>
            {medalColor && (
              <div style={{ position: 'absolute', bottom: -2, right: -2, width: 22, height: 22, borderRadius: '50%', background: medalColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 900, color: '#0a0a10', border: '2px solid rgba(10,10,16,0.9)' }}>
                {myRank}
              </div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: 'var(--text)', letterSpacing: '0.06em', lineHeight: 1 }}>{player.username}</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
              {myRank > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Posicion <span style={{ color: medalColor || 'var(--text)', fontWeight: 700 }}>#{myRank}</span></span>}
              {champion && <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Campeon: <span style={{ color: 'var(--purple)', fontWeight: 600 }}>{champion}</span></span>}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: medalColor || 'var(--gold)', lineHeight: 1 }}>{myScore?.pts ?? 0}</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>puntos</div>
          </div>
        </div>
      </div>

      {dataLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontSize: '0.85rem' }}>Cargando...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
            {[
              { icon: <TrophyIcon />, label: 'Posicion', value: myRank > 0 ? '#' + myRank : '—', color: medalColor || 'var(--gold)' },
              { icon: <StarIcon />, label: 'Pts totales', value: String(myScore?.pts ?? 0), color: 'var(--text)' },
              { icon: <TargetIcon />, label: 'Exactos', value: String(myScore?.exactGroup ?? 0), color: 'var(--gold)' },
              { icon: <StarIcon />, label: 'Ganadores', value: String(myScore?.winnerGroup ?? 0), color: 'var(--blue)' },
              { icon: <TargetIcon />, label: 'Precision', value: accuracy + '%', color: accuracy >= 60 ? 'var(--green)' : accuracy >= 40 ? 'var(--gold)' : '#FF6B6B' },
              { icon: <StarIcon />, label: 'Completadas', value: myPreds.length + '/' + matches.length, color: 'var(--text)' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(10,10,16,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)' }}>{s.icon}<span style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{s.label}</span></div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(10,10,16,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Predicciones completadas</span>
              <span style={{ fontSize: '0.78rem', color: predPct === 100 ? 'var(--green)' : 'var(--gold)', fontWeight: 600 }}>{myPreds.length}/{matches.length} — {predPct}%</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 100, height: 8, overflow: 'hidden', marginBottom: 10 }}>
              <div style={{ height: '100%', borderRadius: 100, background: predPct === 100 ? 'var(--green)' : predPct >= 50 ? '#C89B1A' : '#D62828', width: predPct + '%', transition: 'width 0.6s' }} />
            </div>
            {predPct < 100 && <Link href="/grupos" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--gold)' }}>Completar predicciones <ChevronIcon /></Link>}
          </div>

          {played > 0 && (
            <div style={{ background: 'rgba(10,10,16,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px', marginBottom: 16 }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Desglose de precision</div>
              <div style={{ display: 'flex', gap: 1, height: 8, borderRadius: 100, overflow: 'hidden', marginBottom: 12 }}>
                {exact > 0 && <div style={{ width: (exact/played*100)+'%', background: '#C89B1A', borderRadius: '100px 0 0 100px' }} />}
                {winnerCount > 0 && <div style={{ width: (winnerCount/played*100)+'%', background: '#3B82F6' }} />}
                {fail > 0 && <div style={{ width: (fail/played*100)+'%', background: 'rgba(214,40,40,0.6)', borderRadius: '0 100px 100px 0' }} />}
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: '0.78rem', flexWrap: 'wrap' }}>
                <span style={{ color: '#C89B1A' }}>{exact} exactos</span>
                <span style={{ color: '#3B82F6' }}>{winnerCount} ganadores</span>
                <span style={{ color: 'rgba(255,100,100,0.7)' }}>{fail} fallos</span>
                <span style={{ color: 'var(--muted)' }}>{played} jugados</span>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
            {[
              { href: '/grupos', label: 'Predicciones grupos', color: 'rgba(244,197,66,0.08)', border: 'rgba(244,197,66,0.2)', textColor: 'var(--gold)' },
              { href: '/eliminatorias', label: 'Eliminatorias', color: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', textColor: 'var(--blue)' },
              { href: '/clasificacion', label: 'Ver tabla', color: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', textColor: 'var(--muted)' },
              { href: '/estadisticas', label: 'Estadisticas', color: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)', textColor: 'var(--purple)' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: l.color, border: '1px solid ' + l.border, color: l.textColor, borderRadius: 10, padding: '12px 14px', fontSize: '0.82rem', fontWeight: 600 }}>
                {l.label} <ChevronIcon />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
