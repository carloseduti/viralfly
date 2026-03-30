import { createServerSupabaseClient } from '@/lib/supabase/server';
import { authDebug } from '@/server/auth/auth-observability';
import { successResponse } from '@/utils/api-response';
import { withRouteErrorHandling } from '@/utils/route-handler';

export async function POST() {
  return withRouteErrorHandling(async () => {
    authDebug('api-logout:start');
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
    authDebug('api-logout:success');
    return successResponse({ loggedOut: true });
  });
}
