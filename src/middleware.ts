import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { env } from '@/lib/env';
import { authDebug, authError, envPresenceSnapshot } from '@/server/auth/auth-observability';
import { isLoginPath, isPrivatePath } from '@/server/auth/route-access';
import { isAuthSessionMissingMessage } from '@/server/auth/supabase-auth-error';

type SupabaseCookie = {
  name: string;
  value: string;
  options?: Parameters<NextResponse['cookies']['set']>[2];
};

export async function middleware(request: NextRequest) {
  authDebug('middleware:start', {
    pathname: request.nextUrl.pathname,
    method: request.method,
    ...(env.AUTH_DEBUG ? envPresenceSnapshot() : {})
  });

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
      authDebug('middleware:getUser:success', { hasUser: Boolean(authUser?.id) });
    } else if (!isAuthSessionMissingMessage(error.message)) {
      authError('middleware:getUser:error', error, { pathname: request.nextUrl.pathname });
    } else {
      authDebug('middleware:getUser:no-session', { pathname: request.nextUrl.pathname });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'erro desconhecido';
    if (!isAuthSessionMissingMessage(message)) {
      authError('middleware:getUser:exception', error, { pathname: request.nextUrl.pathname });
    }
  }

  const pathname = request.nextUrl.pathname;

  if (isPrivatePath(pathname) && !user) {
    authDebug('middleware:redirect-login', { pathname });
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
    authDebug('middleware:redirect-dashboard', { pathname });
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    const redirectResponse = NextResponse.redirect(redirectUrl);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  authDebug('middleware:pass-through', { pathname, hasUser: Boolean(user?.id) });
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
