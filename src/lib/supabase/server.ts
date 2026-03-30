import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { env } from '@/lib/env';
import { authDebug } from '@/server/auth/auth-observability';

type SupabaseCookie = {
  name: string;
  value: string;
  options?: Parameters<Awaited<ReturnType<typeof cookies>>['set']>[2];
};

export async function createServerSupabaseClient() {
  authDebug('create-server-supabase-client:start');
  const cookieStore = await cookies();

  const client = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: SupabaseCookie[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Em Server Components o Next pode impedir escrita de cookie.
          // Nesse caso, a atualizacao de sessao fica para middleware/route handlers.
        }
      }
    }
  });

  authDebug('create-server-supabase-client:done');
  return client;
}

