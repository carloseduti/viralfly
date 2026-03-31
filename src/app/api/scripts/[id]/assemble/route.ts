import { VideoAssemblyService } from '@/server/modules/videos/video-assembly.service';
import { requireAuthenticatedUser } from '@/server/auth/require-authenticated-user';
import { assembleVideoSchema } from '@/server/validators/video.validator';
import { successResponse } from '@/utils/api-response';
import { withRouteErrorHandling } from '@/utils/route-handler';

const videoService = new VideoAssemblyService();

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return withRouteErrorHandling(async () => {
    const payload = await assembleVideoSchema.parse(await request.json().catch(() => ({})));
    const user = await requireAuthenticatedUser();
    const { id } = await context.params;
    const result = await videoService.assembleVideoFromScript(user.id, id, payload.forceRemount);
    return successResponse(result, 202);
  });
}
