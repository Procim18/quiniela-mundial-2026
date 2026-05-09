'use client'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { DEADLINES } from '@/lib/data'

function DaysCounter() {
  const [days, setDays] = useState(0)
  const [hours, setHours] = useState(0)
  const [past, setPast] = useState(false)

  useEffect(() => {
    const update = () => {
      const diff = DEADLINES.grupos.getTime() - Date.now()
      if (diff <= 0) { setPast(true); return }
      setDays(Math.floor(diff / 86400000))
      setHours(Math.floor((diff % 86400000) / 3600000))
    }
    update()
    const t = setInterval(update, 60000)
    return () => clearInterval(t)
  }, [])

  if (past) return <span style={{ fontSize: '0.65rem', color: '#FF6B6B', background: 'rgba(214,40,40,0.1)', borderRadius: 6, padding: '2px 8px' }}>🔒 CERRADO</span>
  return (
    <span style={{ fontSize: '0.65rem', color: 'var(--gold)', background: 'rgba(244,197,66,0.08)', borderRadius: 6, padding: '2px 8px', border: '1px solid rgba(244,197,66,0.15)', whiteSpace: 'nowrap' }}>
      ⏰ {days}d {hours}h
    </span>
  )
}

export default function Navbar() {
  const { player, logout } = useAuth()
  const path = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const publicLinks = [
    { href: '/', label: '🏠 Inicio' },
    { href: '/reglas', label: '📋 Reglas' },
  ]
  const privateLinks = [
    { href: '/grupos', label: '⚽ Grupos' },
    { href: '/eliminatorias', label: '🏆 Eliminatorias' },
    { href: '/clasificacion', label: '📊 Tabla' },
    { href: '/predicciones', label: '👁️ Predicciones' },
    { href: '/estadisticas', label: '📈 Stats' },
    { href: '/chat', label: '💬 Chat' },
  ]
  const links = player ? [...publicLinks, ...privateLinks] : publicLinks

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [path])

  return (
    <>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(5,5,8,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(244,197,66,0.1)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', gap: 10, height: 54 }}>

          {/* Logo */}
          <Link href="/" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: 'var(--gold)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, letterSpacing: '0.06em' }}>
            🏆 Mundial 2026
          </Link>

          <DaysCounter />

          {/* Desktop links - hidden on mobile */}
          <div style={{ display: 'flex', gap: 2, flex: 1, overflowX: 'auto', scrollbarWidth: 'none' }} className="desktop-nav">
            {links.map(l => (
              <Link key={l.href} href={l.href} style={{
                padding: '5px 10px', borderRadius: 7, fontSize: '0.78rem', fontWeight: 500, whiteSpace: 'nowrap',
                color: path === l.href ? 'var(--gold)' : 'var(--muted)',
                background: path === l.href ? 'rgba(244,197,66,0.08)' : 'none',
              }}>
                {l.label}
              </Link>
            ))}
            {player?.is_admin && (
              <Link href="/admin" style={{ padding: '5px 10px', borderRadius: 7, fontSize: '0.78rem', fontWeight: 500, whiteSpace: 'nowrap', color: path === '/admin' ? '#FF6B6B' : 'var(--muted)' }}>
                🔧 Admin
              </Link>
            )}
          </div>

          <div style={{ flex: 1 }} className="mobile-spacer" />

          {/* User info - desktop */}
          {player && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }} className="desktop-nav">
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '4px 10px' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--red))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.85rem', color: 'var(--dark)' }}>
                  {player.username.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 500, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{player.username}</span>
              </div>
              <button onClick={logout} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--muted)', borderRadius: 7, padding: '4px 10px', cursor: 'pointer', fontSize: '0.75rem' }}>
                Salir
              </button>
            </div>
          )}
          {!player && (
            <Link href="/login" className="desktop-nav" style={{ background: 'linear-gradient(135deg, var(--gold), #FF0000)', color: '#fff', borderRadius: 8, padding: '6px 14px', fontWeight: 700, fontSize: '0.82rem', flexShrink: 0 }}>
              Entrar
            </Link>
          )}

          {/* Hamburger button - mobile only */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="mobile-nav"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'var(--text)', fontSize: '1.1rem', flexShrink: 0 }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Nike stripe */}
        <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, var(--gold), #FF0000, var(--gold), transparent)', backgroundSize: '200% 100%', animation: 'stripeSlide 3s linear infinite' }} />
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'rgba(5,5,8,0.98)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', padding: '70px 24px 24px' }}
          className="mobile-nav">
          
          {/* User info mobile */}
          {player && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: '16px', background: 'rgba(244,197,66,0.06)', borderRadius: 14, border: '1px solid rgba(244,197,66,0.15)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--red))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', color: 'var(--dark)' }}>
                {player.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{player.username}</div>
                <DaysCounter />
              </div>
            </div>
          )}

          {/* Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
            {links.map(l => (
              <Link key={l.href} href={l.href} style={{
                padding: '14px 18px', borderRadius: 12, fontSize: '1rem', fontWeight: 600,
                color: path === l.href ? 'var(--gold)' : 'var(--text)',
                background: path === l.href ? 'rgba(244,197,66,0.08)' : 'rgba(255,255,255,0.03)',
                border: '1px solid ' + (path === l.href ? 'rgba(244,197,66,0.2)' : 'rgba(255,255,255,0.06)'),
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                {l.label}
              </Link>
            ))}
            {player?.is_admin && (
              <Link href="/admin" style={{ padding: '14px 18px', borderRadius: 12, fontSize: '1rem', fontWeight: 600, color: '#FF6B6B', background: 'rgba(214,40,40,0.08)', border: '1px solid rgba(214,40,40,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
                🔧 Admin
              </Link>
            )}
          </div>

          {/* Bottom actions */}
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {player ? (
              <button onClick={() => { logout(); setMenuOpen(false) }} style={{ background: 'rgba(214,40,40,0.1)', border: '1px solid rgba(214,40,40,0.3)', color: '#FF6B6B', borderRadius: 12, padding: '14px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600 }}>
                Cerrar Sesion
              </button>
            ) : (
              <Link href="/login" style={{ background: 'linear-gradient(135deg, var(--gold), #FF0000)', color: '#fff', borderRadius: 12, padding: '14px', fontWeight: 700, fontSize: '1rem', textAlign: 'center', display: 'block' }}>
                🚀 Entrar a la Quiniela
              </Link>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: flex !important; }
          .mobile-spacer { display: block !important; }
        }
        @media (min-width: 769px) {
          .mobile-nav { display: none !important; }
          .mobile-spacer { display: none !important; }
        }
      `}</style>
    </>
  )
}
