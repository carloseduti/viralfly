import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { env } from '@/lib/env';

let cachedAdminClient: SupabaseClient | null = null;

export function getSupabaseAdminClient() {
  if (cachedAdminClient) {
    return cachedAdminClient;
  }

  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY nao configurada. Defina no .env para usar upload no Storage.');
  }

  if (serviceRoleKey.startsWith('sb_publishable_')) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY invalida: voce informou uma chave publishable. Use a Service Role key do Supabase.');
  }

  cachedAdminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  return cachedAdminClient;
}
