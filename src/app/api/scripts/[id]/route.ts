import { ScriptService } from '@/server/modules/scripts/script.service';
import { requireAuthenticatedUser } from '@/server/auth/require-authenticated-user';
import { successResponse } from '@/utils/api-response';
import { withRouteErrorHandling } from '@/utils/route-handler';

const scriptService = new ScriptService();

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  return withRouteErrorHandling(async () => {
    const user = await requireAuthenticatedUser();
    const { id } = await context.params;
    const script = await scriptService.getScriptById(user.id, id);
    return successResponse(script);
  });
}
