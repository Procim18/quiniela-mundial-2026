'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const router = useRouter()

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password.trim()) { setError('Completa todos los campos'); return }
    if (mode === 'register' && !email.trim()) { setError('El correo es obligatorio'); return }
    setLoading(true)
    const res = mode === 'login' ? await login(username.trim(), password) : await register(username.trim(), password, email.trim())
    setLoading(false)
    if (res.error) { setError(res.error); return }
    router.push('/grupos')
  }

  return (
    <div style={{
      minHeight: '90vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '40px 20px',
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--dark3)', border: '1px solid var(--border)',
        borderRadius: 20, padding: '40px 36px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚽</div>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '2rem', letterSpacing: '0.06em', color: 'var(--gold)',
          }}>
            {mode === 'login' ? 'Iniciar Sesión' : 'Registro'}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 6 }}>
            {mode === 'login' ? 'Entra a tu cuenta de la quiniela' : 'Crea tu cuenta para participar'}
          </p>
        </div>

        <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Nombre de usuario
            </label>
            <input
              value={username} onChange={e => setUsername(e.target.value)}
              placeholder="ej: Pepito"
              maxLength={20}
              style={{
                width: '100%', background: 'var(--dark4)',
                border: '1px solid var(--border2)', borderRadius: 10,
                padding: '12px 16px', color: 'var(--text)',
                fontFamily: "'Outfit', sans-serif", fontSize: '0.95rem', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(244,197,66,0.5)'}
              onBlur={e => e.target.style.borderColor = 'var(--border2)'}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%', background: 'var(--dark4)',
                border: '1px solid var(--border2)', borderRadius: 10,
                padding: '12px 16px', color: 'var(--text)',
                fontFamily: "'Outfit', sans-serif", fontSize: '0.95rem', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(244,197,66,0.5)'}
              onBlur={e => e.target.style.borderColor = 'var(--border2)'}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(214,40,40,0.12)', border: '1px solid rgba(214,40,40,0.3)',
              borderRadius: 8, padding: '10px 14px', fontSize: '0.85rem', color: '#FF6B6B',
            }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
            color: 'var(--dark)', border: 'none', borderRadius: 10,
            padding: '14px', fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '1.1rem', letterSpacing: '0.08em',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, marginTop: 4,
          }}>
            {loading ? 'Cargando...' : mode === 'login' ? '🚀 Entrar' : '✅ Crear Cuenta'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }} style={{
            background: 'none', border: 'none', color: 'var(--muted)',
            cursor: 'pointer', fontSize: '0.85rem',
          }}>
            {mode === 'login' ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  )
}
