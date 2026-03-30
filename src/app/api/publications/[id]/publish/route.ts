import { PublicationService } from '@/server/modules/publications/publication.service';
import { requireAuthenticatedUser } from '@/server/auth/require-authenticated-user';
import { publishPublicationSchema } from '@/server/validators/publication.validator';
import { successResponse } from '@/utils/api-response';
import { withRouteErrorHandling } from '@/utils/route-handler';

const publicationService = new PublicationService();

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return withRouteErrorHandling(async () => {
    await publishPublicationSchema.parse(await request.json().catch(() => ({})));
    const user = await requireAuthenticatedUser();
    const { id } = await context.params;
    const result = await publicationService.publishToTikTok(user.id, id);
    return successResponse(result, 202);
  });
}
