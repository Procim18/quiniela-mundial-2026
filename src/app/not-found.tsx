'use client'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: '5rem', marginBottom: 16, animation: 'trophyBounce 3s ease-in-out infinite' }}>🏆</div>
      <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(4rem, 15vw, 8rem)', color: 'var(--gold)', letterSpacing: '0.06em', lineHeight: 1, marginBottom: 8 }}>404</h1>
      <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 8 }}>PAGINA NO ENCONTRADA</p>
      <p style={{ color: 'var(--muted)', fontSize: '0.9rem', maxWidth: 360, lineHeight: 1.6, marginBottom: 32 }}>
        Esta pagina no existe o fue eliminada. Vuelve al inicio para seguir la quiniela.
      </p>
      <Link href="/" style={{ background: 'linear-gradient(135deg, var(--gold), #FF0000)', color: '#fff', borderRadius: 12, padding: '14px 32px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', letterSpacing: '0.08em', boxShadow: '0 8px 24px rgba(244,197,66,0.3)' }}>
        Volver al Inicio
      </Link>
    </div>
  )
}
