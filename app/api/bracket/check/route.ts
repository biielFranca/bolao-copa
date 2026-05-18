import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getSessionFromRequest } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ hasSubmitted: false, picks: null });
  }

  const supabase = createServiceClient();
  const { data } = await supabase
    .from('bracket_predictions')
    .select('picks')
    .eq('participant_id', session.participantId)
    .maybeSingle();

  if (!data) {
    return NextResponse.json({ hasSubmitted: false, picks: null });
  }

  return NextResponse.json({ hasSubmitted: true, picks: data.picks });
}
