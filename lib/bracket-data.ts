// bracket-data.ts — Mata-mata da Copa: 32 times → R16 → Final

// ─── Types ──────────────────────────────────────────────────────────────────

export type TeamInfo = {
  name: string;
  short: string;
  c1: string;
  c2?: string;
  c3?: string;
};

export type GroupStandings = Record<string, [string, string]>;

export type BracketPick = Record<string, string>; // matchId → teamCode

export type BracketMatch = {
  id: string;
  round: string;
  a: string | null;
  b: string | null;
  label?: string;
  feeds?: string[];
};

export type BracketResult = {
  r16: BracketMatch[];
  qf: BracketMatch[];
  sf: BracketMatch[];
  f: BracketMatch[];
  third: BracketMatch[];
  matchById: Record<string, BracketMatch>;
};

// ─── 32 teams (8 groups of 4) + colors ──────────────────────────────────────

export const TEAMS_32: Record<string, TeamInfo> = {
  // Grupo A
  BRA: { name: 'Brasil',        short: 'BRA', c1: '#009c3b', c2: '#ffdf00', c3: '#002776' },
  MAR: { name: 'Marrocos',      short: 'MAR', c1: '#c1272d', c2: '#006233' },
  HAI: { name: 'Haiti',         short: 'HAI', c1: '#00209f', c2: '#d21034' },
  SCO: { name: 'Escócia',       short: 'SCO', c1: '#0065bf', c2: '#ffffff' },
  // Grupo B
  ARG: { name: 'Argentina',     short: 'ARG', c1: '#75aadb', c2: '#ffffff', c3: '#f6b40e' },
  MEX: { name: 'México',        short: 'MEX', c1: '#006847', c2: '#ce1126', c3: '#ffffff' },
  NGA: { name: 'Nigéria',       short: 'NGA', c1: '#008753', c2: '#ffffff' },
  JPN: { name: 'Japão',         short: 'JPN', c1: '#bc002d', c2: '#ffffff' },
  // Grupo C
  FRA: { name: 'França',        short: 'FRA', c1: '#002395', c2: '#ed2939', c3: '#ffffff' },
  USA: { name: 'EUA',           short: 'USA', c1: '#bf0a30', c2: '#002868', c3: '#ffffff' },
  GHA: { name: 'Gana',          short: 'GHA', c1: '#fcd116', c2: '#006b3f', c3: '#ce1126' },
  AUS: { name: 'Austrália',     short: 'AUS', c1: '#00008b', c2: '#e4002b' },
  // Grupo D
  ESP: { name: 'Espanha',       short: 'ESP', c1: '#aa151b', c2: '#f1bf00' },
  POR: { name: 'Portugal',      short: 'POR', c1: '#046a38', c2: '#da291c', c3: '#ffe900' },
  KOR: { name: 'Coreia do Sul', short: 'KOR', c1: '#cd2e3a', c2: '#0047a0', c3: '#ffffff' },
  EGY: { name: 'Egito',         short: 'EGY', c1: '#ce1126', c2: '#000000', c3: '#ffffff' },
  // Grupo E
  GER: { name: 'Alemanha',      short: 'GER', c1: '#000000', c2: '#dd0000', c3: '#ffce00' },
  ENG: { name: 'Inglaterra',    short: 'ENG', c1: '#ffffff', c2: '#c8102e' },
  IRN: { name: 'Irã',           short: 'IRN', c1: '#239f40', c2: '#da0000', c3: '#ffffff' },
  ECU: { name: 'Equador',       short: 'ECU', c1: '#ffd100', c2: '#034ea2', c3: '#ed1c24' },
  // Grupo F
  ITA: { name: 'Itália',        short: 'ITA', c1: '#008c45', c2: '#cd212a', c3: '#ffffff' },
  NED: { name: 'Holanda',       short: 'NED', c1: '#ae1c28', c2: '#ffffff', c3: '#21468b' },
  URU: { name: 'Uruguai',       short: 'URU', c1: '#7b9ed4', c2: '#fcd116', c3: '#ffffff' },
  SEN: { name: 'Senegal',       short: 'SEN', c1: '#00853f', c2: '#fdef42', c3: '#e31b23' },
  // Grupo G
  BEL: { name: 'Bélgica',       short: 'BEL', c1: '#ef3340', c2: '#fdda24', c3: '#000000' },
  CRO: { name: 'Croácia',       short: 'CRO', c1: '#171796', c2: '#ff0000', c3: '#ffffff' },
  COL: { name: 'Colômbia',      short: 'COL', c1: '#fcd116', c2: '#003893', c3: '#ce1126' },
  CRC: { name: 'Costa Rica',    short: 'CRC', c1: '#002b7f', c2: '#ce1126', c3: '#ffffff' },
  // Grupo H
  SUI: { name: 'Suíça',         short: 'SUI', c1: '#d52b1e', c2: '#ffffff' },
  DEN: { name: 'Dinamarca',     short: 'DEN', c1: '#c60c30', c2: '#ffffff' },
  POL: { name: 'Polônia',       short: 'POL', c1: '#ffffff', c2: '#dc143c' },
  SRB: { name: 'Sérvia',        short: 'SRB', c1: '#c6363c', c2: '#0c4076', c3: '#ffffff' },
};

