'use client'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { DEADLINES } from '@/lib/data'
import { useEffect, useState } from 'react'

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
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {[{ v: d, l: 'DÍAS' }, { v: h, l: 'HRS' }, { v: m, l: 'MIN' }, { v: s, l: 'SEG' }].map(({ v, l }) => (
        <div key={l} style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 6vw, 3.2rem)', color: 'white', lineHeight: 1, minWidth: 60, background: 'rgba(0,0,0,0.4)', borderRadius: 10, padding: '8px 14px', border: '1px solid rgba(244,197,66,0.2)', backdropFilter: 'blur(8px)' }}>
            {String(v).padStart(2, '0')}
          </div>
          <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.25em', marginTop: 6 }}>{l}</div>
        </div>
      ))}
    </div>
  )
}

function Particle({ style }: { style: React.CSSProperties }) {
  return <div style={{ position: 'absolute', borderRadius: '50%', pointerEvents: 'none', ...style }} />
}

export default function HomePage() {
  const { player } = useAuth()
  const [visible, setVisible] = useState(false)
  const isPast = Date.now() > DEADLINES.grupos.getTime()

  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  return (
    <div style={{ minHeight: '92vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>

      {/* Particles */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {Array.from({ length: 16 }).map((_, i) => (
          <Particle key={i} style={{
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            background: i % 3 === 0 ? '#F4C542' : i % 3 === 1 ? '#FF0000' : 'rgba(255,255,255,0.6)',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            opacity: Math.random() * 0.3 + 0.05,
            animation: `floatUp ${Math.random() * 10 + 10}s linear ${Math.random() * 8}s infinite`,
          }} />
        ))}
      </div>

      {/* Glow orbs */}
      <div style={{ position: 'fixed', top: '15%', left: '5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(244,197,66,0.04) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '15%', right: '5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(255,0,0,0.04) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease', maxWidth: 700, width: '100%' }}>

        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(244,197,66,0.08)', border: '1px solid rgba(244,197,66,0.2)', borderRadius: 100, padding: '5px 16px', marginBottom: 24, animation: 'slideUp 0.6s ease 0.1s both' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', animation: 'pulse 2s ease infinite' }} />
          <span style={{ fontSize: '0.72rem', color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}>USA · Canadá · México 2026</span>
        </div>

        {/* Title */}
        <div style={{ animation: 'slideUp 0.6s ease 0.2s both', marginBottom: 6 }}>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(3.5rem, 13vw, 8rem)', letterSpacing: '0.02em', lineHeight: 0.9, background: 'linear-gradient(135deg, #C89B1A 0%, #F4C542 40%, #fff 60%, #F4C542 80%, #FF0000 100%)', backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: 'gradientShift 5s ease infinite' }}>
            QUINIELA
          </h1>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(1.8rem, 6vw, 3.5rem)', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>
            MUNDIAL 2026
          </h2>
        </div>

        {/* Stripe */}
        <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #C89B1A, #F4C542, #FF0000, #F4C542, transparent)', marginBottom: 28, borderRadius: 1, animation: 'slideUp 0.6s ease 0.3s both' }} />

        {/* Countdown */}
        {!isPast && (
          <div style={{ marginBottom: 32, animation: 'slideUp 0.6s ease 0.4s both' }}>
            <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 14 }}>
              Cierre de predicciones en
            </p>
            <CountdownTimer target={DEADLINES.grupos} />
          </div>
        )}

        {/* Points */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32, animation: 'slideUp 0.6s ease 0.5s both' }}>
          {[
            { pts: '3', label: 'Resultado exacto', color: '#F4C542', border: 'rgba(244,197,66,0.2)', bg: 'rgba(244,197,66,0.06)' },
            { pts: '1', label: 'Ganador / Empate', color: '#3B82F6', border: 'rgba(59,130,246,0.2)', bg: 'rgba(59,130,246,0.06)' },
            { pts: '10', label: 'Campeón del mundo', color: '#8B5CF6', border: 'rgba(139,92,246,0.2)', bg: 'rgba(139,92,246,0.06)' },
          ].map(s => (
            <div key={s.pts} style={{ display: 'flex', alignItems: 'center', gap: 10, background: s.bg, border: '1px solid ' + s.border, borderRadius: 10, padding: '10px 16px', backdropFilter: 'blur(8px)' }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', color: s.color, lineHeight: 1 }}>{s.pts}<span style={{ fontSize: '0.7rem' }}>pts</span></span>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', animation: 'slideUp 0.6s ease 0.6s both', marginBottom: 40 }}>
          {player ? (
            <>
              <Link href="/grupos" style={{ background: 'linear-gradient(135deg, #C89B1A, #F4C542)', color: '#0a0a10', borderRadius: 10, padding: '14px 32px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', letterSpacing: '0.1em', fontWeight: 900, boxShadow: '0 4px 24px rgba(244,197,66,0.25)', display: 'inline-block' }}>
                Mis Predicciones
              </Link>
              <Link href="/clasificacion" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', borderRadius: 10, padding: '14px 32px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', letterSpacing: '0.1em', backdropFilter: 'blur(8px)', display: 'inline-block' }}>
                Ver Tabla
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" style={{ background: 'linear-gradient(135deg, #C89B1A, #F4C542)', color: '#0a0a10', borderRadius: 10, padding: '14px 36px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', letterSpacing: '0.1em', fontWeight: 900, boxShadow: '0 4px 24px rgba(244,197,66,0.25)', display: 'inline-block' }}>
                Entrar a la Quiniela
              </Link>
              <Link href="/reglas" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', borderRadius: 10, padding: '14px 28px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', letterSpacing: '0.1em', backdropFilter: 'blur(8px)', display: 'inline-block' }}>
                Ver Reglas
              </Link>
            </>
          )}
        </div>

        {/* How to join - non logged */}
        {!player && (
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', animation: 'slideUp 0.6s ease 0.7s both', marginBottom: 32 }}>
            {[
              { n: '01', label: 'Regístrate', desc: 'Crea tu cuenta en segundos' },
              { n: '02', label: 'Predice', desc: 'Llena los 72 partidos de grupos' },
              { n: '03', label: 'Compite', desc: 'Sube en la tabla y gana' },
            ].map(s => (
              <div key={s.n} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 20px', minWidth: 130, backdropFilter: 'blur(8px)' }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: 'rgba(244,197,66,0.5)', lineHeight: 1, marginBottom: 6 }}>{s.n}</div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'rgba(255,255,255,0.85)', marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        )}

        {/* Stats bar */}
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', animation: 'slideUp 0.6s ease 0.8s both' }}>
          {[
            { n: '48', l: 'Selecciones' },
            { n: '104', l: 'Partidos' },
            { n: '16', l: 'Estadios' },
            { n: '3', l: 'Países sede' },
          ].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 3 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(100vh); opacity: 0; }
          10% { opacity: 0.3; }
          90% { opacity: 0.1; }
          100% { transform: translateY(-10vh); opacity: 0; }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  )
}
