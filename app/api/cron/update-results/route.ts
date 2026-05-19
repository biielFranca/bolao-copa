import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { syncGroupStandings } from '@/lib/sync-standings';

// IDs fixos na api-football.com
const BRAZIL_TEAM_ID     = 6;
const WORLD_CUP_LEAGUE_ID = 1;   // FIFA World Cup
const SEASON             = 2026;
const API_BASE           = 'https://v3.football.api-sports.io';

// Mapeia o nome do adversário para o match_key do banco
function getMatchKey(opponentName: string): string | null {
  const n = opponentName.toLowerCase();
  if (n.includes('morocco') || n.includes('maroc'))   return 'brazil_morocco';
  if (n.includes('haiti'))                             return 'brazil_haiti';
  if (n.includes('scotland') || n.includes('ecosse')) return 'brazil_scotland';
  return null;
}

export async function GET(request: NextRequest) {
  // Aceita chamada do Vercel Cron OU do painel admin (ADMIN_SECRET)
  const isCron  = request.headers.get('x-vercel-cron') === '1';
  const isAdmin = request.headers.get('authorization') === `Bearer ${process.env.ADMIN_SECRET}`;

  if (!isCron && !isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API_FOOTBALL_KEY não configurada' }, { status: 500 });
  }

  const supabase = createServiceClient();
  const updatedResults: string[] = [];
  const skipped: string[] = [];

  // ── 1. Partidas do Brasil ──────────────────────────────────────────────────
  const fixturesRes = await fetch(
    `${API_BASE}/fixtures?team=${BRAZIL_TEAM_ID}&season=${SEASON}&league=${WORLD_CUP_LEAGUE_ID}`,
    { headers: { 'x-apisports-key': apiKey }, next: { revalidate: 0 } }
  );

  if (!fixturesRes.ok) {
    return NextResponse.json(
      { error: `api-football retornou ${fixturesRes.status}` },
      { status: 502 }
    );
  }

  const fixturesJson = await fixturesRes.json();
  const fixtures: unknown[] = fixturesJson.response ?? [];

  for (const fixture of fixtures) {
    const f          = fixture as Record<string, unknown>;
    const status     = (f.fixture as Record<string, unknown>)?.status as Record<string, unknown>;
    const statusShort = status?.short as string;

    if (!['FT', 'AET', 'PEN'].includes(statusShort)) continue;

    const teams  = f.teams  as Record<string, Record<string, unknown>>;
    const goals  = f.goals  as Record<string, number | null>;
    const homeId = teams?.home?.id as number;

    let brazilGoals: number, opponentGoals: number, opponentName: string;
    if (homeId === BRAZIL_TEAM_ID) {
      brazilGoals   = goals?.home ?? 0;
      opponentGoals = goals?.away ?? 0;
      opponentName  = (teams?.away?.name as string) ?? '';
    } else {
      brazilGoals   = goals?.away ?? 0;
      opponentGoals = goals?.home ?? 0;
      opponentName  = (teams?.home?.name as string) ?? '';
    }

    const matchKey = getMatchKey(opponentName);
    if (!matchKey) { skipped.push(opponentName); continue; }

    const { error } = await supabase
      .from('results')
      .update({ brazil_goals: brazilGoals, opponent_goals: opponentGoals, result_status: 'final' })
      .eq('match_key', matchKey);

    if (error) {
      console.error(`[cron] erro ao atualizar ${matchKey}:`, error.message);
    } else {
      updatedResults.push(`${matchKey} ${brazilGoals}-${opponentGoals}`);
    }
  }

  // ── 2. Classificação dos grupos → seeds dos 16avos ────────────────────────
  const updatedStandings = await syncGroupStandings(supabase, apiKey);

  console.log('[cron] update-results →', { updatedResults, updatedStandings, skipped });
  return NextResponse.json({ success: true, updatedResults, updatedStandings, skipped });
}
