import { BaseImageService } from '@/server/modules/campaigns/base-image.service';
import { successResponse } from '@/utils/api-response';
import { withRouteErrorHandling } from '@/utils/route-handler';

const baseImageService = new BaseImageService();

export async function POST(request: Request) {
  return withRouteErrorHandling(async () => {
    const payload = await request.json().catch(() => ({}));
    const result = await baseImageService.handleProviderCallback(payload);
    return successResponse(result);
  });
}
