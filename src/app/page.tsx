'use client'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { DEADLINES } from '@/lib/data'
import { useEffect, useState, useRef } from 'react'

function CountdownTimer({ target }: { target: Date }) {
  const [diff, setDiff] = useState(0)
  useEffect(() => {
    const update = () => setDiff(Math.max(0, target.getTime() - Date.now()))
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [target])
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
      {[{ v: d, l: 'DIAS' }, { v: h, l: 'HRS' }, { v: m, l: 'MIN' }, { v: s, l: 'SEG' }].map(({ v, l }) => (
        <div key={l} style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 6vw, 3.5rem)', color: 'var(--gold)', lineHeight: 1, textShadow: '0 0 30px rgba(244,197,66,0.5)', minWidth: 64, background: 'rgba(17,17,24,0.8)', borderRadius: 12, padding: '8px 16px', border: '1px solid rgba(244,197,66,0.2)' }}>
            {String(v).padStart(2, '0')}
          </div>
          <div style={{ fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.2em', marginTop: 6 }}>{l}</div>
        </div>
      ))}
    </div>
  )
}

function Particles() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: Math.random() * 3 + 1 + 'px',
          height: Math.random() * 3 + 1 + 'px',
          background: i % 3 === 0 ? 'var(--gold)' : i % 3 === 1 ? '#FF0000' : '#fff',
          borderRadius: '50%',
          left: Math.random() * 100 + '%',
          top: Math.random() * 100 + '%',
          opacity: Math.random() * 0.4 + 0.1,
          animation: `floatUp ${Math.random() * 10 + 8}s linear ${Math.random() * 8}s infinite`,
        }} />
      ))}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.4; }
          90% { opacity: 0.2; }
          100% { transform: translateY(-10vh) rotate(720deg); opacity: 0; }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes glowPulse {
          0%, 100% { text-shadow: 0 0 20px rgba(244,197,66,0.3), 0 0 40px rgba(244,197,66,0.1); }
          50% { text-shadow: 0 0 40px rgba(244,197,66,0.6), 0 0 80px rgba(244,197,66,0.3), 0 0 120px rgba(255,0,0,0.2); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(244,197,66,0.2); box-shadow: 0 0 0 0 rgba(244,197,66,0); }
          50% { border-color: rgba(244,197,66,0.5); box-shadow: 0 0 20px 2px rgba(244,197,66,0.15); }
        }
        @keyframes trophyBounce {
          0%, 100% { transform: translateY(0) rotate(-2deg); filter: drop-shadow(0 0 20px rgba(244,197,66,0.4)); }
          25% { transform: translateY(-12px) rotate(2deg); filter: drop-shadow(0 0 40px rgba(244,197,66,0.7)); }
          75% { transform: translateY(-6px) rotate(-1deg); filter: drop-shadow(0 0 30px rgba(244,197,66,0.5)); }
        }
        @keyframes nikeStripe {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}

