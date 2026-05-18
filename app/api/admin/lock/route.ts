import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAdminSessionFromRequest } from '@/lib/session';

export async function POST(request: NextRequest) {
  const isAdmin = await getAdminSessionFromRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const body = await request.json();
  const locked: boolean = body.locked;

  const supabase = createServiceClient();

  const { data: settings } = await supabase
    .from('app_settings')
    .select('id')
    .limit(1)
    .single();

  if (!settings) {
    return NextResponse.json({ error: 'Configurações não encontradas' }, { status: 500 });
  }

  const { error } = await supabase
    .from('app_settings')
    .update({ predictions_locked: locked, updated_at: new Date().toISOString() })
    .eq('id', settings.id);

  if (error) {
    return NextResponse.json({ error: 'Erro ao atualizar configuração' }, { status: 500 });
  }

  return NextResponse.json({ success: true, locked });
}
