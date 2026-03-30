import { User as SupabaseUser } from '@supabase/supabase-js';

import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isAuthSessionMissingMessage } from '@/server/auth/supabase-auth-error';
import { AppError } from '@/utils/errors';

export async function getOptionalAuthenticatedUser(): Promise<SupabaseUser | null> {
  const supabase = await createServerSupabaseClient();

  try {
    const result = await supabase.auth.getUser();

    if (result.error) {
      if (!isAuthSessionMissingMessage(result.error.message)) {
        console.error('Falha ao consultar sessao do Supabase:', result.error.message);
      }
      return null;
    }

    return result.data.user;
  } catch (caughtError) {
    const message = caughtError instanceof Error ? caughtError.message : 'erro desconhecido';
    if (!isAuthSessionMissingMessage(message)) {
      console.error('Falha ao consultar sessao do Supabase:', message);
    }
    return null;
  }
}

export async function syncAuthenticatedUser(user: SupabaseUser) {
  await prisma.user.upsert({
    where: { id: user.id },
    update: { email: user.email ?? 'sem-email@local' },
    create: {
      id: user.id,
      email: user.email ?? 'sem-email@local'
    }
  });
}

export async function requireAuthenticatedUser(): Promise<SupabaseUser> {
  const user = await getOptionalAuthenticatedUser();
  if (!user) {
    throw new AppError('Usuario nao autenticado', 401);
  }

  await syncAuthenticatedUser(user);
  return user;
}
