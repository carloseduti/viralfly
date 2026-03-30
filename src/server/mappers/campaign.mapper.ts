export function campaignSummaryMapper(campaign: {
  id: string;
  nomeProduto: string;
  tipoProduto: string;
  imagePublicUrl: string | null;
  status: string;
  createdAt: Date;
}) {
  return {
    id: campaign.id,
    nomeProduto: campaign.nomeProduto,
    tipoProduto: campaign.tipoProduto,
    imagePublicUrl: campaign.imagePublicUrl,
    status: campaign.status,
    createdAt: campaign.createdAt
  };
}
