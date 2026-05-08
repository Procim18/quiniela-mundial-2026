'use client'

interface MatchCardProps {
  matchId: string
  homeFlag: string
  homeName: string
  awayFlag: string
  awayName: string
  group?: string
  homeScore: string
  awayScore: string
  onHomeChange: (v: string) => void
  onAwayChange: (v: string) => void
  saving?: boolean
  saved?: boolean
  isResult?: boolean
  label?: string
}

export default function MatchCard({
  matchId, homeFlag, homeName, awayFlag, awayName,
  group, homeScore, awayScore, onHomeChange, onAwayChange,
  saving, saved, isResult, label,
}: MatchCardProps) {

  const boxStyle = (isResult?: boolean): React.CSSProperties => ({
    width: 44, height: 44,
    background: isResult ? 'rgba(214,40,40,0.12)' : 'var(--dark4)',
    border: `1px solid ${isResult ? 'rgba(214,40,40,0.35)' : 'var(--border2)'}`,
    borderRadius: 10, textAlign: 'center',
    fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem',
    color: isResult ? '#FF6B6B' : 'var(--text)',
    outline: 'none', width: '44px',
  })

  return (
    <div style={{
      background: 'var(--dark3)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '16px 20px', marginBottom: 10,
      transition: 'border-color 0.2s',
    }}>
      {(group || label) && (
        <div style={{ fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
          {group ? `📍 Grupo ${group} ·` : ''} {label || `${homeName} vs ${awayName}`}
          {saved && <span style={{ color: 'var(--green)', marginLeft: 10 }}>✓ Guardado</span>}
          {saving && <span style={{ color: 'var(--gold)', marginLeft: 10 }}>Guardando...</span>}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <span style={{ fontSize: '1.6rem' }}>{homeFlag}</span>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{homeName}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <input
            type="number" min={0} max={20}
            value={homeScore}
            onChange={e => onHomeChange(e.target.value)}
            style={boxStyle(isResult)}
            onFocus={e => e.target.style.borderColor = isResult ? 'var(--red)' : 'rgba(244,197,66,0.5)'}
            onBlur={e => e.target.style.borderColor = isResult ? 'rgba(214,40,40,0.35)' : 'var(--border2)'}
          />
          <span style={{ color: 'var(--muted)', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem' }}>-</span>
          <input
            type="number" min={0} max={20}
            value={awayScore}
            onChange={e => onAwayChange(e.target.value)}
            style={boxStyle(isResult)}
            onFocus={e => e.target.style.borderColor = isResult ? 'var(--red)' : 'rgba(244,197,66,0.5)'}
            onBlur={e => e.target.style.borderColor = isResult ? 'rgba(214,40,40,0.35)' : 'var(--border2)'}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'flex-end' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', textAlign: 'right' }}>{awayName}</span>
          <span style={{ fontSize: '1.6rem' }}>{awayFlag}</span>
        </div>
      </div>
    </div>
  )
}
