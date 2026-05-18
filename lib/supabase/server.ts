import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Cliente com service role — apenas server-side (API Routes, Server Components)
// NUNCA expor SUPABASE_SERVICE_ROLE_KEY no browser
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
