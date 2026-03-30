import { User as SupabaseUser } from '@supabase/supabase-js';

import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AppError } from '@/utils/errors';

export async function requireAuthenticatedUser(): Promise<SupabaseUser> {
  const supabase = await createServerSupabaseClient();

  let user: SupabaseUser | null = null;
  let authErrorMessage: string | null = null;

  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
    authErrorMessage = result.error?.message ?? null;
  } catch (caughtError) {
    const message = caughtError instanceof Error ? caughtError.message : 'erro desconhecido';
    throw new AppError(`Falha ao consultar sessao do Supabase: ${message}`, 401);
  }

  if (authErrorMessage || !user) {
    throw new AppError('Usuario nao autenticado', 401);
  }

  await prisma.user.upsert({
    where: { id: user.id },
    update: { email: user.email ?? 'sem-email@local' },
    create: {
      id: user.id,
      email: user.email ?? 'sem-email@local'
    }
  });

  return user;
}
