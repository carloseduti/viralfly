import { FrameGenerationService } from '@/server/modules/frames/frame-generation.service';
import { requireAuthenticatedUser } from '@/server/auth/require-authenticated-user';
import { regenerateFrameSchema } from '@/server/validators/frame.validator';
import { successResponse } from '@/utils/api-response';
import { withRouteErrorHandling } from '@/utils/route-handler';

const frameService = new FrameGenerationService();

export async function POST(request: Request, context: { params: Promise<{ frameId: string }> }) {
  return withRouteErrorHandling(async () => {
    await regenerateFrameSchema.parse(await request.json().catch(() => ({})));
    const user = await requireAuthenticatedUser();
    const { frameId } = await context.params;
    const result = await frameService.regenerateSingleFrame(user.id, frameId);
    return successResponse(result, 202);
  });
}
