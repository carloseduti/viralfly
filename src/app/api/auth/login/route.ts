import { createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse } from '@/utils/api-response';
import { withRouteErrorHandling } from '@/utils/route-handler';
import { loginSchema } from '@/server/validators/auth.validator';
import { errorResponse } from '@/utils/api-response';

export async function POST(request: Request) {
  return withRouteErrorHandling(async () => {
    const body = loginSchema.parse(await request.json());
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password
    });

    if (error) {
      return errorResponse(`Falha no login: ${error.message}`, 401);
    }

    return successResponse({ loggedIn: true });
  });
}
