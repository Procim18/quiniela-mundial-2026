'use client'
import Link from 'next/link'

const SoccerIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
const TrophyIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M18 2H6v7a6 6 0 0 0 12 0V2z"/><path d="M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/></svg>
const StarIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const ClockIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const LockIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
const CheckIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
const InfoIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>

export default function ReglasPage() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 16px 60px' }}>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: 'var(--text)', letterSpacing: '0.06em', lineHeight: 1 }}>Reglas</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: 4 }}>Todo lo que necesitas saber para participar en la Quiniela Mundial 2026.</p>
      </div>

      {[
        {
          icon: <SoccerIcon />, title: 'Fase de Grupos', color: '#C89B1A', border: 'rgba(200,155,26,0.2)', bg: 'rgba(200,155,26,0.04)',
          items: [
            { pts: '3', label: 'Resultado exacto', desc: 'Acertaste el marcador exacto. Ej: predijiste 2-1 y fue 2-1.', color: '#F4C542', border: 'rgba(244,197,66,0.3)', bg: 'rgba(244,197,66,0.08)' },
            { pts: '1', label: 'Ganador o empate', desc: 'Acertaste quien gano o que empataron, pero no el marcador exacto.', color: '#3B82F6', border: 'rgba(59,130,246,0.3)', bg: 'rgba(59,130,246,0.08)' },
            { pts: '0', label: 'Fallo', desc: 'Predijiste que ganaba un equipo y gano el otro.', color: 'rgba(255,255,255,0.3)', border: 'rgba(255,255,255,0.1)', bg: 'rgba(255,255,255,0.03)' },
          ]
        },
        {
          icon: <TrophyIcon />, title: 'Eliminatorias', color: '#3B82F6', border: 'rgba(59,130,246,0.2)', bg: 'rgba(59,130,246,0.04)',
          items: [
            { pts: '4/1', label: 'Todas las rondas', desc: '2pts resultado exacto + 1pt ganador en 90min + 1pt quien avanza. Máximo 4pts por partido.', color: '#F4C542', border: 'rgba(244,197,66,0.2)', bg: 'rgba(244,197,66,0.05)' },
          ]
        },
        {
          icon: <StarIcon />, title: 'Campeon del Mundial', color: '#8B5CF6', border: 'rgba(139,92,246,0.2)', bg: 'rgba(139,92,246,0.04)',
          items: [
            { pts: '10', label: 'Aciertas el campeon', desc: 'Si el equipo que elegiste gana el Mundial, recibes 10 puntos bonus.', color: '#8B5CF6', border: 'rgba(139,92,246,0.3)', bg: 'rgba(139,92,246,0.08)' },
          ]
        },
      ].map(section => (
        <div key={section.title} style={{ background: section.bg, border: '1px solid ' + section.border, borderRadius: 14, padding: '20px', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ color: section.color }}>{section.icon}</span>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', color: section.color, letterSpacing: '0.08em' }}>{section.title}</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {section.items.map(item => (
              <div key={item.pts} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: item.bg, border: '1px solid ' + item.border, borderRadius: 9, padding: '11px 14px' }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', color: item.color, minWidth: 42, flexShrink: 0, lineHeight: 1.2 }}>{item.pts}<span style={{ fontSize: '0.6rem', marginLeft: 1 }}>pts</span></div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.78rem', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}


      <div style={{ background: 'rgba(10,10,16,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px', marginBottom: 24, backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ color: 'var(--gold)' }}><InfoIcon /></span>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', color: 'var(--muted)', letterSpacing: '0.08em' }}>REGLAS GENERALES</h2>
        </div>
        {[
          'Las predicciones se cierran automaticamente 1 hora antes del primer partido de cada fase.',
          'Una vez cerradas las predicciones no se pueden modificar.',
          'Si no pusiste prediccion para un partido, ese partido vale 0 puntos.',
          'En eliminatorias debes predecir el marcador Y quien avanza por si hay penales.',
          'En caso de empate en puntos gana quien tenga mas resultados exactos.',
          'El campeon del Mundial se puede cambiar hasta el cierre de la fase de grupos.',
          'El admin ingresa los resultados reales y los puntos se calculan automaticamente.',
          'Si olvidaste tu contrasena contacta al admin para que la resetee.',
        ].map((rule, i, arr) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <span style={{ color: 'var(--green)', flexShrink: 0, marginTop: 1 }}><CheckIcon /></span>
            <span style={{ color: 'var(--muted)', fontSize: '0.82rem', lineHeight: 1.6 }}>{rule}</span>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <Link href="/grupos" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #C89B1A, #F4C542)', color: '#0a0a10', borderRadius: 10, padding: '13px 28px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.08em', fontWeight: 900 }}>
          Ir a Mis Predicciones
        </Link>
      </div>
    </div>
  )
}
