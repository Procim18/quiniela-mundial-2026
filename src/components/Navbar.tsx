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

  const mainLinks = [
    { href: '/', label: '🏠 Inicio' },
    { href: '/grupos', label: '⚽ Grupos', auth: true },
    { href: '/eliminatorias', label: '🏆 Eliminatorias', auth: true },
    { href: '/clasificacion', label: '📊 Tabla', auth: true },
  ]

  const secondaryLinks = [
    { href: '/predicciones', label: '👁️ Predicciones', auth: true },
    { href: '/estadisticas', label: '📈 Stats', auth: true },
    { href: '/historial', label: '📉 Historial', auth: true },
    { href: '/chat', label: '💬 Chat', auth: true },
    { href: '/perfil', label: '👤 Perfil', auth: true },
    { href: '/reglas', label: '📋 Reglas', auth: false },
  ]

  const visibleMain = mainLinks.filter(l => !l.auth || player)
  const visibleSecondary = secondaryLinks.filter(l => !l.auth || player)

  useEffect(() => { setMenuOpen(false) }, [path])

  return (
    <>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(5,5,8,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(244,197,66,0.1)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', gap: 10, height: 54 }}>

          <Link href="/" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: 'var(--gold)', flexShrink: 0, letterSpacing: '0.06em' }}>
            🏆 Mundial 2026
          </Link>

          <DaysCounter />

          {/* Desktop links */}
          <div style={{ display: 'flex', gap: 2, flex: 1 }} className="desktop-nav">
            {visibleMain.map(l => (
              <Link key={l.href} href={l.href} style={{
                padding: '5px 10px', borderRadius: 7, fontSize: '0.78rem', fontWeight: 500, whiteSpace: 'nowrap',
                color: path === l.href ? 'var(--gold)' : 'var(--muted)',
                background: path === l.href ? 'rgba(244,197,66,0.08)' : 'none',
              }}>{l.label}</Link>
            ))}
            {player && (
              <div style={{ position: 'relative', display: 'inline-block' }} className="dropdown-wrap">
                <button style={{ padding: '5px 10px', borderRadius: 7, fontSize: '0.78rem', fontWeight: 500, color: visibleSecondary.some(l => l.href === path) ? 'var(--gold)' : 'var(--muted)', background: visibleSecondary.some(l => l.href === path) ? 'rgba(244,197,66,0.08)' : 'none', border: 'none', cursor: 'pointer' }}>
                  Más ▾
                </button>
                <div className="dropdown-menu" style={{ position: 'absolute', top: '100%', left: 0, background: 'rgba(10,10,16,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '6px', minWidth: 160, zIndex: 200, backdropFilter: 'blur(16px)' }}>
                  {visibleSecondary.map(l => (
                    <Link key={l.href} href={l.href} style={{ display: 'block', padding: '8px 12px', borderRadius: 7, fontSize: '0.82rem', color: path === l.href ? 'var(--gold)' : 'var(--text)', background: path === l.href ? 'rgba(244,197,66,0.08)' : 'none', whiteSpace: 'nowrap' }}>{l.label}</Link>
                  ))}
                </div>
              </div>
            )}
            {!player && (
              <Link href="/reglas" style={{ padding: '5px 10px', borderRadius: 7, fontSize: '0.78rem', fontWeight: 500, color: path === '/reglas' ? 'var(--gold)' : 'var(--muted)', background: path === '/reglas' ? 'rgba(244,197,66,0.08)' : 'none' }}>📋 Reglas</Link>
            )}
            {player?.is_admin && (
              <Link href="/admin" style={{ padding: '5px 10px', borderRadius: 7, fontSize: '0.78rem', fontWeight: 500, color: path === '/admin' ? '#FF6B6B' : 'var(--muted)' }}>🔧 Admin</Link>
            )}
          </div>

          <div style={{ flex: 1 }} className="mobile-spacer" />

          {/* Desktop user */}
          {player ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }} className="desktop-nav">
              <Link href="/perfil" style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '4px 10px' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--red))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.85rem', color: 'var(--dark)' }}>
                  {player.username.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 500, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{player.username}</span>
              </Link>
              <button onClick={logout} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--muted)', borderRadius: 7, padding: '4px 10px', cursor: 'pointer', fontSize: '0.75rem' }}>
                Salir
              </button>
            </div>
          ) : (
            <Link href="/login" className="desktop-nav" style={{ background: 'linear-gradient(135deg, var(--gold), #FF0000)', color: '#fff', borderRadius: 8, padding: '6px 14px', fontWeight: 700, fontSize: '0.82rem', flexShrink: 0 }}>
              Entrar
            </Link>
          )}

          {/* Hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-nav" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'var(--text)', fontSize: '1.1rem', flexShrink: 0 }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
        <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, var(--gold), #FF0000, var(--gold), transparent)', backgroundSize: '200% 100%', animation: 'stripeSlide 3s linear infinite' }} />
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'rgba(5,5,8,0.98)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', padding: '70px 24px 24px', overflowY: 'auto' }} className="mobile-nav">
          {player && (
            <Link href="/perfil" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '14px 16px', background: 'rgba(244,197,66,0.06)', borderRadius: 14, border: '1px solid rgba(244,197,66,0.15)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--red))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', color: 'var(--dark)' }}>
                {player.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{player.username}</div>
                <DaysCounter />
              </div>
            </Link>
          )}

          <div style={{ fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>Principal</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
            {visibleMain.map(l => (
              <Link key={l.href} href={l.href} style={{ padding: '13px 16px', borderRadius: 12, fontSize: '0.95rem', fontWeight: 600, color: path === l.href ? 'var(--gold)' : 'var(--text)', background: path === l.href ? 'rgba(244,197,66,0.08)' : 'rgba(255,255,255,0.03)', border: '1px solid ' + (path === l.href ? 'rgba(244,197,66,0.2)' : 'rgba(255,255,255,0.06)') }}>
                {l.label}
              </Link>
            ))}
          </div>

          {player && (
            <>
              <div style={{ fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>Mas opciones</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                {visibleSecondary.map(l => (
                  <Link key={l.href} href={l.href} style={{ padding: '13px 16px', borderRadius: 12, fontSize: '0.95rem', fontWeight: 600, color: path === l.href ? 'var(--gold)' : 'var(--text)', background: path === l.href ? 'rgba(244,197,66,0.08)' : 'rgba(255,255,255,0.03)', border: '1px solid ' + (path === l.href ? 'rgba(244,197,66,0.2)' : 'rgba(255,255,255,0.06)') }}>
                    {l.label}
                  </Link>
                ))}
                {player?.is_admin && (
                  <Link href="/admin" style={{ padding: '13px 16px', borderRadius: 12, fontSize: '0.95rem', fontWeight: 600, color: '#FF6B6B', background: 'rgba(214,40,40,0.08)', border: '1px solid rgba(214,40,40,0.2)' }}>🔧 Admin</Link>
                )}
              </div>
            </>
          )}

          <div style={{ marginTop: 'auto' }}>
            {player ? (
              <button onClick={() => { logout(); setMenuOpen(false) }} style={{ width: '100%', background: 'rgba(214,40,40,0.1)', border: '1px solid rgba(214,40,40,0.3)', color: '#FF6B6B', borderRadius: 12, padding: '14px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600 }}>
                Cerrar Sesion
              </button>
            ) : (
              <Link href="/login" style={{ display: 'block', background: 'linear-gradient(135deg, var(--gold), #FF0000)', color: '#fff', borderRadius: 12, padding: '14px', fontWeight: 700, fontSize: '1rem', textAlign: 'center' }}>
                🚀 Entrar a la Quiniela
              </Link>
            )}
          </div>
        </div>
      )}

      <style>{`
        .dropdown-wrap:hover .dropdown-menu { display: block !important; }
        .dropdown-menu { display: none; }
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
