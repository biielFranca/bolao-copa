import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getSessionFromRequest } from '@/lib/session';

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.picks !== 'object') {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Verificar se já submeteu
  const { data: existing } = await supabase
    .from('bracket_predictions')
    .select('id')
    .eq('participant_id', session.participantId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'Palpite já enviado' }, { status: 409 });
  }

  const { error } = await supabase.from('bracket_predictions').insert({
    participant_id: session.participantId,
    picks: body.picks,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
