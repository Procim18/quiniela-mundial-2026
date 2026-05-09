'use client'
import Link from 'next/link'

export default function ReglasPage() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px 60px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: 'var(--gold)', letterSpacing: '0.06em' }}>
          Reglas de la Quiniela
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 4 }}>
          Todo lo que necesitas saber para participar.
        </p>
      </div>

      {[
        {
          icon: '⚽',
          title: 'Fase de Grupos',
          color: 'var(--gold)',
          border: 'rgba(244,197,66,0.2)',
          content: [
            { pts: '3 pts', label: 'Resultado exacto', desc: 'Predijiste el marcador correcto. Ej: predijiste 2-1 y fue 2-1.', color: 'var(--gold)' },
            { pts: '1 pt', label: 'Solo el ganador o empate', desc: 'Acertaste quien gano o que empataron, pero no el marcador exacto.', color: 'var(--blue)' },
            { pts: '0 pts', label: 'Fallo total', desc: 'Predijiste que ganaba un equipo y gano el otro, o no pusiste prediccion.', color: 'var(--muted)' },
          ]
        },
        {
          icon: '🏆',
          title: 'Eliminatorias',
          color: '#3B82F6',
          border: 'rgba(59,130,246,0.2)',
          content: [
            { pts: '2 pts', label: 'Ronda de 32 - Exacto', desc: 'Marcador exacto mas quien avanza correcto.', color: 'var(--gold)' },
            { pts: '1 pt', label: 'Ronda de 32 - Ganador', desc: 'Solo acertaste quien avanza.', color: 'var(--blue)' },
            { pts: '3 pts', label: 'Octavos - Exacto', desc: 'Marcador exacto mas quien avanza.', color: 'var(--gold)' },
            { pts: '4 pts', label: 'Cuartos - Exacto', desc: 'Marcador exacto mas quien avanza.', color: 'var(--gold)' },
            { pts: '5 pts', label: 'Semifinal - Exacto', desc: 'Marcador exacto mas quien avanza.', color: 'var(--gold)' },
            { pts: '6 pts', label: 'Final - Exacto', desc: 'Marcador exacto del partido final.', color: 'var(--gold)' },
          ]
        },
        {
          icon: '👑',
          title: 'Campeon del Mundial',
          color: 'var(--purple)',
          border: 'rgba(139,92,246,0.2)',
          content: [
            { pts: '10 pts', label: 'Aciertas el campeon', desc: 'Si el equipo que elegiste gana el Mundial recibes 10 puntos bonus.', color: 'var(--purple)' },
          ]
        },
      ].map(section => (
        <div key={section.title} style={{ background: 'rgba(17,17,24,0.8)', border: '1px solid ' + section.border, borderRadius: 16, padding: '24px', marginBottom: 20, backdropFilter: 'blur(12px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: '1.5rem' }}>{section.icon}</span>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: section.color, letterSpacing: '0.06em' }}>{section.title}</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {section.content.map(item => (
              <div key={item.pts} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', color: item.color, background: item.color + '18', borderRadius: 8, padding: '4px 10px', minWidth: 60, textAlign: 'center', flexShrink: 0 }}>{item.pts}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 3 }}>{item.label}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px', marginBottom: 20, backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: '1.5rem' }}>⏰</span>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: 'var(--gold)', letterSpacing: '0.06em' }}>Fechas Limite</h2>
        </div>
        {[
          { fase: 'Fase de Grupos', fecha: '11 Jun 2026 - 14:00 ET' },
          { fase: 'Ronda de 32', fecha: '28 Jun 2026 - 14:00 ET' },
          { fase: 'Octavos de Final', fecha: '4 Jul 2026 - 12:00 ET' },
          { fase: 'Cuartos de Final', fecha: '9 Jul 2026 - 15:00 ET' },
          { fase: 'Semifinales', fecha: '14 Jul 2026 - 14:00 ET' },
          { fase: 'Gran Final', fecha: '19 Jul 2026 - 14:00 ET' },
        ].map((d, i) => (
          <div key={d.fase} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.05)' : 'none', flexWrap: 'wrap', gap: 6 }}>
            <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{d.fase}</span>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.9rem', color: 'var(--gold)', background: 'rgba(244,197,66,0.08)', borderRadius: 6, padding: '3px 10px' }}>{d.fecha}</span>
          </div>
        ))}
      </div>

      <div style={{ background: 'rgba(17,17,24,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px', backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: '1.5rem' }}>📋</span>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: 'var(--gold)', letterSpacing: '0.06em' }}>Reglas Generales</h2>
        </div>
        {[
          'Las predicciones se cierran automaticamente 1 hora antes del primer partido de cada fase.',
          'Una vez cerradas las predicciones no se pueden modificar.',
          'Si no pusiste una prediccion para un partido ese partido vale 0 puntos.',
          'En eliminatorias debes predecir el marcador Y quien avanza por si hay penales.',
          'En caso de empate en puntos gana quien tenga mas resultados exactos.',
          'El campeon del Mundial se puede cambiar hasta el cierre de la fase de grupos.',
          'El admin ingresa los resultados reales y los puntos se calculan automaticamente.',
          'Si olvidaste tu contrasena contacta al admin para que la resetee.',
        ].map((rule, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '8px 0', borderBottom: i < 7 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', color: 'var(--gold)', minWidth: 24, flexShrink: 0 }}>{i + 1}</span>
            <span style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>{rule}</span>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <Link href="/grupos" style={{ background: 'linear-gradient(135deg, var(--gold), #FF0000)', color: '#fff', borderRadius: 12, padding: '14px 32px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', letterSpacing: '0.08em', display: 'inline-block' }}>
          Ir a Mis Predicciones
        </Link>
      </div>
    </div>
  )
}
