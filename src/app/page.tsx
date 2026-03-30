import { redirect } from 'next/navigation';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function HomePage() {
  let user: { id: string } | null = null;
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user: authUser },
      error
    } = await supabase.auth.getUser();

    if (!error) {
      user = authUser;
    } else {
      console.error('Falha ao validar sessao na home:', error.message);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'erro desconhecido';
    console.error('Erro ao consultar usuario na home:', message);
  }

  redirect(user ? '/dashboard' : '/login');
}
