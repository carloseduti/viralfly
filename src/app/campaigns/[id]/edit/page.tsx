import { CampaignForm } from '@/components/campaign-form';
import { requirePageAuthenticatedUser } from '@/server/auth/require-page-authenticated-user';
import { CampaignService } from '@/server/modules/campaigns/campaign.service';

const campaignService = new CampaignService();

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePageAuthenticatedUser();
  const { id } = await params;
  const campaign = await campaignService.getCampaignById(user.id, id);

  return (
    <CampaignForm
      mode="edit"
      initialValues={{
        id: campaign.id,
        nomeProduto: campaign.nomeProduto,
        tipoProduto: campaign.tipoProduto,
        descricaoProduto: campaign.descricaoProduto,
        idioma: campaign.idioma,
        ctaPreferido: campaign.ctaPreferido,
        estiloVisual: campaign.estiloVisual,
        campaignTone: campaign.campaignTone,
        sceneDirection: campaign.sceneDirection,
        imagePublicUrl: campaign.imagePublicUrl,
        baseImagePublicUrl: campaign.baseImagePublicUrl
      }}
    />
  );
}

