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

  if (past) return <span style={{ fontSize: '0.65rem', color: '#FF6B6B', background: 'rgba(214,40,40,0.1)', borderRadius: 6, padding: '2px 8px', letterSpacing: '0.05em' }}>🔒 CERRADO</span>
  return (
    <span style={{ fontSize: '0.65rem', color: 'var(--gold)', background: 'rgba(244,197,66,0.08)', borderRadius: 6, padding: '2px 8px', letterSpacing: '0.05em', border: '1px solid rgba(244,197,66,0.15)', whiteSpace: 'nowrap' }}>
      ⏰ {days}d {hours}h
    </span>
  )
}

export default function Navbar() {
  const { player, logout } = useAuth()
  const path = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const publicLinks = [{ href: '/', label: '🏠 Inicio' }]
  const privateLinks = [
    { href: '/grupos', label: '⚽ Grupos' },
    { href: '/eliminatorias', label: '🏆 Eliminatorias' },
    { href: '/clasificacion', label: '📊 Tabla' },
    { href: '/predicciones', label: '👁️ Predicciones' },
    { href: '/estadisticas', label: '📈 Stats' },
  ]
  const links = player ? [...publicLinks, ...privateLinks] : publicLinks

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(5,5,8,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(244,197,66,0.1)' }}>
      {/* Main navbar */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', gap: 8, height: 54 }}>

        {/* Logo */}
        <Link href="/" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', letterSpacing: '0.06em', color: 'var(--gold)', marginRight: 8, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          🏆 <span style={{ display: 'none' }} className="sm-show">Mundial 2026</span>
        </Link>

        <DaysCounter />

        {/* Desktop links */}
        <div style={{ display: 'flex', gap: 2, flex: 1, overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} style={{
              padding: '5px 10px', borderRadius: 7, fontSize: '0.78rem',
              fontWeight: 500, whiteSpace: 'nowrap',
              color: path === l.href ? 'var(--gold)' : 'var(--muted)',
              background: path === l.href ? 'rgba(244,197,66,0.08)' : 'none',
              transition: 'all 0.15s',
            }}>
              {l.label}
            </Link>
          ))}
          {player?.is_admin && (
            <Link href="/admin" style={{
              padding: '5px 10px', borderRadius: 7, fontSize: '0.78rem',
              fontWeight: 500, whiteSpace: 'nowrap',
              color: path === '/admin' ? '#FF6B6B' : 'var(--muted)',
              background: path === '/admin' ? 'rgba(214,40,40,0.08)' : 'none',
            }}>
              🔧 Admin
            </Link>
          )}
        </div>

        {/* User */}
        {player ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '4px 10px' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--red))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.85rem', color: 'var(--dark)', flexShrink: 0 }}>
                {player.username.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 500, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{player.username}</span>
            </div>
            <button onClick={logout} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--muted)', borderRadius: 7, padding: '4px 10px', cursor: 'pointer', fontSize: '0.75rem', flexShrink: 0 }}>
              Salir
            </button>
          </div>
        ) : (
          <Link href="/login" style={{ background: 'linear-gradient(135deg, var(--gold), #FF0000)', color: '#fff', borderRadius: 8, padding: '6px 14px', fontWeight: 700, fontSize: '0.82rem', flexShrink: 0 }}>
            Entrar
          </Link>
        )}
      </div>

      {/* Nike stripe */}
      <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, var(--gold), #FF0000, var(--gold), transparent)', backgroundSize: '200% 100%', animation: 'stripeSlide 3s linear infinite' }} />
    </nav>
  )
}
