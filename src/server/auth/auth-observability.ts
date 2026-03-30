import { env } from '@/lib/env';

type LogPayload = Record<string, unknown> | undefined;

export function authDebug(step: string, payload?: LogPayload) {
  if (!env.AUTH_DEBUG) {
    return;
  }

  if (payload) {
    console.log(`[auth] ${step}`, payload);
    return;
  }

  console.log(`[auth] ${step}`);
}

export function authError(step: string, error: unknown, payload?: LogPayload) {
  const details = {
    ...(payload ?? {}),
    errorMessage: error instanceof Error ? error.message : String(error)
  };

  if (error instanceof Error) {
    console.error(`[auth] ${step}`, details, error.stack);
    return;
  }

  console.error(`[auth] ${step}`, details);
}

export function envPresenceSnapshot() {
  return {
    hasNextPublicSupabaseUrl: Boolean(env.NEXT_PUBLIC_SUPABASE_URL),
    hasNextPublicSupabaseAnonKey: Boolean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    hasSupabaseServiceRoleKey: Boolean(env.SUPABASE_SERVICE_ROLE_KEY),
    hasDatabaseUrl: Boolean(env.DATABASE_URL),
    databaseHost: safeHostname(env.DATABASE_URL),
    supabaseHost: safeHostname(env.NEXT_PUBLIC_SUPABASE_URL)
  };
}

function safeHostname(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return 'invalid-url';
  }
}
