import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getSessionFromRequest } from '@/lib/session';

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const supabase = createServiceClient();

  const [{ data: settings }, { data: prediction }] = await Promise.all([
    supabase.from('app_settings').select('predictions_locked').single(),
    supabase
      .from('predictions')
      .select('id')
      .eq('participant_id', session.participantId)
      .maybeSingle(),
  ]);

  return NextResponse.json({
    locked: settings?.predictions_locked ?? false,
    hasSubmitted: !!prediction,
    name: session.name,
  });
}
