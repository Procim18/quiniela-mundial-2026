'use client'
import { useEffect, useState } from 'react'
import { GROUPS, getGroupMatches, GroupMatch } from '@/lib/data'
import { ALL_KNOCKOUT_ROUNDS, KnockoutMatch } from '@/lib/knockout'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

interface Player { id: string; username: string }
interface Pred { player_id: string; match_id: string; home_score: number | null; away_score: number | null }
interface Result { match_id: string; home_score: number; away_score: number }
interface KnockPred { player_id: string; match_id: string; home_team: string; away_team: string; home_score: number | null; away_score: number | null; winner: string }
interface KnockResult { match_id: string; home_team: string; away_team: string; home_score: number | null; away_score: number | null; winner: string }

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

const ChevronIcon = ({ up }: { up?: boolean }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points={up ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
  </svg>
)

const PinIcon = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>

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

export default function PrediccionesPage() {
  const { player: authPlayer, loading: authLoading } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (!authLoading && !authPlayer) router.push('/login')
  }, [authPlayer, authLoading])

  const [activeTab, setActiveTab] = useState<'grupos' | 'eliminatorias' | 'fecha'>('grupos')
  const [activeGroup, setActiveGroup] = useState('A')
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [allPreds, setAllPreds] = useState<Pred[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [knockPreds, setKnockPreds] = useState<KnockPred[]>([])
  const [knockResults, setKnockResults] = useState<KnockResult[]>([])
  const [loading, setLoading] = useState(true)
  const [scorerPreds, setScorerPreds] = useState<{player_id: string; scorer_name: string}[]>([])
  const [scorerResult, setScorerResult] = useState('')
  const matches = getGroupMatches()

  useEffect(() => {
    Promise.all([
      fetch('/api/players?t=' + Date.now(), { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/predictions/all?t=' + Date.now(), { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/results?t=' + Date.now(), { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/knockout?type=results&t=' + Date.now(), { cache: 'no-store' }).then(r => r.json()),
    ]).then(([p, pr, rs, kr]) => {
      setPlayers(p.data || [])
      setAllPreds(pr.data || [])
      setResults(rs.data || [])
      setKnockResults(kr.data || [])
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    const loadScorer = () => {
      fetch('/api/predictions/scorer/all?t=' + Date.now()).then(r => r.json()).then(({ data }) => setScorerPreds(data || []))
      fetch('/api/results/scorer?t=' + Date.now()).then(r => r.json()).then(({ data }) => { if (data?.scorer_name) setScorerResult(data.scorer_name) })
    }
    loadScorer()
    const t = setInterval(loadScorer, 8000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!authPlayer) return
    fetch('/api/knockout?type=predictions&player_id=' + authPlayer.id + '&t=' + Date.now(), { cache: 'no-store' })
      .then(r => r.json()).then(({ data }) => setKnockPreds(data || []))
  }, [authPlayer])

  const groupMatches = matches.filter(m => m.group === activeGroup)
  const getMatchPreds = (matchId: string) => players.map(player => ({ player, pred: allPreds.find(p => p.player_id === player.id && p.match_id === matchId) || null }))
  const getResult = (matchId: string) => results.find(r => r.match_id === matchId)

  if (authLoading || !authPlayer) return null

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px 60px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: 'var(--text)', letterSpacing: '0.06em', lineHeight: 1 }}>Predicciones</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: 4 }}>Haz clic en un partido para ver lo que predijo cada jugador.</p>
      </div>

      {/* Goleador section */}
      {scorerPreds.length > 0 && (
        <div style={{ background: 'rgba(10,10,16,0.8)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 12, padding: '16px 18px', marginBottom: 16, backdropFilter: 'blur(12px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/></svg>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.95rem', color: 'var(--purple)', letterSpacing: '0.1em' }}>GOLEADOR DEL TORNEO</span>
            {scorerResult && <span style={{ fontSize: '0.7rem', color: 'var(--green)', background: 'rgba(46,204,113,0.1)', borderRadius: 5, padding: '2px 8px', border: '1px solid rgba(46,204,113,0.2)' }}>Resultado: {scorerResult}</span>}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {players.map((player, idx) => {
              const pred = scorerPreds.find(s => s.player_id === player.id)
              const isCorrect = scorerResult && pred?.scorer_name === scorerResult
              return (
                <div key={player.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: isCorrect ? 'rgba(46,204,113,0.08)' : 'rgba(255,255,255,0.03)', border: '1px solid ' + (isCorrect ? 'rgba(46,204,113,0.25)' : 'rgba(255,255,255,0.07)'), borderRadius: 8, padding: '8px 12px' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: AVATAR_COLORS[idx % AVATAR_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.8rem', color: 'white', flexShrink: 0 }}>
                    {player.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: isCorrect ? 'var(--green)' : 'var(--text)' }}>{player.username}</div>
                    <div style={{ fontSize: '0.7rem', color: pred ? (isCorrect ? 'var(--green)' : 'var(--muted)') : 'rgba(255,255,255,0.2)', fontStyle: pred ? 'normal' : 'italic' }}>
                      {pred ? pred.scorer_name : 'Sin predicción'}
                      {isCorrect && ' +10pts'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Main tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {([['grupos', 'Grupos'], ['eliminatorias', 'Eliminatorias'], ['fecha', 'Por Fecha']] as [string, string][]).map(([tab, label]) => (
          <button key={tab} onClick={() => { setActiveTab(tab as any); setExpandedMatch(null) }} style={{
            background: activeTab === tab ? 'rgba(244,197,66,0.1)' : 'rgba(255,255,255,0.03)',
            border: '1px solid ' + (activeTab === tab ? 'rgba(244,197,66,0.4)' : 'rgba(255,255,255,0.07)'),
            borderRadius: 7, padding: '7px 16px', cursor: 'pointer',
            color: activeTab === tab ? 'var(--gold)' : 'var(--muted)',
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.9rem', letterSpacing: '0.06em',
          }}>{label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontSize: '0.85rem' }}>Cargando...</div>
      ) : activeTab === 'grupos' ? (
        <>
          {/* Group tabs */}
          <div style={{ display: 'flex', gap: 4, overflowX: 'auto', marginBottom: 14, paddingBottom: 2, scrollbarWidth: 'none' }}>
            {Object.keys(GROUPS).map(g => (
              <button key={g} onClick={() => { setActiveGroup(g); setExpandedMatch(null) }} style={{
                flexShrink: 0,
                background: activeGroup === g ? 'rgba(244,197,66,0.1)' : 'rgba(255,255,255,0.03)',
                border: '1px solid ' + (activeGroup === g ? 'rgba(244,197,66,0.4)' : 'rgba(255,255,255,0.07)'),
                borderRadius: 7, padding: '6px 12px', cursor: 'pointer',
                color: activeGroup === g ? 'var(--gold)' : 'var(--muted)',
                fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.85rem', letterSpacing: '0.06em',
              }}>Grupo {g}</button>
            ))}
          </div>

          {groupMatches.map(match => {
            const res = getResult(match.id)
            const isExpanded = expandedMatch === match.id
            const matchPreds = getMatchPreds(match.id)
            const predCount = matchPreds.filter(mp => mp.pred?.home_score !== null && mp.pred?.away_score !== null).length

            return (
              <div key={match.id} style={{ marginBottom: 8 }}>
                <div onClick={() => setExpandedMatch(isExpanded ? null : match.id)} style={{
                  background: isExpanded ? 'rgba(10,10,16,0.95)' : 'rgba(10,10,16,0.8)',
                  border: '1px solid ' + (isExpanded ? 'rgba(244,197,66,0.25)' : 'rgba(255,255,255,0.07)'),
                  borderRadius: isExpanded ? '10px 10px 0 0' : 10,
                  padding: '12px 16px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 12,
                  backdropFilter: 'blur(12px)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                    <span style={{ fontSize: '1.2rem' }}>{match.home.flag}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{match.home.name}</span>
                  </div>
                  {res ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                      <div style={{ width: 32, height: 32, background: 'rgba(244,197,66,0.1)', border: '1px solid rgba(244,197,66,0.3)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', color: 'var(--gold)' }}>{res.home_score}</div>
                      <span style={{ color: 'rgba(255,255,255,0.2)', fontFamily: "'Bebas Neue', sans-serif" }}>:</span>
                      <div style={{ width: 32, height: 32, background: 'rgba(244,197,66,0.1)', border: '1px solid rgba(244,197,66,0.3)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', color: 'var(--gold)' }}>{res.away_score}</div>
                    </div>
                  ) : (
                    <div style={{ flexShrink: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', padding: '0 8px', fontWeight: 600 }}>VS</div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{match.away.name}</span>
                    <span style={{ fontSize: '1.2rem' }}>{match.away.flag}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--muted)', background: 'rgba(255,255,255,0.04)', borderRadius: 5, padding: '2px 7px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {predCount}/{players.length}
                    </span>
                    <span style={{ color: 'var(--muted)' }}><ChevronIcon up={isExpanded} /></span>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ background: 'rgba(6,6,10,0.95)', border: '1px solid rgba(244,197,66,0.15)', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '14px 16px', backdropFilter: 'blur(12px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                      <PinIcon /> {match.date} · {match.stadium}, {match.city} · {match.time} ET
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {matchPreds.map(({ player, pred }, idx) => {
                        const pts = pred?.home_score !== null && pred?.away_score !== null ? getPoints(pred as Pred, res) : null
                        const hasPred = pred?.home_score !== null && pred?.away_score !== null
                        return (
                          <div key={player.id} style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            background: pts === 3 ? 'rgba(244,197,66,0.06)' : pts === 1 ? 'rgba(59,130,246,0.06)' : pts === 0 ? 'rgba(214,40,40,0.04)' : 'rgba(255,255,255,0.02)',
                            borderRadius: 8, padding: '9px 12px',
                            border: '1px solid ' + (pts === 3 ? 'rgba(244,197,66,0.2)' : pts === 1 ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)'),
                          }}>
                            <div style={{ width: 30, height: 30, borderRadius: '50%', background: AVATAR_COLORS[idx % AVATAR_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.88rem', color: 'white', flexShrink: 0 }}>
                              {player.username.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '0.85rem', minWidth: 80 }}>{player.username}</span>
                            {hasPred && pred ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <div style={{ width: 30, height: 30, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem' }}>{pred.home_score}</div>
                                <span style={{ color: 'rgba(255,255,255,0.2)', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.85rem' }}>:</span>
                                <div style={{ width: 30, height: 30, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem' }}>{pred.away_score}</div>
                              </div>
                            ) : (
                              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.78rem', fontStyle: 'italic' }}>Sin prediccion</span>
                            )}
                            {pts !== null && (
                              <span style={{ marginLeft: 'auto', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.88rem', color: pts === 3 ? 'var(--gold)' : pts === 1 ? 'var(--blue)' : 'rgba(255,255,255,0.2)', background: pts === 3 ? 'rgba(244,197,66,0.1)' : pts === 1 ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.04)', borderRadius: 5, padding: '2px 8px' }}>
                                {pts > 0 ? '+' + pts : '0'}pts
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </>
      ) : activeTab === 'fecha' ? (
        <div>
          {(() => {
            const allMatches = matches
            const byDate: Record<string, typeof allMatches> = {}
            allMatches.forEach(m => {
              const d = m.date || 'Sin fecha'
              if (!byDate[d]) byDate[d] = []
              byDate[d].push(m)
            })
            return Object.entries(byDate).sort((a, b) => {
              const months: Record<string, number> = { 'Jun': 6, 'Jul': 7 }
              const [da, ma] = a[0].split(' ')
              const [db, mb] = b[0].split(' ')
              return (months[ma] * 100 + parseInt(da)) - (months[mb] * 100 + parseInt(db))
            }).map(([date, dateMatches]) => (
              <div key={date} style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ height: 1, width: 20, background: 'rgba(244,197,66,0.3)' }} />
                  {date}
                  <div style={{ height: 1, flex: 1, background: 'rgba(244,197,66,0.15)' }} />
                </div>
                {dateMatches.map(match => {
                  const res = getResult(match.id)
                  const isExpanded = expandedMatch === match.id
                  const matchPreds = getMatchPreds(match.id)
                  const predCount = matchPreds.filter(mp => mp.pred?.home_score !== null && mp.pred?.away_score !== null).length
                  return (
                    <div key={match.id} style={{ marginBottom: 6 }}>
                      <div onClick={() => setExpandedMatch(isExpanded ? null : match.id)} style={{ background: isExpanded ? 'rgba(10,10,16,0.95)' : 'rgba(10,10,16,0.8)', border: '1px solid ' + (isExpanded ? 'rgba(244,197,66,0.25)' : 'rgba(255,255,255,0.07)'), borderRadius: isExpanded ? '10px 10px 0 0' : 10, padding: '11px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--muted)', background: 'rgba(255,255,255,0.04)', borderRadius: 4, padding: '2px 6px', border: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>Grupo {match.group}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                          <span style={{ fontSize: '1.1rem' }}>{match.home.flag}</span>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{match.home.name}</span>
                        </div>
                        {res ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                            <div style={{ width: 28, height: 28, background: 'rgba(244,197,66,0.1)', border: '1px solid rgba(244,197,66,0.3)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', color: 'var(--gold)' }}>{res.home_score}</div>
                            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>:</span>
                            <div style={{ width: 28, height: 28, background: 'rgba(244,197,66,0.1)', border: '1px solid rgba(244,197,66,0.3)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', color: 'var(--gold)' }}>{res.away_score}</div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)', padding: '0 6px' }}>{match.time} ET</span>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'flex-end' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{match.away.name}</span>
                          <span style={{ fontSize: '1.1rem' }}>{match.away.flag}</span>
                        </div>
                        <span style={{ fontSize: '0.68rem', color: 'var(--muted)', background: 'rgba(255,255,255,0.04)', borderRadius: 5, padding: '2px 7px', border: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>{predCount}/{players.length}</span>
                        <span style={{ color: 'var(--muted)', flexShrink: 0 }}><ChevronIcon up={isExpanded} /></span>
                      </div>
                      {isExpanded && (
                        <div style={{ background: 'rgba(6,6,10,0.95)', border: '1px solid rgba(244,197,66,0.15)', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                            <PinIcon /> {match.stadium}, {match.city} · {match.time} ET
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {matchPreds.map(({ player, pred }, idx) => {
                              const pts = pred?.home_score !== null && pred?.away_score !== null ? getPoints(pred as Pred, res) : null
                              const hasPred = pred?.home_score !== null && pred?.away_score !== null
                              return (
                                <div key={player.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: pts === 3 ? 'rgba(244,197,66,0.06)' : pts === 1 ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.02)', borderRadius: 8, padding: '9px 12px', border: '1px solid ' + (pts === 3 ? 'rgba(244,197,66,0.2)' : pts === 1 ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)') }}>
                                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: AVATAR_COLORS[idx % AVATAR_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.85rem', color: 'white', flexShrink: 0 }}>{player.username.charAt(0).toUpperCase()}</div>
                                  <span style={{ fontWeight: 600, fontSize: '0.85rem', minWidth: 80 }}>{player.username}</span>
                                  {hasPred && pred ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <div style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem' }}>{pred.home_score}</div>
                                      <span style={{ color: 'rgba(255,255,255,0.2)' }}>:</span>
                                      <div style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem' }}>{pred.away_score}</div>
                                    </div>
                                  ) : <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.78rem', fontStyle: 'italic' }}>Sin prediccion</span>}
                                  {pts !== null && <span style={{ marginLeft: 'auto', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.85rem', color: pts === 3 ? 'var(--gold)' : pts === 1 ? 'var(--blue)' : 'rgba(255,255,255,0.2)', background: pts === 3 ? 'rgba(244,197,66,0.1)' : pts === 1 ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.04)', borderRadius: 5, padding: '2px 7px' }}>{pts > 0 ? '+' + pts : '0'}pts</span>}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))
          })()}
        </div>
      ) : (
        <div>
          {ALL_KNOCKOUT_ROUNDS.map(round => (
            <div key={round.id} style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ height: 1, flex: 1, background: 'rgba(255,255,255,0.06)' }} />
                {round.label}
                <div style={{ height: 1, flex: 1, background: 'rgba(255,255,255,0.06)' }} />
              </div>
              {round.matches.map((match: KnockoutMatch) => {
                const res = knockResults.find(r => r.match_id === match.id)
                const matchPreds = players.map(player => ({ player, pred: knockPreds.find(p => p.player_id === player.id && p.match_id === match.id) || null }))
                const predCount = matchPreds.filter(mp => mp.pred?.winner).length
                const isExpanded = expandedMatch === match.id

                return (
                  <div key={match.id} style={{ marginBottom: 6 }}>
                    <div onClick={() => setExpandedMatch(isExpanded ? null : match.id)} style={{
                      background: isExpanded ? 'rgba(10,10,16,0.95)' : 'rgba(10,10,16,0.8)',
                      border: '1px solid ' + (isExpanded ? 'rgba(244,197,66,0.25)' : 'rgba(255,255,255,0.07)'),
                      borderRadius: isExpanded ? '10px 10px 0 0' : 10,
                      padding: '11px 16px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 700, fontFamily: "'Bebas Neue', sans-serif", minWidth: 30 }}>{match.label}</span>
                      <div style={{ flex: 1, fontSize: '0.85rem', fontWeight: 600 }}>
                        {res?.home_team ? (
                          <span>{res.home_team} {res.home_score !== null ? res.home_score + ':' + res.away_score : 'vs'} {res.away_team}</span>
                        ) : (
                          <span style={{ color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>{match.homeDesc} vs {match.awayDesc}</span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--muted)', background: 'rgba(255,255,255,0.04)', borderRadius: 5, padding: '2px 7px', border: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                        {predCount}/{players.length}
                      </span>
                      <span style={{ color: 'var(--muted)', flexShrink: 0 }}><ChevronIcon up={isExpanded} /></span>
                    </div>

                    {isExpanded && (
                      <div style={{ background: 'rgba(6,6,10,0.95)', border: '1px solid rgba(244,197,66,0.15)', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {matchPreds.map(({ player, pred }, idx) => (
                            <div key={player.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: '9px 12px', border: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' }}>
                              <div style={{ width: 30, height: 30, borderRadius: '50%', background: AVATAR_COLORS[idx % AVATAR_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.88rem', color: 'white', flexShrink: 0 }}>
                                {player.username.charAt(0).toUpperCase()}
                              </div>
                              <span style={{ fontWeight: 600, fontSize: '0.85rem', minWidth: 80 }}>{player.username}</span>
                              {pred?.home_team ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontSize: '0.82rem' }}>
                                  <span>{pred.home_team}</span>
                                  {pred.home_score !== null && <span style={{ color: 'var(--gold)', fontFamily: "'Bebas Neue', sans-serif" }}>{pred.home_score}:{pred.away_score}</span>}
                                  <span>{pred.away_team}</span>
                                  {pred.winner && <span style={{ fontSize: '0.7rem', color: 'var(--green)', background: 'rgba(46,204,113,0.08)', borderRadius: 4, padding: '1px 6px' }}>→ {pred.winner}</span>}
                                </div>
                              ) : (
                                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.78rem', fontStyle: 'italic' }}>Sin prediccion</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
