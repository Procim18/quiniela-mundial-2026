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

const MATCH_INFO: Record<string, Array<{stadium: string; city: string; time: string}>> = {
  A: [
    {stadium:'Estadio Azteca',city:'Ciudad de Mexico',time:'15:00'},
    {stadium:'Estadio Akron',city:'Guadalajara',time:'21:00'},
    {stadium:'SoFi Stadium',city:'Los Angeles',time:'18:00'},
    {stadium:'Rose Bowl',city:'Pasadena',time:'18:00'},
    {stadium:'Estadio Azteca',city:'Ciudad de Mexico',time:'19:00'},
    {stadium:'Estadio BBVA',city:'Monterrey',time:'19:00'},
  ],
  B: [
    {stadium:'BMO Field',city:'Toronto',time:'15:00'},
    {stadium:'Lumen Field',city:'Seattle',time:'14:00'},
    {stadium:'BC Place',city:'Vancouver',time:'18:00'},
    {stadium:'Levis Stadium',city:'San Francisco',time:'14:00'},
    {stadium:'BC Place',city:'Vancouver',time:'18:00'},
    {stadium:'Lumen Field',city:'Seattle',time:'14:00'},
  ],
  C: [
    {stadium:'MetLife Stadium',city:'Nueva York',time:'18:00'},
    {stadium:'Gillette Stadium',city:'Boston',time:'21:00'},
    {stadium:'Lincoln Financial Field',city:'Filadelfia',time:'21:00'},
    {stadium:'Gillette Stadium',city:'Boston',time:'18:00'},
    {stadium:'Gillette Stadium',city:'Boston',time:'18:00'},
    {stadium:'Lincoln Financial Field',city:'Filadelfia',time:'18:00'},
  ],
  D: [
    {stadium:'MetLife Stadium',city:'Nueva York',time:'21:00'},
    {stadium:'Levis Stadium',city:'San Francisco',time:'18:00'},
    {stadium:'AT&T Stadium',city:'Dallas',time:'21:00'},
    {stadium:'Rose Bowl',city:'Pasadena',time:'21:00'},
    {stadium:'Levis Stadium',city:'San Francisco',time:'18:00'},
    {stadium:'AT&T Stadium',city:'Dallas',time:'18:00'},
  ],
  E: [
    {stadium:'Allianz Field',city:'Minneapolis',time:'18:00'},
    {stadium:'Empower Field',city:'Denver',time:'21:00'},
    {stadium:'NRG Stadium',city:'Houston',time:'21:00'},
    {stadium:'Allianz Field',city:'Minneapolis',time:'18:00'},
    {stadium:'NRG Stadium',city:'Houston',time:'18:00'},
    {stadium:'Empower Field',city:'Denver',time:'18:00'},
  ],
  F: [
    {stadium:'Rose Bowl',city:'Pasadena',time:'18:00'},
    {stadium:'SoFi Stadium',city:'Los Angeles',time:'21:00'},
    {stadium:'Rose Bowl',city:'Pasadena',time:'21:00'},
    {stadium:'SoFi Stadium',city:'Los Angeles',time:'18:00'},
    {stadium:'SoFi Stadium',city:'Los Angeles',time:'18:00'},
    {stadium:'Rose Bowl',city:'Pasadena',time:'18:00'},
  ],
  G: [
    {stadium:'Hard Rock Stadium',city:'Miami',time:'18:00'},
    {stadium:'Mercedes-Benz Stadium',city:'Atlanta',time:'21:00'},
    {stadium:'Arrowhead Stadium',city:'Kansas City',time:'21:00'},
    {stadium:'Hard Rock Stadium',city:'Miami',time:'18:00'},
    {stadium:'Mercedes-Benz Stadium',city:'Atlanta',time:'18:00'},
    {stadium:'Arrowhead Stadium',city:'Kansas City',time:'18:00'},
  ],
  H: [
    {stadium:'Estadio Azteca',city:'Ciudad de Mexico',time:'21:00'},
    {stadium:'Estadio BBVA',city:'Monterrey',time:'18:00'},
    {stadium:'Estadio Akron',city:'Guadalajara',time:'21:00'},
    {stadium:'Estadio Azteca',city:'Ciudad de Mexico',time:'18:00'},
    {stadium:'Estadio BBVA',city:'Monterrey',time:'18:00'},
    {stadium:'Estadio Akron',city:'Guadalajara',time:'18:00'},
  ],
  I: [
    {stadium:'Lincoln Financial Field',city:'Filadelfia',time:'18:00'},
    {stadium:'Audi Field',city:'Washington D.C.',time:'21:00'},
    {stadium:'AT&T Stadium',city:'Dallas',time:'18:00'},
    {stadium:'Lincoln Financial Field',city:'Filadelfia',time:'21:00'},
    {stadium:'Audi Field',city:'Washington D.C.',time:'18:00'},
    {stadium:'AT&T Stadium',city:'Dallas',time:'18:00'},
  ],
  J: [
    {stadium:'Estadio Akron',city:'Guadalajara',time:'18:00'},
    {stadium:'Estadio BBVA',city:'Monterrey',time:'21:00'},
    {stadium:'Estadio Azteca',city:'Ciudad de Mexico',time:'18:00'},
    {stadium:'Estadio Akron',city:'Guadalajara',time:'18:00'},
    {stadium:'Estadio BBVA',city:'Monterrey',time:'18:00'},
    {stadium:'Estadio Azteca',city:'Ciudad de Mexico',time:'18:00'},
  ],
  K: [
    {stadium:'Arrowhead Stadium',city:'Kansas City',time:'18:00'},
    {stadium:'NRG Stadium',city:'Houston',time:'21:00'},
    {stadium:'Mercedes-Benz Stadium',city:'Atlanta',time:'18:00'},
    {stadium:'Arrowhead Stadium',city:'Kansas City',time:'21:00'},
    {stadium:'NRG Stadium',city:'Houston',time:'18:00'},
    {stadium:'Mercedes-Benz Stadium',city:'Atlanta',time:'18:00'},
  ],
  L: [
    {stadium:'Commonwealth Stadium',city:'Edmonton',time:'18:00'},
    {stadium:'BMO Field',city:'Toronto',time:'21:00'},
    {stadium:'BC Place',city:'Vancouver',time:'18:00'},
    {stadium:'Commonwealth Stadium',city:'Edmonton',time:'21:00'},
    {stadium:'BMO Field',city:'Toronto',time:'18:00'},
    {stadium:'BC Place',city:'Vancouver',time:'18:00'},
  ],
}

export function getGroupMatches(): GroupMatch[] {
  const matches: GroupMatch[] = []
  for (const [group, teams] of Object.entries(GROUPS)) {
    const info = MATCH_INFO[group] || []
    const pairs = [[0,1],[2,3],[0,2],[1,3],[0,3],[1,2]]
    pairs.forEach(([i, j], idx) => {
      const mi = info[idx] || {stadium:'Por confirmar',city:'Por confirmar',time:'18:00'}
      matches.push({
        id: group + '_' + idx,
        home: teams[i],
        away: teams[j],
        group,
        matchday: Math.floor(idx / 2) + 1,
        stadium: mi.stadium,
        city: mi.city,
        time: mi.time,
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
export const DEADLINE = new Date('2026-06-11T00:00:00')

export function isPastDeadline(): boolean {
  return new Date() > DEADLINE
}

export function getOutcome(h: number, a: number): 'H' | 'A' | 'D' {
  if (h > a) return 'H'
  if (a > h) return 'A'
  return 'D'
}

export const ALL_TEAMS = Object.values(GROUPS).flat()
