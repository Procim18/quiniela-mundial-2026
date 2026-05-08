'use client'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function HomePage() {
  const { player } = useAuth()

  return (
    <div style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>

      <div style={{ fontSize: '4rem', animation: 'float 3s ease-in-out infinite', marginBottom: 16 }}>🏆</div>

      <h1 style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 'clamp(3rem, 10vw, 6rem)',
        letterSpacing: '0.04em',
        background: 'linear-gradient(135deg, #F4C542, #fff 50%, #F4C542)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundClip: 'text', lineHeight: 1, marginBottom: 12,
      }}>
        Quiniela<br />Mundial 2026
      </h1>

      <p style={{ color: 'var(--muted)', fontSize: '0.95rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 8 }}>
        USA · Canada · México
      </p>
      <div style={{
        display: 'inline-flex', gap: 8, alignItems: 'center',
        background: 'var(--dark3)', border: '1px solid var(--border)',
        borderRadius: 100, padding: '6px 18px', fontSize: '0.82rem',
        color: 'var(--gold)', marginBottom: 40,
      }}>
        🇺🇸 🇨🇦 🇲🇽 &nbsp;|&nbsp; 48 Selecciones · 104 Partidos
      </div>

      {/* Scoring */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 48 }}>
        {[
          { pts: '3', label: 'Resultado exacto', color: 'var(--gold)' },
          { pts: '1', label: 'Solo el ganador / empate', color: 'var(--blue)' },
          { pts: '10', label: 'Aciertas el campeón', color: 'var(--purple)' },
        ].map(s => (
          <div key={s.pts} style={{
            background: 'var(--dark3)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '12px 20px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem',
              color: s.color, background: `${s.color}18`,
              borderRadius: 8, padding: '2px 10px', minWidth: 40, textAlign: 'center',
            }}>{s.pts}</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      {player ? (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/grupos" style={{
            background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
            color: 'var(--dark)', borderRadius: 12, padding: '14px 32px',
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem',
            letterSpacing: '0.08em',
          }}>
            ⚽ Ir a Fase de Grupos
          </Link>
          <Link href="/eliminatorias" style={{
            background: 'var(--dark3)', border: '1px solid var(--border)',
            color: 'var(--text)', borderRadius: 12, padding: '14px 32px',
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem',
            letterSpacing: '0.08em',
          }}>
            🏆 Eliminatorias
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/login" style={{
            background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
            color: 'var(--dark)', borderRadius: 12, padding: '14px 32px',
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem',
            letterSpacing: '0.08em',
          }}>
            🚀 Entrar a la Quiniela
          </Link>
          <Link href="/clasificacion" style={{
            background: 'var(--dark3)', border: '1px solid var(--border)',
            color: 'var(--text)', borderRadius: 12, padding: '14px 32px',
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem',
            letterSpacing: '0.08em',
          }}>
            📊 Ver Clasificación
          </Link>
        </div>
      )}

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      `}</style>
    </div>
  )
}
