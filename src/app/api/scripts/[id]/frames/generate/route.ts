import { FrameGenerationService } from '@/server/modules/frames/frame-generation.service';
import { requireAuthenticatedUser } from '@/server/auth/require-authenticated-user';
import { generateFramesSchema } from '@/server/validators/frame.validator';
import { successResponse } from '@/utils/api-response';
import { withRouteErrorHandling } from '@/utils/route-handler';

const frameService = new FrameGenerationService();

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return withRouteErrorHandling(async () => {
    const user = await requireAuthenticatedUser();
    const { id } = await context.params;
    const payload = generateFramesSchema.parse(await request.json().catch(() => ({})));
    const result = await frameService.enqueueFramesGeneration(user.id, id, payload.forceRegenerate);
    return successResponse(result, 202);
  });
}
