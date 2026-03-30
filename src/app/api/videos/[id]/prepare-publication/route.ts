import { PublicationService } from '@/server/modules/publications/publication.service';
import { requireAuthenticatedUser } from '@/server/auth/require-authenticated-user';
import { preparePublicationSchema } from '@/server/validators/publication.validator';
import { successResponse } from '@/utils/api-response';
import { withRouteErrorHandling } from '@/utils/route-handler';

const publicationService = new PublicationService();

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return withRouteErrorHandling(async () => {
    const payload = preparePublicationSchema.parse(await request.json().catch(() => ({})));
    const user = await requireAuthenticatedUser();
    const { id } = await context.params;
    const publication = await publicationService.preparePublication(user.id, id, payload.modoVisibilidade);
    return successResponse(publication);
  });
}
