export const theme = {
  bg: '#fff8e6',
  bgDeep: '#f3e9c8',
  surface: '#ffffff',
  ink: '#0a2418',
  inkSoft: '#3a4a40',
  inkMuted: 'rgba(10,36,24,0.55)',
  primary: '#007a3d',
  primaryDeep: '#054a22',
  primaryInk: '#fff8e6',
  accent: '#ffd400',
  accentInk: '#0a2418',
  blue: '#0e2a5e',
  line: 'rgba(10,36,24,0.1)',
  danger: '#c1272d',
};

export function hexA(hex: string, a: number): string {
  if (!hex) return `rgba(0,0,0,${a})`;
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export const TEAM_NAMES: Record<string, string> = {
  BRA: 'Brasil',
  MAR: 'Marrocos',
  HAI: 'Haiti',
  SCO: 'Escócia',
  ARG: 'Argentina',
  ESP: 'Espanha',
  FRA: 'França',
  POR: 'Portugal',
};

export const MATCHES = [
  { id: 'brazil_morocco', home: 'BRA', away: 'MAR', when: 'Qua 24 jun · 16h', stage: 'Grupo A', label: 'Brasil vs Marrocos' },
  { id: 'brazil_haiti',   home: 'BRA', away: 'HAI', when: 'Dom 28 jun · 13h', stage: 'Grupo A', label: 'Brasil vs Haiti' },
  { id: 'brazil_scotland', home: 'BRA', away: 'SCO', when: 'Qua 01 jul · 16h', stage: 'Grupo A', label: 'Brasil vs Escócia' },
];

export const GROUP_TEAMS = ['BRA', 'MAR', 'HAI', 'SCO'];
export const CHAMPION_OPTIONS = ['BRA', 'ARG', 'FRA', 'ESP', 'POR', 'MAR'];
