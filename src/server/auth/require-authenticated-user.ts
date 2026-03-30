import { User as SupabaseUser } from '@supabase/supabase-js';

import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AppError } from '@/utils/errors';

export async function requireAuthenticatedUser(): Promise<SupabaseUser> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AppError('Usuário não autenticado', 401);
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

