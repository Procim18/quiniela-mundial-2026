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
  stadium: string
  city: string
  time: string
  date: string
}

export const GROUPS: Record<string, Team[]> = {
  A: [
    { name: 'Mexico', flag: '🇲🇽' },
    { name: 'Sudafrica', flag: '🇿🇦' },
    { name: 'Corea del Sur', flag: '🇰🇷' },
    { name: 'Chequia', flag: '🇨🇿' },
  ],
  B: [
    { name: 'Canada', flag: '🇨🇦' },
    { name: 'Bosnia-Herzegovina', flag: '🇧🇦' },
    { name: 'Qatar', flag: '🇶🇦' },
    { name: 'Suiza', flag: '🇨🇭' },
  ],
  C: [
    { name: 'Brasil', flag: '🇧🇷' },
    { name: 'Marruecos', flag: '🇲🇦' },
    { name: 'Haiti', flag: '🇭🇹' },
    { name: 'Escocia', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  ],
  D: [
    { name: 'USA', flag: '🇺🇸' },
    { name: 'Paraguay', flag: '🇵🇾' },
    { name: 'Australia', flag: '🇦🇺' },
    { name: 'Turquia', flag: '🇹🇷' },
  ],
  E: [
    { name: 'Alemania', flag: '🇩🇪' },
    { name: 'Curazao', flag: '🇨🇼' },
    { name: 'Costa de Marfil', flag: '🇨🇮' },
    { name: 'Ecuador', flag: '🇪🇨' },
  ],
  F: [
    { name: 'Paises Bajos', flag: '🇳🇱' },
    { name: 'Japon', flag: '🇯🇵' },
    { name: 'Suecia', flag: '🇸🇪' },
    { name: 'Tunez', flag: '🇹🇳' },
  ],
  G: [
    { name: 'Belgica', flag: '🇧🇪' },
    { name: 'Egipto', flag: '🇪🇬' },
    { name: 'Iran', flag: '🇮🇷' },
    { name: 'Nueva Zelanda', flag: '🇳🇿' },
  ],
  H: [
    { name: 'Espana', flag: '🇪🇸' },
    { name: 'Cabo Verde', flag: '🇨🇻' },
    { name: 'Arabia Saudita', flag: '🇸🇦' },
    { name: 'Uruguay', flag: '🇺🇾' },
  ],
  I: [
    { name: 'Francia', flag: '🇫🇷' },
    { name: 'Senegal', flag: '🇸🇳' },
    { name: 'Irak', flag: '🇮🇶' },
    { name: 'Noruega', flag: '🇳🇴' },
  ],
  J: [
    { name: 'Argentina', flag: '🇦🇷' },
    { name: 'Argelia', flag: '🇩🇿' },
    { name: 'Austria', flag: '🇦🇹' },
    { name: 'Jordania', flag: '🇯🇴' },
  ],
  K: [
    { name: 'Portugal', flag: '🇵🇹' },
    { name: 'RD Congo', flag: '🇨🇩' },
    { name: 'Uzbekistan', flag: '🇺🇿' },
    { name: 'Colombia', flag: '🇨🇴' },
  ],
  L: [
    { name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { name: 'Croacia', flag: '🇭🇷' },
    { name: 'Ghana', flag: '🇬🇭' },
    { name: 'Panama', flag: '🇵🇦' },
  ],
}

const MATCH_INFO: Record<string, Array<{stadium: string; city: string; time: string; date: string}>> = {
  A: [
    {stadium:'Estadio Azteca',city:'Ciudad de Mexico',time:'15:00',date:'11 Jun'},
    {stadium:'Estadio Akron',city:'Guadalajara',time:'22:00',date:'11 Jun'},
    {stadium:'Mercedes-Benz Stadium',city:'Atlanta',time:'12:00',date:'18 Jun'},
    {stadium:'Estadio Akron',city:'Guadalajara',time:'21:00',date:'18 Jun'},
    {stadium:'Estadio Azteca',city:'Ciudad de Mexico',time:'21:00',date:'24 Jun'},
    {stadium:'Estadio BBVA',city:'Monterrey',time:'21:00',date:'24 Jun'},
  ],
  B: [
    {stadium:'BMO Field',city:'Toronto',time:'15:00',date:'12 Jun'},
    {stadium:'Levis Stadium',city:'Santa Clara',time:'15:00',date:'13 Jun'},
    {stadium:'SoFi Stadium',city:'Los Angeles',time:'15:00',date:'18 Jun'},
    {stadium:'BC Place',city:'Vancouver',time:'18:00',date:'18 Jun'},
    {stadium:'BC Place',city:'Vancouver',time:'15:00',date:'24 Jun'},
    {stadium:'Lumen Field',city:'Seattle',time:'15:00',date:'24 Jun'},
  ],
  C: [
    {stadium:'MetLife Stadium',city:'Nueva Jersey',time:'18:00',date:'13 Jun'},
    {stadium:'Gillette Stadium',city:'Boston',time:'21:00',date:'13 Jun'},
    {stadium:'Gillette Stadium',city:'Boston',time:'18:00',date:'19 Jun'},
    {stadium:'Lincoln Financial Field',city:'Filadelfia',time:'20:30',date:'19 Jun'},
    {stadium:'Hard Rock Stadium',city:'Miami',time:'18:00',date:'24 Jun'},
    {stadium:'Mercedes-Benz Stadium',city:'Atlanta',time:'18:00',date:'24 Jun'},
  ],
  D: [
    {stadium:'SoFi Stadium',city:'Los Angeles',time:'21:00',date:'12 Jun'},
    {stadium:'BC Place',city:'Vancouver',time:'00:00',date:'14 Jun'},
    {stadium:'Lumen Field',city:'Seattle',time:'15:00',date:'19 Jun'},
    {stadium:'Levis Stadium',city:'Santa Clara',time:'23:00',date:'19 Jun'},
    {stadium:'SoFi Stadium',city:'Los Angeles',time:'22:00',date:'25 Jun'},
    {stadium:'Levis Stadium',city:'Santa Clara',time:'22:00',date:'25 Jun'},
  ],
  E: [
    {stadium:'NRG Stadium',city:'Houston',time:'13:00',date:'14 Jun'},
    {stadium:'Lincoln Financial Field',city:'Filadelfia',time:'19:00',date:'14 Jun'},
    {stadium:'BMO Field',city:'Toronto',time:'16:00',date:'20 Jun'},
    {stadium:'Arrowhead Stadium',city:'Kansas City',time:'20:00',date:'20 Jun'},
    {stadium:'MetLife Stadium',city:'Nueva Jersey',time:'16:00',date:'25 Jun'},
    {stadium:'Lincoln Financial Field',city:'Filadelfia',time:'16:00',date:'25 Jun'},
  ],
  F: [
    {stadium:'AT&T Stadium',city:'Dallas',time:'16:00',date:'14 Jun'},
    {stadium:'Estadio BBVA',city:'Monterrey',time:'22:00',date:'14 Jun'},
    {stadium:'NRG Stadium',city:'Houston',time:'13:00',date:'20 Jun'},
    {stadium:'Estadio BBVA',city:'Monterrey',time:'00:00',date:'21 Jun'},
    {stadium:'AT&T Stadium',city:'Dallas',time:'19:00',date:'25 Jun'},
    {stadium:'Arrowhead Stadium',city:'Kansas City',time:'19:00',date:'25 Jun'},
  ],
  G: [
    {stadium:'Lumen Field',city:'Seattle',time:'15:00',date:'15 Jun'},
    {stadium:'SoFi Stadium',city:'Los Angeles',time:'21:00',date:'15 Jun'},
    {stadium:'SoFi Stadium',city:'Los Angeles',time:'15:00',date:'21 Jun'},
    {stadium:'BC Place',city:'Vancouver',time:'21:00',date:'21 Jun'},
    {stadium:'Lumen Field',city:'Seattle',time:'23:00',date:'26 Jun'},
    {stadium:'BC Place',city:'Vancouver',time:'23:00',date:'26 Jun'},
  ],
  H: [
    {stadium:'Mercedes-Benz Stadium',city:'Atlanta',time:'12:00',date:'15 Jun'},
    {stadium:'Hard Rock Stadium',city:'Miami',time:'18:00',date:'15 Jun'},
    {stadium:'Mercedes-Benz Stadium',city:'Atlanta',time:'12:00',date:'21 Jun'},
    {stadium:'Hard Rock Stadium',city:'Miami',time:'18:00',date:'21 Jun'},
    {stadium:'Estadio Akron',city:'Guadalajara',time:'20:00',date:'26 Jun'},
    {stadium:'NRG Stadium',city:'Houston',time:'20:00',date:'26 Jun'},
  ],
  I: [
    {stadium:'MetLife Stadium',city:'Nueva Jersey',time:'15:00',date:'16 Jun'},
    {stadium:'Gillette Stadium',city:'Boston',time:'18:00',date:'16 Jun'},
    {stadium:'Lincoln Financial Field',city:'Filadelfia',time:'17:00',date:'22 Jun'},
    {stadium:'MetLife Stadium',city:'Nueva Jersey',time:'20:00',date:'22 Jun'},
    {stadium:'Gillette Stadium',city:'Boston',time:'15:00',date:'26 Jun'},
    {stadium:'BMO Field',city:'Toronto',time:'15:00',date:'26 Jun'},
  ],
  J: [
    {stadium:'Arrowhead Stadium',city:'Kansas City',time:'21:00',date:'16 Jun'},
    {stadium:'Levis Stadium',city:'Santa Clara',time:'00:00',date:'17 Jun'},
    {stadium:'AT&T Stadium',city:'Dallas',time:'13:00',date:'22 Jun'},
    {stadium:'Levis Stadium',city:'Santa Clara',time:'23:00',date:'22 Jun'},
    {stadium:'Arrowhead Stadium',city:'Kansas City',time:'22:00',date:'27 Jun'},
    {stadium:'AT&T Stadium',city:'Dallas',time:'22:00',date:'27 Jun'},
  ],
  K: [
    {stadium:'NRG Stadium',city:'Houston',time:'13:00',date:'17 Jun'},
    {stadium:'Estadio Azteca',city:'Ciudad de Mexico',time:'22:00',date:'17 Jun'},
    {stadium:'NRG Stadium',city:'Houston',time:'13:00',date:'23 Jun'},
    {stadium:'Estadio Akron',city:'Guadalajara',time:'22:00',date:'23 Jun'},
    {stadium:'Hard Rock Stadium',city:'Miami',time:'19:30',date:'27 Jun'},
    {stadium:'Mercedes-Benz Stadium',city:'Atlanta',time:'19:30',date:'27 Jun'},
  ],
  L: [
    {stadium:'AT&T Stadium',city:'Dallas',time:'16:00',date:'17 Jun'},
    {stadium:'BMO Field',city:'Toronto',time:'19:00',date:'17 Jun'},
    {stadium:'Gillette Stadium',city:'Boston',time:'16:00',date:'23 Jun'},
    {stadium:'BMO Field',city:'Toronto',time:'19:00',date:'23 Jun'},
    {stadium:'MetLife Stadium',city:'Nueva Jersey',time:'17:00',date:'27 Jun'},
    {stadium:'Lincoln Financial Field',city:'Filadelfia',time:'17:00',date:'27 Jun'},
  ],
}

export const PAIRS_BY_GROUP: Record<string, number[][]> = {
  A: [[0, 1], [2, 3], [3, 1], [0, 2], [3, 0], [1, 2]],
  B: [[0, 1], [2, 3], [3, 1], [0, 2], [3, 0], [1, 2]],
  C: [[0, 1], [2, 3], [3, 1], [0, 2], [3, 0], [1, 2]],
  D: [[0, 1], [2, 3], [0, 2], [3, 1], [3, 0], [1, 2]],
  E: [[0, 1], [2, 3], [0, 2], [3, 1], [1, 2], [3, 0]],
  F: [[0, 1], [2, 3], [0, 2], [3, 1], [1, 2], [3, 0]],
  G: [[0, 1], [2, 3], [0, 2], [3, 1], [1, 2], [3, 0]],
  H: [[0, 1], [2, 3], [0, 2], [3, 1], [1, 2], [3, 0]],
  I: [[0, 1], [2, 3], [0, 2], [3, 1], [3, 0], [1, 2]],
  J: [[0, 1], [2, 3], [0, 2], [3, 1], [1, 2], [3, 0]],
  K: [[0, 1], [2, 3], [0, 2], [3, 1], [3, 0], [1, 2]],
  L: [[0, 1], [2, 3], [0, 2], [3, 1], [3, 0], [1, 2]],
}

export function getGroupMatches(): GroupMatch[] {
  const matches: GroupMatch[] = []
  for (const [group, teams] of Object.entries(GROUPS)) {
    const info = MATCH_INFO[group] || []
    const pairs = PAIRS_BY_GROUP[group] || [[0,1],[2,3],[0,2],[1,3],[0,3],[1,2]]
    pairs.forEach(([i, j], idx) => {
      const mi = info[idx] || {stadium:'Por confirmar',city:'Por confirmar',time:'18:00',date:'Por confirmar'}
      matches.push({
        id: group + '_' + idx,
        home: teams[i],
        away: teams[j],
        group,
        matchday: Math.floor(idx / 2) + 1,
        stadium: mi.stadium,
        city: mi.city,
        time: mi.time,
        date: mi.date,
      })
    })
  }
  return matches
}

export const KNOCKOUT_ROUNDS = [
  { id: 'R16', label: 'Octavos de Final', matches: Array.from({ length: 16 }, (_, i) => ({ id: 'R16_' + i, label: 'Partido ' + (i+1), home: { name: 'Por definir', flag: '🏳️' }, away: { name: 'Por definir', flag: '🏳️' } })) },
  { id: 'QF', label: 'Cuartos de Final', matches: Array.from({ length: 8 }, (_, i) => ({ id: 'QF_' + i, label: 'Partido ' + (i+1), home: { name: 'Por definir', flag: '🏳️' }, away: { name: 'Por definir', flag: '🏳️' } })) },
  { id: 'SF', label: 'Semifinales', matches: Array.from({ length: 4 }, (_, i) => ({ id: 'SF_' + i, label: 'Partido ' + (i+1), home: { name: 'Por definir', flag: '🏳️' }, away: { name: 'Por definir', flag: '🏳️' } })) },
  { id: 'THIRD', label: 'Tercer Puesto', matches: [{ id: 'THIRD_0', label: 'Tercer y Cuarto Lugar', home: { name: 'Por definir', flag: '🏳️' }, away: { name: 'Por definir', flag: '🏳️' } }] },
  { id: 'FINAL', label: 'Gran Final', matches: [{ id: 'FINAL_0', label: 'Final Mundial 2026', home: { name: 'Por definir', flag: '🏳️' }, away: { name: 'Por definir', flag: '🏳️' } }] },
]

export const KNOCKOUT_POINTS: Record<string, { exact: number; winner: number }> = {
  R16:   { exact: 3, winner: 1 },
  QF:    { exact: 4, winner: 2 },
  SF:    { exact: 5, winner: 2 },
  THIRD: { exact: 4, winner: 2 },
  FINAL: { exact: 6, winner: 3 },
}

export const CHAMPION_POINTS = 10
export const DEADLINES: Record<string, Date> = {
  grupos:  new Date('2026-06-11T14:00:00-04:00'),
  R32:     new Date('2026-06-28T14:00:00-04:00'),
  R16:     new Date('2026-07-04T12:00:00-04:00'),
  QF:      new Date('2026-07-09T15:00:00-04:00'),
  SF:      new Date('2026-07-14T14:00:00-04:00'),
  TP:      new Date('2026-07-18T16:00:00-04:00'),
  FINAL:   new Date('2026-07-19T14:00:00-04:00'),
  campeon: new Date('2026-06-11T14:00:00-04:00'),
}

export const DEADLINE = DEADLINES.grupos

export function isPastDeadline(): boolean {
  return new Date() > DEADLINES.grupos
}

export function isRoundLocked(round: string): boolean {
  const d = DEADLINES[round]
  if (!d) return false
  return new Date() > d
}

export function getOutcome(h: number, a: number): 'H' | 'A' | 'D' {
  if (h > a) return 'H'
  if (a > h) return 'A'
  return 'D'
}

export const ALL_TEAMS = Object.values(GROUPS).flat()
