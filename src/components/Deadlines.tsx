'use client'
import { DEADLINES } from '@/lib/data'
import { useState, useEffect } from 'react'

interface DeadlineItem {
  label: string
  key: string
  date: Date
}

const ITEMS: DeadlineItem[] = [
  { label: 'Fase de Grupos', key: 'grupos', date: DEADLINES.grupos },
  { label: 'Ronda de 32', key: 'R32', date: DEADLINES.R32 },
  { label: 'Octavos', key: 'R16', date: DEADLINES.R16 },
  { label: 'Cuartos', key: 'QF', date: DEADLINES.QF },
  { label: 'Semifinales', key: 'SF', date: DEADLINES.SF },
  { label: 'Gran Final', key: 'FINAL', date: DEADLINES.FINAL },
]

function formatDate(d: Date): string {
  return d.toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }) + ' ET'
}

function getDaysLeft(d: Date): number {
  return Math.ceil((d.getTime() - Date.now()) / 86400000)
}

export default function Deadlines() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  const upcoming = ITEMS.filter(i => now < i.date)
  const past = ITEMS.filter(i => now >= i.date)

  return (
    <div style={{ background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px 24px', backdropFilter: 'blur(12px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: '1.2rem' }}>⏰</span>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: 'var(--gold)', letterSpacing: '0.06em' }}>
          Cierre de Predicciones
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ITEMS.map(item => {
          const isPast = now >= item.date
          const daysLeft = getDaysLeft(item.date)
          const isClose = daysLeft <= 3 && !isPast

          return (
            <div key={item.key} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', borderRadius: 10,
              background: isPast ? 'rgba(255,255,255,0.02)' : isClose ? 'rgba(244,197,66,0.06)' : 'rgba(255,255,255,0.03)',
              border: '1px solid ' + (isPast ? 'rgba(255,255,255,0.04)' : isClose ? 'rgba(244,197,66,0.2)' : 'rgba(255,255,255,0.06)'),
              flexWrap: 'wrap', gap: 6,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.85rem' }}>{isPast ? '🔒' : isClose ? '⚠️' : '🟢'}</span>
                <span style={{ fontWeight: 600, fontSize: '0.88rem', color: isPast ? 'var(--muted)' : 'var(--text)' }}>
                  {item.label}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{formatDate(item.date)}</span>
                {isPast
                  ? <span style={{ fontSize: '0.72rem', color: 'var(--muted)', background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '2px 8px' }}>Cerrado</span>
                  : <span style={{ fontSize: '0.72rem', fontFamily: "'Bebas Neue', sans-serif", color: isClose ? 'var(--gold)' : 'var(--green)', background: isClose ? 'rgba(244,197,66,0.1)' : 'rgba(46,204,113,0.1)', borderRadius: 6, padding: '2px 8px' }}>
                    {daysLeft === 0 ? 'Hoy' : daysLeft === 1 ? 'Manana' : daysLeft + ' dias'}
                  </span>
                }
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
