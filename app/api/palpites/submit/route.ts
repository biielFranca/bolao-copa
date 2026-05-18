import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getSessionFromRequest } from '@/lib/session';

const GROUP_TEAMS = ['Brasil', 'Marrocos', 'Haiti', 'Escócia'];

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Verificar se palpites estão bloqueados
  const { data: settings } = await supabase
    .from('app_settings')
    .select('predictions_locked')
    .single();

  if (settings?.predictions_locked) {
    return NextResponse.json(
      { error: 'Palpites encerrados. Não é mais possível enviar.' },
      { status: 403 }
    );
  }

  // Verificar se já existe palpite para este participante
  const { data: existing } = await supabase
    .from('predictions')
    .select('id')
    .eq('participant_id', session.participantId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: 'Você já enviou seus palpites. Não é possível alterar.' },
      { status: 409 }
    );
  }

  const body = await request.json();

  // Validar campos obrigatórios de placar
  const matchFields = [
    'brazil_morocco_brazil_goals',
    'brazil_morocco_opponent_goals',
    'brazil_haiti_brazil_goals',
    'brazil_haiti_opponent_goals',
    'brazil_scotland_brazil_goals',
    'brazil_scotland_opponent_goals',
  ];

  for (const field of matchFields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      return NextResponse.json(
        { error: `Campo obrigatório: ${field}` },
        { status: 400 }
      );
    }
  }

  // Validar order do grupo
  const groupOrder: string[] = body.group_order ?? [];
  if (
    groupOrder.length !== 4 ||
    !GROUP_TEAMS.every((t) => groupOrder.includes(t))
  ) {
    return NextResponse.json(
      { error: 'Ordem do grupo inválida' },
      { status: 400 }
    );
  }

  const brazilGroupPosition = groupOrder.indexOf('Brasil') + 1;

  if (!body.champion || typeof body.champion !== 'string') {
    return NextResponse.json({ error: 'Campeão obrigatório' }, { status: 400 });
  }

  if (body.total_brazil_goals === undefined || body.total_brazil_goals === null) {
    return NextResponse.json(
      { error: 'Total de gols do Brasil obrigatório' },
      { status: 400 }
    );
  }

  const { error } = await supabase.from('predictions').insert({
    participant_id: session.participantId,
    brazil_morocco_brazil_goals: Number(body.brazil_morocco_brazil_goals),
    brazil_morocco_opponent_goals: Number(body.brazil_morocco_opponent_goals),
    brazil_haiti_brazil_goals: Number(body.brazil_haiti_brazil_goals),
    brazil_haiti_opponent_goals: Number(body.brazil_haiti_opponent_goals),
    brazil_scotland_brazil_goals: Number(body.brazil_scotland_brazil_goals),
    brazil_scotland_opponent_goals: Number(body.brazil_scotland_opponent_goals),
    group_order: groupOrder,
    brazil_group_position: brazilGroupPosition,
    champion: body.champion.trim(),
    total_brazil_goals: Number(body.total_brazil_goals),
  });

  if (error) {
    return NextResponse.json({ error: 'Erro ao salvar palpites' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
