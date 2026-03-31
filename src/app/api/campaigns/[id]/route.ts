import { CampaignService } from '@/server/modules/campaigns/campaign.service';
import { requireAuthenticatedUser } from '@/server/auth/require-authenticated-user';
import { updateCampaignSchema } from '@/server/validators/campaign.validator';
import { successResponse } from '@/utils/api-response';
import { withRouteErrorHandling } from '@/utils/route-handler';
import { AppError } from '@/utils/errors';

const campaignService = new CampaignService();

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  return withRouteErrorHandling(async () => {
    const user = await requireAuthenticatedUser();
    const { id } = await context.params;
    const campaign = await campaignService.getCampaignById(user.id, id);
    return successResponse(campaign);
  });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  return withRouteErrorHandling(async () => {
    const user = await requireAuthenticatedUser();
    const { id } = await context.params;
    const contentType = request.headers.get('content-type') ?? '';

    if (!contentType.includes('multipart/form-data')) {
      throw new AppError('Payload invalido: use multipart/form-data', 422);
    }

    const formData = await request.formData();
    const rawPayload = {
      nomeProduto: formData.get('nomeProduto') || undefined,
      tipoProduto: formData.get('tipoProduto') || undefined,
      gerarImagemBaseNanoBanana: formData.has('gerarImagemBaseNanoBanana')
        ? parseCheckboxValue(formData.get('gerarImagemBaseNanoBanana'))
        : undefined,
      gerarRoteiroComIa: formData.has('gerarRoteiroComIa') ? parseCheckboxValue(formData.get('gerarRoteiroComIa')) : undefined,
      descricaoProduto: formData.get('descricaoProduto') || undefined,
      idioma: formData.get('idioma') || undefined,
      ctaPreferido: formData.get('ctaPreferido') || undefined,
      estiloVisual: formData.get('estiloVisual') || undefined,
      campaignTone: formData.get('campaignTone') || undefined,
      sceneDirection: formData.get('sceneDirection') || undefined
    };

    const payload = updateCampaignSchema.parse(Object.fromEntries(Object.entries(rawPayload).filter(([, value]) => value !== undefined)));

    const image = formData.get('image');
    const imageInput =
      image instanceof File
        ? {
            buffer: Buffer.from(await image.arrayBuffer()),
            mimeType: image.type || 'image/jpeg',
            fileName: image.name || 'product.jpg'
          }
        : undefined;

    if (Object.keys(payload).length === 0 && !imageInput) {
      throw new AppError('Nenhum campo valido enviado para atualizacao', 422);
    }

    const campaign = await campaignService.updateCampaign(user.id, id, payload, imageInput);
    return successResponse(campaign);
  });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  return withRouteErrorHandling(async () => {
    const user = await requireAuthenticatedUser();
    const { id } = await context.params;
    const result = await campaignService.deleteCampaign(user.id, id);
    return successResponse(result);
  });
}

function parseCheckboxValue(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') {
    return false;
  }

  return ['on', 'true', '1', 'yes'].includes(value.toLowerCase());
}
