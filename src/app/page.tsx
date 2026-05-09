'use client'
import Link from 'next/link'
import Deadlines from '@/components/Deadlines'
import { useAuth } from '@/lib/auth-context'
import { DEADLINE } from '@/lib/data'

export default function HomePage() {
  const { player } = useAuth()
  const daysLeft = Math.max(0, Math.ceil((DEADLINE.getTime() - Date.now()) / 86400000))

  return (
    <div style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>

      <div style={{ fontSize: '4rem', animation: 'float 3s ease-in-out infinite', marginBottom: 16, filter: 'drop-shadow(0 0 20px rgba(244,197,66,0.6))' }}>🏆</div>

      <h1 style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 'clamp(3.5rem, 12vw, 7rem)',
        letterSpacing: '0.04em',
        background: 'linear-gradient(135deg, #F4C542 0%, #fff 40%, #F4C542 70%, #FF0000 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundClip: 'text', lineHeight: 0.95, marginBottom: 14,
      }}>
        Quiniela<br />Mundial<br />2026
      </h1>

      <p style={{ color: 'var(--muted)', fontSize: '0.9rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 10 }}>
        USA · Canada · Mexico
      </p>

      <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(244,197,66,0.2)', borderRadius: 100, padding: '6px 18px', fontSize: '0.82rem', color: 'var(--gold)', marginBottom: 32, backdropFilter: 'blur(10px)' }}>
        48 Selecciones · 104 Partidos
      </div>

      {daysLeft > 0 && (
        <div style={{ marginBottom: 32, background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(244,197,66,0.2)', borderRadius: 16, padding: '16px 28px', backdropFilter: 'blur(10px)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>Cierre de predicciones en</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: 'var(--gold)', lineHeight: 1 }}>{daysLeft}<span style={{ fontSize: '1rem', marginLeft: 6, color: 'var(--muted)' }}>dias</span></div>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 40 }}>
        {[
          { pts: '3', label: 'Resultado exacto', color: 'var(--gold)' },
          { pts: '1', label: 'Ganador / empate', color: 'var(--blue)' },
          { pts: '10', label: 'Aciertas el campeon', color: 'var(--purple)' },
        ].map(s => (
          <div key={s.pts} style={{ background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10, backdropFilter: 'blur(10px)' }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: s.color, background: s.color + '18', borderRadius: 8, padding: '2px 10px' }}>{s.pts}</span>
            <span style={{ fontSize: '0.83rem', fontWeight: 500 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {player ? (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/grupos" style={{ background: 'linear-gradient(135deg, var(--gold), var(--nike-red))', color: '#fff', borderRadius: 12, padding: '14px 32px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', letterSpacing: '0.08em' }}>
            Ir a Grupos
          </Link>
          <Link href="/eliminatorias" style={{ background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)', borderRadius: 12, padding: '14px 32px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', letterSpacing: '0.08em', backdropFilter: 'blur(10px)' }}>
            Eliminatorias
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/login" style={{ background: 'linear-gradient(135deg, var(--gold), var(--nike-red))', color: '#fff', borderRadius: 12, padding: '14px 32px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', letterSpacing: '0.08em' }}>
            Entrar a la Quiniela
          </Link>
          <Link href="/clasificacion" style={{ background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)', borderRadius: 12, padding: '14px 32px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', letterSpacing: '0.08em', backdropFilter: 'blur(10px)' }}>
            Ver Tabla
          </Link>
        </div>
      )}
    </div>
  )
}
