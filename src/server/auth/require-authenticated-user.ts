import { User as SupabaseUser } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { authDebug, authError, envPresenceSnapshot } from '@/server/auth/auth-observability';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isAuthSessionMissingMessage } from '@/server/auth/supabase-auth-error';
import { AppError } from '@/utils/errors';

export async function getOptionalAuthenticatedUser(): Promise<SupabaseUser | null> {
  authDebug('get-optional-user:start');
  const supabase = await createServerSupabaseClient();

  try {
    const result = await supabase.auth.getUser();

    if (result.error) {
      if (!isAuthSessionMissingMessage(result.error.message)) {
        authError('get-optional-user:supabase-error', result.error, envPresenceSnapshot());
      }
      authDebug('get-optional-user:no-session');
      return null;
    }

    authDebug('get-optional-user:success', { hasUser: Boolean(result.data.user?.id) });
    return result.data.user;
  } catch (caughtError) {
    const message = caughtError instanceof Error ? caughtError.message : 'erro desconhecido';
    if (!isAuthSessionMissingMessage(message)) {
      authError('get-optional-user:exception', caughtError, envPresenceSnapshot());
    }
    return null;
  }
}

export async function syncAuthenticatedUser(user: SupabaseUser) {
  authDebug('sync-authenticated-user:start', { userId: user.id });

  try {
    await prisma.user.upsert({
      where: { id: user.id },
      update: { email: user.email ?? 'sem-email@local' },
      create: {
        id: user.id,
        email: user.email ?? 'sem-email@local'
      }
    });
    authDebug('sync-authenticated-user:done', { userId: user.id });
  } catch (error) {
    authError('sync-authenticated-user:failed', error, envPresenceSnapshot());
    throw new AppError(
      'Falha ao conectar no banco de dados. Verifique DATABASE_URL na Vercel (usuario/senha/host do Supabase).',
      500
    );
  }
}

export async function requireAuthenticatedUser(): Promise<SupabaseUser> {
  const user = await getOptionalAuthenticatedUser();
  if (!user) {
    throw new AppError('Usuario nao autenticado', 401);
  }

  await syncAuthenticatedUser(user);
  return user;
}

export async function requirePageAuthenticatedUser(): Promise<SupabaseUser> {
  authDebug('require-page-authenticated-user:start');
  const user = await getOptionalAuthenticatedUser();
  if (!user) {
    authDebug('require-page-authenticated-user:redirect-login');
    redirect('/login');
  }

  await syncAuthenticatedUser(user);
  authDebug('require-page-authenticated-user:success', { userId: user.id });
  return user;
}
