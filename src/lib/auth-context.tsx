'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface Player {
  id: string
  username: string
  is_admin: boolean
}

interface AuthContextType {
  player: Player | null
  login: (username: string, password: string) => Promise<{ error?: string }>
  register: (username: string, password: string, email?: string) => Promise<{ error?: string }>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('quiniela_player')
    if (stored) {
      try { setPlayer(JSON.parse(stored)) } catch {}
    }
    setLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    if (data.error) return { error: data.error }
    setPlayer(data.player)
    localStorage.setItem('quiniela_player', JSON.stringify(data.player))
    return {}
  }

  const register = async (username: string, password: string, email?: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, email }),
    })
    const data = await res.json()
    if (data.error) return { error: data.error }
    setPlayer(data.player)
    localStorage.setItem('quiniela_player', JSON.stringify(data.player))
    return {}
  }

  const logout = () => {
    setPlayer(null)
    localStorage.removeItem('quiniela_player')
  }

  return (
    <AuthContext.Provider value={{ player, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
