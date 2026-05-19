import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { normalizePhone } from '@/lib/phone';
import { createSessionToken, setSessionCookie } from '@/lib/session';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const rawPhone: string = body.phone ?? '';
  const name: string = (body.name ?? '').trim();

  const phone = normalizePhone(rawPhone);
  if (phone.length < 10 || phone.length > 11) {
    return NextResponse.json({ error: 'Telefone inválido' }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Buscar participante existente
  const { data: existing } = await supabase
    .from('participants')
    .select('id, name')
    .eq('phone', phone)
    .maybeSingle();

  if (existing) {
    // Participante já existe — criar sessão e retornar
    const token = await createSessionToken({ participantId: existing.id, name: existing.name });
    const response = NextResponse.json({ isNew: false, name: existing.name });
    setSessionCookie(response, token);
    return response;
  }

  // Novo participante — precisa do nome
  if (!name) {
    return NextResponse.json({ isNew: true }, { status: 200 });
  }

  // Criar participante
  const { data: created, error } = await supabase
    .from('participants')
    .insert({ phone, name })
    .select('id, name')
    .single();

  if (error || !created) {
    console.error('[login] insert error:', JSON.stringify(error));
    return NextResponse.json({ error: 'Erro ao criar participante', detail: error?.message }, { status: 500 });
  }

  const token = await createSessionToken({ participantId: created.id, name: created.name });
  const response = NextResponse.json({ isNew: true, name: created.name });
  setSessionCookie(response, token);
  return response;
}
