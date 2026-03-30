import { FrameGenerationService } from '@/server/modules/frames/frame-generation.service';
import { requireAuthenticatedUser } from '@/server/auth/require-authenticated-user';
import { successResponse } from '@/utils/api-response';
import { withRouteErrorHandling } from '@/utils/route-handler';

const frameService = new FrameGenerationService();

export async function GET(request: Request, context: { params: Promise<{ frameId: string }> }) {
  return withRouteErrorHandling(async () => {
    const user = await requireAuthenticatedUser();
    const { frameId } = await context.params;
    const requestUrl = new URL(request.url);
    const shouldSync = requestUrl.searchParams.get('sync') === 'true' || requestUrl.searchParams.get('sync') === '1';
    const frame = shouldSync
      ? await frameService.refreshFrameStatus(user.id, frameId)
      : await frameService.getFrameById(user.id, frameId);
    return successResponse(frame);
  });
}
