import { createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse } from '@/utils/api-response';
import { withRouteErrorHandling } from '@/utils/route-handler';

export async function POST() {
  return withRouteErrorHandling(async () => {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
    return successResponse({ loggedOut: true });
  });
}
