import { requirePageAuthenticatedUser } from '@/server/auth/require-authenticated-user';
import { CampaignService } from '@/server/modules/campaigns/campaign.service';

import { ProductsContent } from './products-content';

const campaignService = new CampaignService();

export default async function CampaignsPage() {
  const user = await requirePageAuthenticatedUser();
  const campaigns = await campaignService.listCampaigns(user.id);

  return (
    <ProductsContent
      campaigns={campaigns.map((c) => ({
        id: c.id,
        nomeProduto: c.nomeProduto,
        tipoProduto: c.tipoProduto,
        status: c.status,
        baseImageStatus: c.baseImageStatus,
        imagePublicUrl: c.imagePublicUrl,
        createdAt: c.createdAt.toISOString()
      }))}
    />
  );
}
