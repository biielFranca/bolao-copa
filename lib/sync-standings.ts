/**
 * sync-standings.ts
 * Busca a classificação final dos grupos na api-football e grava em bracket_standings.
 *
 * A api-football retorna os grupos do Mundial como arrays de 4 times já ordenados
 * por posição (rank 1→4). Cada item tem:
 *   { rank, group: "Group A", team: { id, name }, ... }
 *
 * Mapeamos o nome do time para o nosso código interno (BRA, MAR, …)
 * e gravamos first_place / second_place / third_place / fourth_place.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

// ─── Mapa nome (api-football) → código interno ─────────────────────────────

const TEAM_NAME_MAP: Record<string, string> = {
  // Grupo A (nosso)
  Brazil:           'BRA',
  Morocco:          'MAR',
  Haiti:            'HAI',
  Scotland:         'SCO',
  // Grupo B
  Argentina:        'ARG',
  Mexico:           'MEX',
  Nigeria:          'NGA',
  Japan:            'JPN',
  // Grupo C
  France:           'FRA',
  'United States':  'USA',
  USA:              'USA',
  Ghana:            'GHA',
  Australia:        'AUS',
  // Grupo D
  Spain:            'ESP',
  Portugal:         'POR',
  'Korea Republic': 'KOR',
  'South Korea':    'KOR',
  Egypt:            'EGY',
  // Grupo E
  Germany:          'GER',
  England:          'ENG',
  Iran:             'IRN',
  Ecuador:          'ECU',
  // Grupo F
  Italy:            'ITA',
  Netherlands:      'NED',
  Holland:          'NED',
  Uruguay:          'URU',
  Senegal:          'SEN',
  // Grupo G
  Belgium:          'BEL',
  Croatia:          'CRO',
  Colombia:         'COL',
  'Costa Rica':     'CRC',
  // Grupo H
  Switzerland:      'SUI',
  Denmark:          'DEN',
  Poland:           'POL',
  Serbia:           'SRB',
};

function toCode(name: string): string | null {
  return TEAM_NAME_MAP[name] ?? null;
}

// ─── Tipos mínimos da resposta da API ──────────────────────────────────────

type StandingEntry = {
  rank: number;
  group: string; // ex: "Group A"
  team: { id: number; name: string };
};

// ─── Função principal ───────────────────────────────────────────────────────

/**
 * Busca /standings na api-football e actualiza bracket_standings.
 * Só actualiza grupos cujos 4 times já jogaram (all_played).
 * Retorna array de group_ids actualizados.
 */
export async function syncGroupStandings(
  supabase: SupabaseClient,
  apiKey: string
): Promise<string[]> {
  const API_BASE = 'https://v3.football.api-sports.io';
  const LEAGUE_ID = 1;   // FIFA World Cup
  const SEASON    = 2026;

  const res = await fetch(
    `${API_BASE}/standings?league=${LEAGUE_ID}&season=${SEASON}`,
    { headers: { 'x-apisports-key': apiKey }, cache: 'no-store' }
  );

  if (!res.ok) {
    console.error('[sync-standings] api-football standings retornou', res.status);
    return [];
  }

  const json = await res.json();

  // response[0].league.standings é um array de grupos
  // cada grupo é um array de StandingEntry ordenado por rank
  const groups: StandingEntry[][] =
    json?.response?.[0]?.league?.standings ?? [];

  if (!groups.length) {
    console.log('[sync-standings] sem dados de standings');
    return [];
  }

  const updated: string[] = [];

  for (const group of groups) {
    if (!group.length) continue;

    // Extrai a letra do grupo: "Group A" → "A"
    const groupLabel: string = group[0]?.group ?? '';
    const groupLetter = groupLabel.replace(/^Group\s*/i, '').trim().toUpperCase();

    // Só processamos os 8 grupos do nosso sistema (A–H)
    if (!/^[A-H]$/.test(groupLetter)) continue;

    // Ordena por rank por segurança
    const sorted = [...group].sort((a, b) => a.rank - b.rank).slice(0, 4);

    // Verifica se o grupo está completo (todos jogaram pelo menos 3 partidas)
    // A API retorna `all.played` em cada entry; usamos o do 1º time como proxy
    const playedField = (sorted[0] as unknown as { all?: { played?: number } })?.all?.played ?? 0;
    if (playedField < 3) continue; // grupo ainda não terminou

    const codes = sorted.map((e) => toCode(e.team.name));
    // Se não reconhecemos pelo menos 2 times, pula
    if (codes.filter(Boolean).length < 2) continue;

    const { error } = await supabase
      .from('bracket_standings')
      .update({
        first_place:  codes[0] ?? null,
        second_place: codes[1] ?? null,
        third_place:  codes[2] ?? null,
        fourth_place: codes[3] ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('group_id', groupLetter);

    if (error) {
      console.error(`[sync-standings] erro no grupo ${groupLetter}:`, error.message);
    } else {
      updated.push(`Grupo ${groupLetter}: ${codes.join(' > ')}`);
    }
  }

  return updated;
}
