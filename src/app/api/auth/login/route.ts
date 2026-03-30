import { createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse } from '@/utils/api-response';
import { withRouteErrorHandling } from '@/utils/route-handler';
import { loginSchema } from '@/server/validators/auth.validator';
import { errorResponse } from '@/utils/api-response';
import { authDebug, authError } from '@/server/auth/auth-observability';

export async function POST(request: Request) {
  return withRouteErrorHandling(async () => {
    authDebug('api-login:start');
    const body = loginSchema.parse(await request.json());
    const supabase = await createServerSupabaseClient();
    authDebug('api-login:client-created');

    const { error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password
    });

    if (error) {
      authError('api-login:sign-in-failed', error);
      return errorResponse(`Falha no login: ${error.message}`, 401);
    }

    authDebug('api-login:success');
    return successResponse({ loggedIn: true });
  });
}
