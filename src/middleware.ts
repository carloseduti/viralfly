import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { env } from '@/lib/env';
import { isLoginPath, isPrivatePath } from '@/server/auth/route-access';
import { isAuthSessionMissingMessage } from '@/server/auth/supabase-auth-error';

type SupabaseCookie = {
  name: string;
  value: string;
  options?: Parameters<NextResponse['cookies']['set']>[2];
};

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: SupabaseCookie[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  let user: { id: string } | null = null;
  try {
    const {
      data: { user: authUser },
      error
    } = await supabase.auth.getUser();

    if (!error) {
      user = authUser;
    } else if (!isAuthSessionMissingMessage(error.message)) {
      console.error('Falha ao validar sessao no middleware:', error.message);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'erro desconhecido';
    if (!isAuthSessionMissingMessage(message)) {
      console.error('Erro ao consultar usuario no middleware:', message);
    }
  }

  const pathname = request.nextUrl.pathname;

  if (isPrivatePath(pathname) && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('next', pathname);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  if (isLoginPath(pathname) && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    const redirectResponse = NextResponse.redirect(redirectUrl);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
