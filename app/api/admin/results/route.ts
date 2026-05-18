import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAdminSessionFromRequest } from '@/lib/session';

export async function POST(request: NextRequest) {
  const isAdmin = await getAdminSessionFromRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const body = await request.json();
  const supabase = createServiceClient();

  // Atualizar resultados das partidas
  const matchUpdates = [
    { key: 'brazil_morocco', brazilGoals: body.brazil_morocco_brazil_goals, opponentGoals: body.brazil_morocco_opponent_goals, status: body.brazil_morocco_status },
    { key: 'brazil_haiti', brazilGoals: body.brazil_haiti_brazil_goals, opponentGoals: body.brazil_haiti_opponent_goals, status: body.brazil_haiti_status },
    { key: 'brazil_scotland', brazilGoals: body.brazil_scotland_brazil_goals, opponentGoals: body.brazil_scotland_opponent_goals, status: body.brazil_scotland_status },
  ];

  for (const match of matchUpdates) {
    if (match.brazilGoals !== undefined) {
      const { error } = await supabase
        .from('results')
        .update({
          brazil_goals: match.brazilGoals !== '' ? Number(match.brazilGoals) : null,
          opponent_goals: match.opponentGoals !== '' ? Number(match.opponentGoals) : null,
          result_status: match.status ?? 'pending',
        })
        .eq('match_key', match.key);

      if (error) {
        return NextResponse.json({ error: `Erro ao atualizar ${match.key}` }, { status: 500 });
      }
    }
  }

  // Atualizar tournament_results
  if (body.tournament !== undefined) {
    const t = body.tournament;
    const { data: existing } = await supabase
      .from('tournament_results')
      .select('id')
      .limit(1)
      .single();

    if (existing) {
      await supabase
        .from('tournament_results')
        .update({
          final_group_order: t.final_group_order ?? null,
          brazil_group_position: t.brazil_group_position ?? null,
          champion: t.champion ?? null,
          total_brazil_goals: t.total_brazil_goals !== undefined ? Number(t.total_brazil_goals) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    }
  }

  return NextResponse.json({ success: true });
}
