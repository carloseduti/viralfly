import { requireAuthenticatedUser } from '@/server/auth/require-authenticated-user';
import { BaseImageService } from '@/server/modules/campaigns/base-image.service';
import { successResponse } from '@/utils/api-response';
import { withRouteErrorHandling } from '@/utils/route-handler';

const baseImageService = new BaseImageService();

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  return withRouteErrorHandling(async () => {
    const user = await requireAuthenticatedUser();
    const { id } = await context.params;
    const campaign = await baseImageService.refreshBaseImageStatus(user.id, id);
    return successResponse(campaign);
  });
}
