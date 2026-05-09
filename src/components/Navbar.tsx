'use client'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { DEADLINES } from '@/lib/data'

const Icons = {
  home: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  soccer: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10M12 2v4m0 16v-4m8-8h-4M4 12H0m15.5-6.5-3 3m-5 5-3 3m11 0-3-3m-5-5-3-3"/></svg>,
  trophy: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
  table: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>,
  eye: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  chart: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  history: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.86-8.62L23 10"/></svg>,
  chat: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  user: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  rules: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  admin: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  clock: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  logout: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  chevron: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
}

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

  if (past) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(214,40,40,0.12)', border: '1px solid rgba(214,40,40,0.25)', borderRadius: 6, padding: '3px 8px' }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      <span style={{ fontSize: '0.62rem', color: '#FF6B6B', fontWeight: 600, letterSpacing: '0.05em' }}>CERRADO</span>
    </div>
  )
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(244,197,66,0.08)', border: '1px solid rgba(244,197,66,0.18)', borderRadius: 6, padding: '3px 8px' }}>
      <span style={{ color: 'var(--gold)', opacity: 0.8 }}>{Icons.clock}</span>
      <span style={{ fontSize: '0.62rem', color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.04em' }}>{days}D {hours}H</span>
    </div>
  )
}

export default function Navbar() {
  const { player, logout } = useAuth()
  const path = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const mainLinks = [
    { href: '/', label: 'Inicio', icon: Icons.home },
    { href: '/grupos', label: 'Grupos', icon: Icons.soccer, auth: true },
    { href: '/eliminatorias', label: 'Eliminatorias', icon: Icons.trophy, auth: true },
    { href: '/clasificacion', label: 'Tabla', icon: Icons.table, auth: true },
  ]

  const moreLinks = [
    { href: '/predicciones', label: 'Predicciones', icon: Icons.eye },
    { href: '/estadisticas', label: 'Estadísticas', icon: Icons.chart },
    { href: '/historial', label: 'Historial', icon: Icons.history },
    { href: '/chat', label: 'Chat', icon: Icons.chat },
    { href: '/perfil', label: 'Perfil', icon: Icons.user },
    { href: '/reglas', label: 'Reglas', icon: Icons.rules },
  ]

  const visibleMain = mainLinks.filter(l => !l.auth || player)

  useEffect(() => { setMenuOpen(false) }, [path])

  const isActive = (href: string) => path === href

  return (
    <>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(6,6,10,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        
        {/* Top accent line */}
        <div style={{ height: 2, background: 'linear-gradient(90deg, #C89B1A, #F4C542, #FF0000, #F4C542, #C89B1A)', backgroundSize: '200% 100%', animation: 'stripeSlide 4s linear infinite' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 8, height: 52 }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8, flexShrink: 0 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #C89B1A, #F4C542)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>
            </div>
            <div className="desktop-nav">
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', color: 'var(--gold)', letterSpacing: '0.1em', lineHeight: 1 }}>MUNDIAL</div>
              <div style={{ fontSize: '0.55rem', color: 'var(--muted)', letterSpacing: '0.2em', lineHeight: 1 }}>QUINIELA 2026</div>
            </div>
          </Link>

          <DaysCounter />

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, marginLeft: 8 }} className="desktop-nav">
            {visibleMain.map(l => (
              <Link key={l.href} href={l.href} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 7, fontSize: '0.8rem', fontWeight: 500,
                color: isActive(l.href) ? 'var(--gold)' : 'rgba(255,255,255,0.55)',
                background: isActive(l.href) ? 'rgba(244,197,66,0.1)' : 'none',
                borderBottom: isActive(l.href) ? '2px solid var(--gold)' : '2px solid transparent',
                transition: 'all 0.15s',
              }}>
                <span style={{ opacity: isActive(l.href) ? 1 : 0.6 }}>{l.icon}</span>
                {l.label}
              </Link>
            ))}

            {player && (
              <div className="dropdown-wrap" style={{ position: 'relative' }}>
                <button style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 7, fontSize: '0.8rem', fontWeight: 500,
                  color: moreLinks.some(l => isActive(l.href)) ? 'var(--gold)' : 'rgba(255,255,255,0.55)',
                  background: moreLinks.some(l => isActive(l.href)) ? 'rgba(244,197,66,0.1)' : 'none',
                  border: 'none', cursor: 'pointer',
                  borderBottom: moreLinks.some(l => isActive(l.href)) ? '2px solid var(--gold)' : '2px solid transparent',
                }}>
                  Más {Icons.chevron}
                </button>
                <div className="dropdown-menu" style={{
                  position: 'absolute', top: 'calc(100% + 6px)', left: 0,
                  background: 'rgba(8,8,14,0.98)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10, padding: '6px', minWidth: 180, zIndex: 200,
                  backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}>
                  {moreLinks.map(l => (
                    <Link key={l.href} href={l.href} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', borderRadius: 7, fontSize: '0.82rem',
                      color: isActive(l.href) ? 'var(--gold)' : 'rgba(255,255,255,0.7)',
                      background: isActive(l.href) ? 'rgba(244,197,66,0.08)' : 'none',
                    }}>
                      <span style={{ opacity: 0.6 }}>{l.icon}</span>
                      {l.label}
                    </Link>
                  ))}
                  {player?.is_admin && (
                    <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 7, fontSize: '0.82rem', color: isActive('/admin') ? '#FF6B6B' : 'rgba(255,100,100,0.7)', background: isActive('/admin') ? 'rgba(214,40,40,0.08)' : 'none', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 4 }}>
                      <span style={{ opacity: 0.6 }}>{Icons.admin}</span>
                      Admin
                    </Link>
                  )}
                </div>
              </div>
            )}

            {!player && (
              <Link href="/reglas" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 7, fontSize: '0.8rem', fontWeight: 500, color: isActive('/reglas') ? 'var(--gold)' : 'rgba(255,255,255,0.55)' }}>
                {Icons.rules} Reglas
              </Link>
            )}
          </div>

          <div style={{ flex: 1 }} className="mobile-spacer" />

          {/* Desktop user */}
          {player ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }} className="desktop-nav">
              <Link href="/perfil" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '5px 12px', transition: 'all 0.15s' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #C89B1A, #FF0000)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.9rem', color: 'white' }}>
                  {player.username.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{player.username}</span>
              </Link>
              <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', borderRadius: 7, padding: '5px 10px', cursor: 'pointer', fontSize: '0.75rem', transition: 'all 0.15s' }}>
                {Icons.logout}
              </button>
            </div>
          ) : (
            <Link href="/login" className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, #C89B1A, #FF0000)', color: 'white', borderRadius: 7, padding: '7px 16px', fontWeight: 700, fontSize: '0.82rem', flexShrink: 0, boxShadow: '0 2px 12px rgba(244,197,66,0.2)' }}>
              Entrar
            </Link>
          )}

          {/* Hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', flexShrink: 0, width: 36, height: 36 }}>
            {menuOpen
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            }
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'rgba(4,4,8,0.99)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', paddingTop: 64, overflowY: 'auto' }} className="mobile-nav">
          
          {player && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 8 }}>
              <Link href="/perfil" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #C89B1A, #FF0000)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: 'white' }}>
                  {player.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'white' }}>{player.username}</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Ver perfil</div>
                </div>
                <div style={{ marginLeft: 'auto' }}><DaysCounter /></div>
              </Link>
            </div>
          )}

          <div style={{ padding: '8px 12px', flex: 1 }}>
            <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '8px 8px 4px' }}>Principal</div>
            {visibleMain.map(l => (
              <Link key={l.href} href={l.href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px', borderRadius: 10, fontSize: '0.95rem', fontWeight: 500, color: isActive(l.href) ? 'var(--gold)' : 'rgba(255,255,255,0.75)', background: isActive(l.href) ? 'rgba(244,197,66,0.08)' : 'none', marginBottom: 2 }}>
                <span style={{ color: isActive(l.href) ? 'var(--gold)' : 'rgba(255,255,255,0.3)' }}>{l.icon}</span>
                {l.label}
              </Link>
            ))}

            {player && (
              <>
                <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '12px 8px 4px' }}>Más opciones</div>
                {moreLinks.map(l => (
                  <Link key={l.href} href={l.href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px', borderRadius: 10, fontSize: '0.95rem', fontWeight: 500, color: isActive(l.href) ? 'var(--gold)' : 'rgba(255,255,255,0.75)', background: isActive(l.href) ? 'rgba(244,197,66,0.08)' : 'none', marginBottom: 2 }}>
                    <span style={{ color: isActive(l.href) ? 'var(--gold)' : 'rgba(255,255,255,0.3)' }}>{l.icon}</span>
                    {l.label}
                  </Link>
                ))}
                {player?.is_admin && (
                  <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px', borderRadius: 10, fontSize: '0.95rem', fontWeight: 500, color: '#FF6B6B', background: isActive('/admin') ? 'rgba(214,40,40,0.08)' : 'none', marginBottom: 2 }}>
                    <span style={{ color: 'rgba(255,100,100,0.5)' }}>{Icons.admin}</span>
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {player ? (
              <button onClick={() => { logout(); setMenuOpen(false) }} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(214,40,40,0.08)', border: '1px solid rgba(214,40,40,0.2)', color: '#FF6B6B', borderRadius: 10, padding: '13px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                {Icons.logout} Cerrar Sesión
              </button>
            ) : (
              <Link href="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg, #C89B1A, #FF0000)', color: 'white', borderRadius: 10, padding: '13px', fontWeight: 700, fontSize: '1rem' }}>
                Entrar a la Quiniela
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
