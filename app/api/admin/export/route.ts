import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAdminSessionFromRequest } from '@/lib/session';
import { calculateScores } from '@/lib/scoring';

export async function GET(request: NextRequest) {
  const isAdmin = await getAdminSessionFromRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const supabase = createServiceClient();

  const [{ data: predictions }, { data: results }, { data: tournament }] = await Promise.all([
    supabase
      .from('predictions')
      .select('*, participants(name)')
      .order('submitted_at', { ascending: true }),
    supabase.from('results').select('*'),
    supabase.from('tournament_results').select('*').limit(1).single(),
  ]);

  if (!predictions || !results) {
    return new NextResponse('Erro ao buscar dados', { status: 500 });
  }

  type SupabasePrediction = {
    participant_id: string;
    brazil_morocco_brazil_goals: number | null;
    brazil_morocco_opponent_goals: number | null;
    brazil_haiti_brazil_goals: number | null;
    brazil_haiti_opponent_goals: number | null;
    brazil_scotland_brazil_goals: number | null;
    brazil_scotland_opponent_goals: number | null;
    group_order: string[] | null;
    brazil_group_position: number | null;
    champion: string | null;
    total_brazil_goals: number | null;
    submitted_at: string;
    participants: { name: string } | null;
  };

  const predictionsWithNames = (predictions as SupabasePrediction[]).map((p) => ({
    ...p,
    participant_name: p.participants?.name ?? 'Desconhecido',
  }));

  const ranked = calculateScores(predictionsWithNames, results, tournament);

  const csvHeader = 'Posição,Nome,Pontuação,Acertou Campeão,Placares Exatos,Acertou Posição Brasil,Gols Brasil (palpite),Enviado em\n';
  const csvRows = ranked.map((r) =>
    [
      r.position,
      `"${r.name}"`,
      r.totalScore,
      r.correctChampion ? 'Sim' : 'Não',
      r.exactScoreCount,
      r.correctBrazilPosition ? 'Sim' : 'Não',
      r.brazilGoalsDiff !== null ? r.brazilGoalsDiff : '-',
      new Date(r.submittedAt).toLocaleString('pt-BR'),
    ].join(',')
  );

  const csv = csvHeader + csvRows.join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="ranking-bolao-copa-${Date.now()}.csv"`,
    },
  });
}
