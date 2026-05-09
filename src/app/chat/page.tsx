'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

interface Message {
  id: string
  player_id: string
  username: string
  message: string
  created_at: string
}

const COLORS = [
  'linear-gradient(135deg,#F4C542,#E8A87C)',
  'linear-gradient(135deg,#3B82F6,#06B6D4)',
  'linear-gradient(135deg,#D62828,#F97316)',
  'linear-gradient(135deg,#2ECC71,#06B6D4)',
  'linear-gradient(135deg,#8B5CF6,#EC4899)',
  'linear-gradient(135deg,#F97316,#EF4444)',
  'linear-gradient(135deg,#10B981,#84CC16)',
  'linear-gradient(135deg,#EC4899,#8B5CF6)',
]

const userColors: Record<string, string> = {}
let colorIdx = 0

function getUserColor(username: string) {
  if (!userColors[username]) {
    userColors[username] = COLORS[colorIdx % COLORS.length]
    colorIdx++
  }
  return userColors[username]
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatPage() {
  const { player, loading } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!loading && !player) router.push('/login')
  }, [player, loading])

  const loadMessages = useCallback(async () => {
    const res = await fetch('/api/chat?t=' + Date.now(), { cache: 'no-store' })
    const { data } = await res.json()
    if (data) setMessages(data)
  }, [])

  useEffect(() => {
    loadMessages()
    const t = setInterval(loadMessages, 5000)
    return () => clearInterval(t)
  }, [loadMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!player || !text.trim() || sending) return
    setSending(true)
    const msg = text.trim()
    setText('')
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: player.id, username: player.username, message: msg }),
    })
    await loadMessages()
    setSending(false)
    inputRef.current?.focus()
  }

  const deleteMsg = async (id: string) => {
    await fetch('/api/chat?id=' + id, { method: 'DELETE' })
    setMessages(m => m.filter(msg => msg.id !== id))
  }

  if (loading || !player) return null

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px 0', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)' }}>

      <div style={{ marginBottom: 16, flexShrink: 0 }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: 'var(--gold)', letterSpacing: '0.06em' }}>
          💬 Chat
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: 2 }}>
          Habla con tus amigos de la quiniela. Se actualiza cada 5 segundos.
        </p>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(17,17,24,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px 16px 0 0', padding: '16px', backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>💬</div>
            <p style={{ fontSize: '0.85rem' }}>Nadie ha escrito aun. Se el primero!</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.player_id === player.id
            return (
              <div key={msg.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: getUserColor(msg.username), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.95rem', color: 'var(--dark)', flexShrink: 0 }}>
                  {msg.username.charAt(0).toUpperCase()}
                </div>
                <div style={{ maxWidth: '70%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexDirection: isMe ? 'row-reverse' : 'row' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isMe ? 'var(--gold)' : 'var(--text)' }}>{msg.username}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{formatTime(msg.created_at)}</span>
                    {(isMe || player.is_admin) && (
                      <button onClick={() => deleteMsg(msg.id)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.7rem', padding: '0 2px', opacity: 0.5 }} title="Borrar">✕</button>
                    )}
                  </div>
                  <div style={{ background: isMe ? 'rgba(244,197,66,0.12)' : 'rgba(255,255,255,0.06)', border: '1px solid ' + (isMe ? 'rgba(244,197,66,0.2)' : 'rgba(255,255,255,0.08)'), borderRadius: isMe ? '12px 4px 12px 12px' : '4px 12px 12px 12px', padding: '8px 12px', fontSize: '0.88rem', lineHeight: 1.5, wordBreak: 'break-word' }}>
                    {msg.message}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ flexShrink: 0, background: 'rgba(17,17,24,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderTop: 'none', borderRadius: '0 0 16px 16px', padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: getUserColor(player.username), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.85rem', color: 'var(--dark)', flexShrink: 0 }}>
          {player.username.charAt(0).toUpperCase()}
        </div>
        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Escribe un mensaje..."
          maxLength={300}
          style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: 'var(--text)', fontFamily: "'Outfit', sans-serif", fontSize: '0.9rem', outline: 'none' }}
          onFocus={e => e.target.style.borderColor = 'rgba(244,197,66,0.4)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        />
        <button onClick={send} disabled={!text.trim() || sending} style={{ background: text.trim() ? 'linear-gradient(135deg, var(--gold), #FF0000)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 10, padding: '10px 16px', cursor: text.trim() ? 'pointer' : 'not-allowed', color: text.trim() ? '#fff' : 'var(--muted)', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', letterSpacing: '0.06em', transition: 'all 0.2s', flexShrink: 0 }}>
          {sending ? '...' : 'Enviar'}
        </button>
      </div>
    </div>
  )
}
