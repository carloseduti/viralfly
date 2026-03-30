import { requireAuthenticatedUser } from '@/server/auth/require-authenticated-user';
import { BaseImageService } from '@/server/modules/campaigns/base-image.service';
import { generateBaseImageSchema } from '@/server/validators/campaign.validator';
import { successResponse } from '@/utils/api-response';
import { withRouteErrorHandling } from '@/utils/route-handler';

const baseImageService = new BaseImageService();

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return withRouteErrorHandling(async () => {
    const user = await requireAuthenticatedUser();
    const { id } = await context.params;
    const payload = generateBaseImageSchema.parse(await request.json().catch(() => ({})));
    const campaign = await baseImageService.generateBaseImage(user.id, id, payload.forceRegenerate);
    return successResponse(campaign, 202);
  });
}
