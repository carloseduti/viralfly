import { PublicationService } from '@/server/modules/publications/publication.service';
import { requireAuthenticatedUser } from '@/server/auth/require-authenticated-user';
import { successResponse } from '@/utils/api-response';
import { withRouteErrorHandling } from '@/utils/route-handler';

const publicationService = new PublicationService();

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  return withRouteErrorHandling(async () => {
    const user = await requireAuthenticatedUser();
    const { id } = await context.params;
    const publication = await publicationService.getPublicationById(user.id, id);
    return successResponse(publication);
  });
}
