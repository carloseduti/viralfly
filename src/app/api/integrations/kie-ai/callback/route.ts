import { FrameGenerationService } from '@/server/modules/frames/frame-generation.service';
import { successResponse } from '@/utils/api-response';
import { withRouteErrorHandling } from '@/utils/route-handler';

const frameService = new FrameGenerationService();

export async function POST(request: Request) {
  return withRouteErrorHandling(async () => {
    const payload = await request.json().catch(() => ({}));
    const result = await frameService.handleProviderCallback(payload);
    return successResponse(result);
  });
}
