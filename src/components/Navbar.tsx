'use client'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const { player, logout } = useAuth()
  const path = usePathname()

  const links = [
    { href: '/', label: '🏠 Inicio' },
    { href: '/grupos', label: '⚽ Grupos' },
    { href: '/eliminatorias', label: '🏆 Eliminatorias' },
    { href: '/clasificacion', label: '📊 Tabla' },
  ]

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(10,10,15,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(244,197,66,0.12)',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '0 20px',
        display: 'flex', alignItems: 'center', gap: 8, height: 56,
      }}>
        <Link href="/" style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '1.3rem', letterSpacing: '0.06em',
          color: 'var(--gold)', marginRight: 16, flexShrink: 0,
        }}>
          🏆 Mundial 2026
        </Link>

        <div style={{ display: 'flex', gap: 2, flex: 1, overflowX: 'auto' }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: '0.83rem',
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
              padding: '6px 14px', borderRadius: 8, fontSize: '0.83rem',
              fontWeight: 500, whiteSpace: 'nowrap',
              color: path === '/admin' ? '#FF6B6B' : 'var(--muted)',
              background: path === '/admin' ? 'rgba(214,40,40,0.1)' : 'none',
            }}>
              🔧 Admin
            </Link>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {player ? (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--dark3)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '5px 12px',
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--gold), var(--red))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.9rem', color: 'var(--dark)',
                }}>
                  {player.username.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.83rem', fontWeight: 500 }}>{player.username}</span>
              </div>
              <button onClick={logout} style={{
                background: 'none', border: '1px solid var(--border2)',
                color: 'var(--muted)', borderRadius: 8, padding: '5px 12px',
                cursor: 'pointer', fontSize: '0.8rem',
              }}>
                Salir
              </button>
            </>
          ) : (
            <Link href="/login" style={{
              background: 'var(--gold)', color: 'var(--dark)',
              borderRadius: 8, padding: '6px 16px', fontWeight: 600,
              fontSize: '0.85rem',
            }}>
              Entrar
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