export const GROUPS: Array<{ id: string; teams: string[] }> = [
  { id: 'A', teams: ['BRA', 'MAR', 'HAI', 'SCO'] },
  { id: 'B', teams: ['ARG', 'MEX', 'NGA', 'JPN'] },
  { id: 'C', teams: ['FRA', 'USA', 'GHA', 'AUS'] },
  { id: 'D', teams: ['ESP', 'POR', 'KOR', 'EGY'] },
  { id: 'E', teams: ['GER', 'ENG', 'IRN', 'ECU'] },
  { id: 'F', teams: ['ITA', 'NED', 'URU', 'SEN'] },
  { id: 'G', teams: ['BEL', 'CRO', 'COL', 'CRC'] },
  { id: 'H', teams: ['SUI', 'DEN', 'POL', 'SRB'] },
];

// Standard cross-group R16 layout (A1 vs B2, C1 vs D2…)
export const R16_PAIRS: [string, string][] = [
  ['A1', 'B2'], ['C1', 'D2'], ['E1', 'F2'], ['G1', 'H2'],
  ['B1', 'A2'], ['D1', 'C2'], ['F1', 'E2'], ['H1', 'G2'],
];

// Default group standings used to seed R16 — admin can override
export const DEFAULT_STANDINGS: Record<string, [string, string]> = {
  A: ['BRA', 'MAR'], B: ['ARG', 'JPN'], C: ['FRA', 'USA'], D: ['ESP', 'POR'],
  E: ['ENG', 'GER'], F: ['NED', 'ITA'], G: ['BEL', 'CRO'], H: ['DEN', 'SUI'],
};

export const ROUND_LABEL: Record<string, string> = {
  r16: 'Oitavas',
  qf: 'Quartas',
  sf: 'Semi',
  f: 'Final',
  third: '3º lugar',
};

export const ROUND_LABEL_FULL: Record<string, string> = {
  r16: 'Oitavas de final',
  qf: 'Quartas de final',
  sf: 'Semifinais',
  f: 'Final',
  third: 'Disputa do 3º lugar',
};

export const BRACKET_POINTS: Record<string, number> = {
  r16: 2,
  qf: 4,
  sf: 6,
  third: 3,
  f: 0,
};

// ─── Pure functions ──────────────────────────────────────────────────────────

export function seedR16(standings: Record<string, string[]>): BracketMatch[] {
  return R16_PAIRS.map((pair, i) => {
    const [pa, pb] = pair;
    const ga = pa[0];
    const posA = Number(pa[1]) - 1;
    const gb = pb[0];
    const posB = Number(pb[1]) - 1;
    return {
      id: `r16-${i + 1}`,
      round: 'r16',
      a: standings[ga]?.[posA] ?? null,
      b: standings[gb]?.[posB] ?? null,
      label: `${pa} × ${pb}`,
    };
  });
}

const QF_FEEDS: [string, string][] = [
  ['r16-1', 'r16-2'], ['r16-3', 'r16-4'],
  ['r16-5', 'r16-6'], ['r16-7', 'r16-8'],
];
const SF_FEEDS: [string, string][] = [['qf-1', 'qf-2'], ['qf-3', 'qf-4']];
const F_FEEDS: [string, string][] = [['sf-1', 'sf-2']];

export function computeBracket(
  standings: Record<string, string[]>,
  picks: BracketPick
): BracketResult {
  const r16 = seedR16(standings);
  const matchById: Record<string, BracketMatch> = {};
  r16.forEach((m) => { matchById[m.id] = m; });

  const buildRound = (feeds: [string, string][], round: string): BracketMatch[] =>
    feeds.map((feed, i) => {
      const [fa, fb] = feed;
      const id = `${round}-${i + 1}`;
      const m: BracketMatch = {
        id,
        round,
        a: picks[fa] ?? null,
        b: picks[fb] ?? null,
        feeds: feed,
      };
      matchById[id] = m;
      return m;
    });

  const qf = buildRound(QF_FEEDS, 'qf');
  const sf = buildRound(SF_FEEDS, 'sf');
  const f = buildRound(F_FEEDS, 'f');

  // 3rd place — losers of SF
  const sfLosers = sf.map((m) => {
    if (!m.a || !m.b || !picks[m.id]) return null;
    return picks[m.id] === m.a ? m.b : m.a;
  });
  const third: BracketMatch[] = [{
    id: 'third-1',
    round: 'third',
    a: sfLosers[0],
    b: sfLosers[1],
    feeds: ['sf-1', 'sf-2'],
  }];
  matchById['third-1'] = third[0];

  return { r16, qf, sf, f, third, matchById };
}

// When a pick changes, clear downstream picks that no longer advance.
export function cascadeClear(
  picks: BracketPick,
  _changedMatchId: string,
  allMatches: BracketMatch[]
): BracketPick {
  const np = { ...picks };
  let dirty = true;
  while (dirty) {
    dirty = false;
    for (const m of allMatches) {
      if (!m.feeds) continue;
      const sources = m.feeds.map((f) => np[f] ?? null);
      const eligible = new Set(sources.filter(Boolean));
      const cur = np[m.id];
      if (cur && !eligible.has(cur)) {
        delete np[m.id];
        dirty = true;
      }
    }
  }
  return np;
}
