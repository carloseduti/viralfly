import { CampaignService } from '@/server/modules/campaigns/campaign.service';
import { requireAuthenticatedUser } from '@/server/auth/require-authenticated-user';
import { createCampaignSchema } from '@/server/validators/campaign.validator';
import { successResponse } from '@/utils/api-response';
import { withRouteErrorHandling } from '@/utils/route-handler';
import { AppError } from '@/utils/errors';

const campaignService = new CampaignService();

export async function POST(request: Request) {
  return withRouteErrorHandling(async () => {
    const user = await requireAuthenticatedUser();
    const contentType = request.headers.get('content-type') ?? '';

    if (!contentType.includes('multipart/form-data')) {
      throw new AppError('Payload invalido: use multipart/form-data com imagem do produto', 422);
    }

    const formData = await request.formData();
    const payload = createCampaignSchema.parse({
      nomeProduto: formData.get('nomeProduto'),
      tipoProduto: formData.get('tipoProduto'),
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
    });

    const image = formData.get('image');
    if (!(image instanceof File)) {
      throw new AppError('Imagem do produto e obrigatoria para gerar os frames', 422);
    }

    const campaign = await campaignService.createCampaign(user.id, payload, {
      buffer: Buffer.from(await image.arrayBuffer()),
      mimeType: image.type || 'image/jpeg',
      fileName: image.name || 'product.jpg'
    });

    return successResponse(campaign, 201);
  });
}

export async function GET() {
  return withRouteErrorHandling(async () => {
    const user = await requireAuthenticatedUser();
    const campaigns = await campaignService.listCampaigns(user.id);
    return successResponse(campaigns);
  });
}

function parseCheckboxValue(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') {
    return false;
  }

  return ['on', 'true', '1', 'yes'].includes(value.toLowerCase());
}
