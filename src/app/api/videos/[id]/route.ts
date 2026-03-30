import { VideoAssemblyService } from '@/server/modules/videos/video-assembly.service';
import { requireAuthenticatedUser } from '@/server/auth/require-authenticated-user';
import { successResponse } from '@/utils/api-response';
import { withRouteErrorHandling } from '@/utils/route-handler';

const videoService = new VideoAssemblyService();

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  return withRouteErrorHandling(async () => {
    const user = await requireAuthenticatedUser();
    const { id } = await context.params;
    const video = await videoService.getVideoById(user.id, id);
    return successResponse(video);
  });
}
