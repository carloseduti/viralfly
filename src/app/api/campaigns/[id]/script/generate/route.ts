import { ScriptService } from '@/server/modules/scripts/script.service';
import { requireAuthenticatedUser } from '@/server/auth/require-authenticated-user';
import { generateScriptSchema } from '@/server/validators/script.validator';
import { successResponse } from '@/utils/api-response';
import { withRouteErrorHandling } from '@/utils/route-handler';

const scriptService = new ScriptService();

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return withRouteErrorHandling(async () => {
    const user = await requireAuthenticatedUser();
    const { id } = await context.params;
    const payload = generateScriptSchema.parse(await request.json().catch(() => ({})));
    const result = await scriptService.enqueueScriptGeneration(user.id, id, payload.titulo);
    return successResponse(result, 202);
  });
}