export default function HomePage() {
  const { player } = useAuth()
  const [visible, setVisible] = useState(false)
  const daysLeft = Math.max(0, Math.ceil((DEADLINES.grupos.getTime() - Date.now()) / 86400000))
  const isPast = Date.now() > DEADLINES.grupos.getTime()

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  return (
    <div style={{ minHeight: '92vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <Particles />

      {/* Glow orbs */}
      <div style={{ position: 'fixed', top: '20%', left: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(244,197,66,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', animation: 'glowPulse 4s ease-in-out infinite' }} />
      <div style={{ position: 'fixed', bottom: '20%', right: '10%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(255,0,0,0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', animation: 'glowPulse 5s ease-in-out 1s infinite' }} />

      <div style={{ position: 'relative', zIndex: 1, opacity: visible ? 1 : 0, transition: 'opacity 0.8s ease' }}>

        {/* Trophy */}
        <div style={{ fontSize: 'clamp(4rem, 10vw, 7rem)', animation: 'trophyBounce 3s ease-in-out infinite', marginBottom: 20, display: 'inline-block' }}>🏆</div>

        {/* Title */}
        <div style={{ animation: 'slideUp 0.8s ease 0.2s both' }}>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(4rem, 14vw, 9rem)',
            letterSpacing: '0.02em',
            background: 'linear-gradient(135deg, #C89B1A 0%, #F4C542 25%, #fff 50%, #F4C542 75%, #FF0000 100%)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', lineHeight: 0.9, marginBottom: 0,
            animation: 'gradientShift 4s ease infinite',
          }}>
            QUINIELA
          </h1>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(3rem, 10vw, 6.5rem)',
            letterSpacing: '0.08em',
            background: 'linear-gradient(135deg, #fff 0%, #F4C542 50%, #C89B1A 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', lineHeight: 1, marginBottom: 4,
          }}>
            MUNDIAL 2026
          </h1>
        </div>

        {/* Stripe */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, transparent, var(--gold), #FF0000, var(--gold), transparent)', backgroundSize: '200% 100%', animation: 'nikeStripe 2s linear infinite', marginBottom: 16, borderRadius: 2 }} />

        {/* Subtitle */}
        <div style={{ animation: 'slideUp 0.8s ease 0.4s both' }}>
          <p style={{ color: 'var(--muted)', fontSize: 'clamp(0.75rem, 2vw, 0.95rem)', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 6 }}>
            USA · Canada · Mexico
          </p>
          <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(244,197,66,0.2)', borderRadius: 100, padding: '6px 20px', fontSize: '0.8rem', color: 'var(--gold)', marginBottom: 32, backdropFilter: 'blur(10px)', animation: 'borderGlow 3s ease-in-out infinite' }}>
            🇺🇸 🇨🇦 🇲🇽 &nbsp;|&nbsp; 48 Selecciones · 104 Partidos · 16 Estadios
          </div>
        </div>

        {/* Countdown */}
        {!isPast && (
          <div style={{ marginBottom: 32, animation: 'scaleIn 0.8s ease 0.6s both' }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 12 }}>
              ⏰ Cierre de predicciones en
            </p>
            <CountdownTimer target={DEADLINES.grupos} />
          </div>
        )}

        {/* Scoring cards */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 36, animation: 'slideUp 0.8s ease 0.8s both' }}>
          {[
            { pts: '3', label: 'Resultado exacto', color: 'var(--gold)', bg: 'rgba(244,197,66,0.08)', border: 'rgba(244,197,66,0.2)' },
            { pts: '1', label: 'Ganador / empate', color: 'var(--blue)', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
            { pts: '10', label: 'Aciertas el campeon', color: 'var(--purple)', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)' },
          ].map(s => (
            <div key={s.pts} style={{ background: s.bg, border: '1px solid ' + s.border, borderRadius: 14, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, backdropFilter: 'blur(10px)', transition: 'transform 0.2s', cursor: 'default' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: s.color, lineHeight: 1 }}>{s.pts}</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text)' }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', animation: 'slideUp 0.8s ease 1s both' }}>
          {player ? (
            <>
              <Link href="/grupos" style={{
                background: 'linear-gradient(135deg, var(--gold), #FF0000)',
                color: '#fff', borderRadius: 14, padding: '16px 36px',
                fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', letterSpacing: '0.1em',
                boxShadow: '0 8px 32px rgba(244,197,66,0.3), 0 0 0 1px rgba(244,197,66,0.2)',
                transition: 'all 0.2s', display: 'inline-block',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(244,197,66,0.45), 0 0 0 1px rgba(244,197,66,0.3)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(244,197,66,0.3), 0 0 0 1px rgba(244,197,66,0.2)' }}>
                ⚽ Mis Predicciones
              </Link>
              <Link href="/clasificacion" style={{
                background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(255,255,255,0.12)',
                color: 'var(--text)', borderRadius: 14, padding: '16px 36px',
                fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', letterSpacing: '0.1em',
                backdropFilter: 'blur(10px)', transition: 'all 0.2s', display: 'inline-block',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(244,197,66,0.3)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)' }}>
                📊 Ver Tabla
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" style={{
                background: 'linear-gradient(135deg, var(--gold), #FF0000)',
                color: '#fff', borderRadius: 14, padding: '16px 40px',
                fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', letterSpacing: '0.1em',
                boxShadow: '0 8px 32px rgba(244,197,66,0.35)', transition: 'all 0.2s', display: 'inline-block',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 14px 44px rgba(244,197,66,0.5)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(244,197,66,0.35)' }}>
                🚀 Entrar a la Quiniela
              </Link>
              <Link href="/clasificacion" style={{
                background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(255,255,255,0.12)',
                color: 'var(--text)', borderRadius: 14, padding: '16px 36px',
                fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', letterSpacing: '0.1em',
                backdropFilter: 'blur(10px)', transition: 'all 0.2s', display: 'inline-block',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
                📊 Ver Tabla
              </Link>
            </>
          )}
        </div>

        {/* How to join - only for non-logged users */}
        {!player && (
          <div style={{ marginTop: 40, display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', animation: 'slideUp 0.8s ease 1.2s both', maxWidth: 600 }}>
            {[
              { n: '1', icon: '📝', label: 'Regístrate', desc: 'Crea tu cuenta en segundos' },
              { n: '2', icon: '⚽', label: 'Predice', desc: 'Llena los 72 partidos de grupos' },
              { n: '3', icon: '🏆', label: 'Compite', desc: 'Gana puntos y sube en la tabla' },
            ].map(s => (
              <div key={s.n} style={{ background: 'rgba(17,17,24,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px 20px', textAlign: 'center', minWidth: 140, backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', color: 'var(--gold)', letterSpacing: '0.06em' }}>{s.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 3 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        )}

        {/* Stats bar */}
        <div style={{ marginTop: 48, display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', animation: 'slideUp 0.8s ease 1.2s both' }}>
          {[
            { n: '48', l: 'Selecciones' },
            { n: '104', l: 'Partidos' },
            { n: '16', l: 'Estadios' },
            { n: '3', l: 'Paises sede' },
          ].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: 'var(--gold)', lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
