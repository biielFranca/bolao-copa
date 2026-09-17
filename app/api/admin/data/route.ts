import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAdminSessionFromRequest } from '@/lib/session';

// Os dados do painel saem por aqui, e não direto do navegador: `participants`
// guarda nome e telefone, e ler essa tabela com a chave publicável deixaria os
// contatos de todo mundo acessíveis a qualquer visitante.
export async function GET(request: NextRequest) {
  const isAdmin = await getAdminSessionFromRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const supabase = createServiceClient();

  const [parts, preds, res, tour, sett, bStandings, bResults] = await Promise.all([
    supabase.from('participants').select('*').order('created_at', { ascending: false }),
    supabase.from('predictions').select('*').order('submitted_at', { ascending: true }),
    supabase.from('results').select('*'),
    supabase.from('tournament_results').select('*').limit(1).single(),
    supabase.from('app_settings').select('*').limit(1).single(),
    supabase.from('bracket_standings').select('*'),
    supabase.from('bracket_results').select('*'),
  ]);

  return NextResponse.json({
    participants: parts.data ?? [],
    predictions: preds.data ?? [],
    results: res.data ?? [],
    tournamentResults: tour.data ?? null,
    settings: sett.data ?? null,
    bracketStandings: bStandings.data ?? [],
    bracketResults: bResults.data ?? [],
  });
}
