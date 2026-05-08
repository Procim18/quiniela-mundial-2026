export interface Team {
  name: string
  flag: string
}

export interface GroupMatch {
  id: string
  home: Team
  away: Team
  group: string
  matchday: number
}

export const GROUPS: Record<string, Team[]> = {
  A: [
    { name: 'México', flag: '🇲🇽' },
    { name: 'Polonia', flag: '🇵🇱' },
    { name: 'Arabia Saudita', flag: '🇸🇦' },
    { name: 'Ecuador', flag: '🇪🇨' },
  ],
  B: [
    { name: 'Argentina', flag: '🇦🇷' },
    { name: 'Croacia', flag: '🇭🇷' },
    { name: 'Marruecos', flag: '🇲🇦' },
    { name: 'Canadá', flag: '🇨🇦' },
  ],
  C: [
    { name: 'USA', flag: '🇺🇸' },
    { name: 'Países Bajos', flag: '🇳🇱' },
    { name: 'Irán', flag: '🇮🇷' },
    { name: 'Senegal', flag: '🇸🇳' },
  ],
  D: [
    { name: 'Francia', flag: '🇫🇷' },
    { name: 'Dinamarca', flag: '🇩🇰' },
    { name: 'Túnez', flag: '🇹🇳' },
    { name: 'Australia', flag: '🇦🇺' },
  ],
  E: [
    { name: 'España', flag: '🇪🇸' },
    { name: 'Alemania', flag: '🇩🇪' },
    { name: 'Costa Rica', flag: '🇨🇷' },
    { name: 'Japón', flag: '🇯🇵' },
  ],
  F: [
    { name: 'Bélgica', flag: '🇧🇪' },
    { name: 'Portugal', flag: '🇵🇹' },
    { name: 'Uruguay', flag: '🇺🇾' },
    { name: 'Ghana', flag: '🇬🇭' },
  ],
  G: [
    { name: 'Brasil', flag: '🇧🇷' },
    { name: 'Serbia', flag: '🇷🇸' },
    { name: 'Suiza', flag: '🇨🇭' },
    { name: 'Camerún', flag: '🇨🇲' },
  ],
  H: [
    { name: 'Corea del Sur', flag: '🇰🇷' },
    { name: 'Ghana', flag: '🇬🇭' },
    { name: 'Portugal', flag: '🇵🇹' },
    { name: 'Uruguay', flag: '🇺🇾' },
  ],
  I: [
    { name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { name: 'Irán', flag: '🇮🇷' },
    { name: 'Gales', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
    { name: 'Rep. Checa', flag: '🇨🇿' },
  ],
  J: [
    { name: 'Colombia', flag: '🇨🇴' },
    { name: 'Chile', flag: '🇨🇱' },
    { name: 'Nigeria', flag: '🇳🇬' },
    { name: 'Bolivia', flag: '🇧🇴' },
  ],
  K: [
    { name: 'Italia', flag: '🇮🇹' },
    { name: 'Turquía', flag: '🇹🇷' },
    { name: 'Perú', flag: '🇵🇪' },
    { name: 'Argelia', flag: '🇩🇿' },
  ],
  L: [
    { name: 'Países Bajos', flag: '🇳🇱' },
    { name: 'Egipto', flag: '🇪🇬' },
    { name: 'Venezuela', flag: '🇻🇪' },
    { name: 'Escocia', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  ],
}

export function getGroupMatches(): GroupMatch[] {
  const matches: GroupMatch[] = []
  for (const [group, teams] of Object.entries(GROUPS)) {
    let idx = 0
    const pairs = [[0,1],[2,3],[0,2],[1,3],[0,3],[1,2]]
    pairs.forEach(([i, j], matchday) => {
      matches.push({
        id: `${group}_${idx}`,
        home: teams[i],
        away: teams[j],
        group,
        matchday: Math.floor(matchday / 2) + 1,
      })
      idx++
    })
  }
  return matches
}

// Knockout rounds - equipos TBD hasta que avance la fase de grupos
export const KNOCKOUT_ROUNDS = [
  {
    id: 'R16',
    label: 'Octavos de Final',
    matches: Array.from({ length: 16 }, (_, i) => ({
      id: `R16_${i}`,
      label: `Partido ${i + 1}`,
      home: { name: 'Por definir', flag: '🏳️' },
      away: { name: 'Por definir', flag: '🏳️' },
    })),
  },
  {
    id: 'QF',
    label: 'Cuartos de Final',
    matches: Array.from({ length: 8 }, (_, i) => ({
      id: `QF_${i}`,
      label: `Partido ${i + 1}`,
      home: { name: 'Por definir', flag: '🏳️' },
      away: { name: 'Por definir', flag: '🏳️' },
    })),
  },
  {
    id: 'SF',
    label: 'Semifinales',
    matches: Array.from({ length: 4 }, (_, i) => ({
      id: `SF_${i}`,
      label: `Partido ${i + 1}`,
      home: { name: 'Por definir', flag: '🏳️' },
      away: { name: 'Por definir', flag: '🏳️' },
    })),
  },
  {
    id: 'THIRD',
    label: 'Tercer Puesto',
    matches: [{
      id: 'THIRD_0',
      label: 'Tercer y Cuarto Lugar',
      home: { name: 'Por definir', flag: '🏳️' },
      away: { name: 'Por definir', flag: '🏳️' },
    }],
  },
  {
    id: 'FINAL',
    label: 'Gran Final',
    matches: [{
      id: 'FINAL_0',
      label: 'Final Mundial 2026',
      home: { name: 'Por definir', flag: '🏳️' },
      away: { name: 'Por definir', flag: '🏳️' },
    }],
  },
]

// Puntos por ronda en eliminatorias
export const KNOCKOUT_POINTS: Record<string, { exact: number; winner: number }> = {
  R16:   { exact: 3, winner: 1 },
  QF:    { exact: 4, winner: 2 },
  SF:    { exact: 5, winner: 2 },
  THIRD: { exact: 4, winner: 2 },
  FINAL: { exact: 6, winner: 3 },
}

export const CHAMPION_POINTS = 10

export function getOutcome(h: number, a: number): 'H' | 'A' | 'D' {
  if (h > a) return 'H'
  if (a > h) return 'A'
  return 'D'
}

export const ALL_TEAMS = Object.values(GROUPS).flat()

export const DEADLINE = new Date('2026-06-11T00:00:00')

export function isPastDeadline(): boolean {
  return new Date() > DEADLINE
}
