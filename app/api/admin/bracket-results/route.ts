import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAdminSessionFromRequest } from '@/lib/session';

export async function POST(request: NextRequest) {
  const isAdmin = await getAdminSessionFromRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const { standings, results } = body as {
    standings: Record<string, { first: string; second: string }>;
    results: Record<string, string>;
  };

  const supabase = createServiceClient();

  // Update bracket_standings
  if (standings) {
    const standingsUpdates = Object.entries(standings).map(([groupId, { first, second }]) =>
      supabase
        .from('bracket_standings')
        .update({ first_place: first || null, second_place: second || null, updated_at: new Date().toISOString() })
        .eq('group_id', groupId)
    );
    await Promise.all(standingsUpdates);
  }

  // Upsert bracket_results
  if (results) {
    const resultRows = Object.entries(results).map(([matchId, winner]) => ({
      match_id: matchId,
      winner: winner || null,
      result_status: winner ? 'final' : 'pending',
      updated_at: new Date().toISOString(),
    }));

    if (resultRows.length > 0) {
      const { error } = await supabase
        .from('bracket_results')
        .upsert(resultRows, { onConflict: 'match_id' });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
