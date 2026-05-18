import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createServiceClient();

  const [{ data: standings }, { data: results }] = await Promise.all([
    supabase.from('bracket_standings').select('*'),
    supabase.from('bracket_results').select('*'),
  ]);

  return NextResponse.json({
    standings: standings ?? [],
    results: results ?? [],
  });
}
