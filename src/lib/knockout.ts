export interface KnockoutMatch {
  id: string
  matchNum: number
  label: string
  homeDesc: string
  awayDesc: string
  stadium: string
  city: string
  date: string
  time: string
  round: string
}

export const ROUND_OF_32: KnockoutMatch[] = [
  { id: 'R32_M73', matchNum: 73, label: 'M73', homeDesc: '2°A', awayDesc: '2°B', stadium: 'SoFi Stadium', city: 'Los Angeles', date: '28 Jun', time: '15:00', round: 'R32' },
  { id: 'R32_M74', matchNum: 74, label: 'M74', homeDesc: '1°E', awayDesc: '3er mejor', stadium: 'Gillette Stadium', city: 'Boston', date: '29 Jun', time: '13:00', round: 'R32' },
  { id: 'R32_M75', matchNum: 75, label: 'M75', homeDesc: '1°F', awayDesc: '2°C', stadium: 'Estadio BBVA', city: 'Monterrey', date: '29 Jun', time: '16:30', round: 'R32' },
  { id: 'R32_M76', matchNum: 76, label: 'M76', homeDesc: '1°C', awayDesc: '2°F', stadium: 'NRG Stadium', city: 'Houston', date: '29 Jun', time: '21:00', round: 'R32' },
  { id: 'R32_M77', matchNum: 77, label: 'M77', homeDesc: '1°I', awayDesc: '3er mejor', stadium: 'MetLife Stadium', city: 'Nueva Jersey', date: '30 Jun', time: '13:00', round: 'R32' },
  { id: 'R32_M78', matchNum: 78, label: 'M78', homeDesc: '2°E', awayDesc: '2°I', stadium: 'AT&T Stadium', city: 'Dallas', date: '30 Jun', time: '17:00', round: 'R32' },
  { id: 'R32_M79', matchNum: 79, label: 'M79', homeDesc: '1°A', awayDesc: '3er mejor', stadium: 'Estadio Azteca', city: 'Ciudad de Mexico', date: '30 Jun', time: '21:00', round: 'R32' },
  { id: 'R32_M80', matchNum: 80, label: 'M80', homeDesc: '1°L', awayDesc: '3er mejor', stadium: 'Mercedes-Benz Stadium', city: 'Atlanta', date: '1 Jul', time: '12:00', round: 'R32' },
  { id: 'R32_M81', matchNum: 81, label: 'M81', homeDesc: '1°D', awayDesc: '3er mejor', stadium: 'Levis Stadium', city: 'Santa Clara', date: '1 Jul', time: '16:00', round: 'R32' },
  { id: 'R32_M82', matchNum: 82, label: 'M82', homeDesc: '1°G', awayDesc: '3er mejor', stadium: 'Lumen Field', city: 'Seattle', date: '1 Jul', time: '20:00', round: 'R32' },
  { id: 'R32_M83', matchNum: 83, label: 'M83', homeDesc: '2°K', awayDesc: '2°L', stadium: 'BMO Field', city: 'Toronto', date: '2 Jul', time: '15:00', round: 'R32' },
  { id: 'R32_M84', matchNum: 84, label: 'M84', homeDesc: '1°H', awayDesc: '2°J', stadium: 'SoFi Stadium', city: 'Los Angeles', date: '2 Jul', time: '19:00', round: 'R32' },
  { id: 'R32_M85', matchNum: 85, label: 'M85', homeDesc: '1°B', awayDesc: '3er mejor', stadium: 'BC Place', city: 'Vancouver', date: '2 Jul', time: '23:00', round: 'R32' },
  { id: 'R32_M86', matchNum: 86, label: 'M86', homeDesc: '1°J', awayDesc: '2°H', stadium: 'Hard Rock Stadium', city: 'Miami', date: '3 Jul', time: '14:00', round: 'R32' },
  { id: 'R32_M87', matchNum: 87, label: 'M87', homeDesc: '1°K', awayDesc: '3er mejor', stadium: 'Arrowhead Stadium', city: 'Kansas City', date: '3 Jul', time: '18:00', round: 'R32' },
  { id: 'R32_M88', matchNum: 88, label: 'M88', homeDesc: '2°D', awayDesc: '2°G', stadium: 'AT&T Stadium', city: 'Dallas', date: '3 Jul', time: '21:30', round: 'R32' },
]

export const ROUND_OF_16: KnockoutMatch[] = [
  { id: 'R16_M89', matchNum: 89, label: 'M89', homeDesc: 'W73', awayDesc: 'W77', stadium: 'Lincoln Financial Field', city: 'Filadelfia', date: '4 Jul', time: '13:00', round: 'R16' },
  { id: 'R16_M90', matchNum: 90, label: 'M90', homeDesc: 'W74', awayDesc: 'W75', stadium: 'NRG Stadium', city: 'Houston', date: '4 Jul', time: '17:00', round: 'R16' },
  { id: 'R16_M91', matchNum: 91, label: 'M91', homeDesc: 'W76', awayDesc: 'W78', stadium: 'MetLife Stadium', city: 'Nueva Jersey', date: '5 Jul', time: '16:00', round: 'R16' },
  { id: 'R16_M92', matchNum: 92, label: 'M92', homeDesc: 'W79', awayDesc: 'W80', stadium: 'Estadio Azteca', city: 'Ciudad de Mexico', date: '5 Jul', time: '20:00', round: 'R16' },
  { id: 'R16_M93', matchNum: 93, label: 'M93', homeDesc: 'W83', awayDesc: 'W84', stadium: 'AT&T Stadium', city: 'Dallas', date: '6 Jul', time: '15:00', round: 'R16' },
  { id: 'R16_M94', matchNum: 94, label: 'M94', homeDesc: 'W81', awayDesc: 'W82', stadium: 'Lumen Field', city: 'Seattle', date: '6 Jul', time: '20:00', round: 'R16' },
  { id: 'R16_M95', matchNum: 95, label: 'M95', homeDesc: 'W86', awayDesc: 'W88', stadium: 'Mercedes-Benz Stadium', city: 'Atlanta', date: '7 Jul', time: '12:00', round: 'R16' },
  { id: 'R16_M96', matchNum: 96, label: 'M96', homeDesc: 'W85', awayDesc: 'W87', stadium: 'BC Place', city: 'Vancouver', date: '7 Jul', time: '16:00', round: 'R16' },
]

export const QUARTERFINALS: KnockoutMatch[] = [
  { id: 'QF_M97', matchNum: 97, label: 'M97', homeDesc: 'W89', awayDesc: 'W90', stadium: 'Gillette Stadium', city: 'Boston', date: '9 Jul', time: '16:00', round: 'QF' },
  { id: 'QF_M98', matchNum: 98, label: 'M98', homeDesc: 'W93', awayDesc: 'W94', stadium: 'SoFi Stadium', city: 'Los Angeles', date: '10 Jul', time: '15:00', round: 'QF' },
  { id: 'QF_M99', matchNum: 99, label: 'M99', homeDesc: 'W91', awayDesc: 'W92', stadium: 'Hard Rock Stadium', city: 'Miami', date: '11 Jul', time: '17:00', round: 'QF' },
  { id: 'QF_M100', matchNum: 100, label: 'M100', homeDesc: 'W95', awayDesc: 'W96', stadium: 'Arrowhead Stadium', city: 'Kansas City', date: '11 Jul', time: '21:00', round: 'QF' },
]

export const SEMIFINALS: KnockoutMatch[] = [
  { id: 'SF_M101', matchNum: 101, label: 'M101', homeDesc: 'W97', awayDesc: 'W98', stadium: 'AT&T Stadium', city: 'Dallas', date: '14 Jul', time: '15:00', round: 'SF' },
  { id: 'SF_M102', matchNum: 102, label: 'M102', homeDesc: 'W99', awayDesc: 'W100', stadium: 'Mercedes-Benz Stadium', city: 'Atlanta', date: '15 Jul', time: '15:00', round: 'SF' },
]

export const THIRD_PLACE: KnockoutMatch[] = [
  { id: 'TP_M103', matchNum: 103, label: 'M103', homeDesc: 'Perdedor SF1', awayDesc: 'Perdedor SF2', stadium: 'Hard Rock Stadium', city: 'Miami', date: '18 Jul', time: '17:00', round: 'TP' },
]

export const FINAL: KnockoutMatch[] = [
  { id: 'FINAL_M104', matchNum: 104, label: 'M104', homeDesc: 'Ganador SF1', awayDesc: 'Ganador SF2', stadium: 'MetLife Stadium', city: 'Nueva Jersey', date: '19 Jul', time: '15:00', round: 'FINAL' },
]

export const ALL_KNOCKOUT_ROUNDS = [
  { id: 'R32', label: 'Ronda de 32', matches: ROUND_OF_32 },
  { id: 'R16', label: 'Octavos de Final', matches: ROUND_OF_16 },
  { id: 'QF', label: 'Cuartos de Final', matches: QUARTERFINALS },
  { id: 'SF', label: 'Semifinales', matches: SEMIFINALS },
  { id: 'TP', label: 'Tercer Puesto', matches: THIRD_PLACE },
  { id: 'FINAL', label: 'Gran Final', matches: FINAL },
]

export const KNOCKOUT_PTS: Record<string, { exact: number; winner: number }> = {
  R32:   { exact: 2, winner: 1 },
  R16:   { exact: 3, winner: 1 },
  QF:    { exact: 4, winner: 2 },
  SF:    { exact: 5, winner: 2 },
  TP:    { exact: 4, winner: 2 },
  FINAL: { exact: 6, winner: 3 },
}

// Auto-suggest teams based on group standings
// groupStandings: { A: [{name, pts, gd, gf}, ...], ... }
export function suggestTeamForSlot(slot: string, groupStandings: Record<string, {name: string; flag: string}[]>): {name: string; flag: string} | null {
  const clean = slot.trim()
  // 1°X or 2°X
  const match = clean.match(/^([12])\°([A-L])$/)
  if (match) {
    const pos = parseInt(match[1]) - 1
    const group = match[2]
    const standings = groupStandings[group]
    if (standings && standings[pos]) return standings[pos]
  }
  return null
}
