import type { Campaign, PublicationStatus } from '@prisma/client';

type CampaignWithRelations = Campaign & {
  scripts: Array<{
    id: string;
    marketingScript: string | null;
    visualStyle: string | null;
    campaignTone: string | null;
    sceneDirection: string | null;
    frames: Array<{
      id: string;
      ordem: number;
      objetivo: string;
      fala: string;
      promptVideo: string;
      status: string;
      generatedFrame: { status: string; publicUrl: string | null } | null;
    }>;
    generatedVideo: {
      publicUrl: string | null;
      publication: { status: PublicationStatus } | null;
    } | null;
  }>;
};

export type VideoMasterObject = {
  productId: string;
  productImage: string | null;
  generatedBaseImage: string | null;
  marketingScript: string | null;
  visualStyle: string;
  campaignTone: string;
  sceneDirection: string;
  frames: Array<{
    id: string;
    order: number;
    objective: string;
    status: string;
    publicUrl: string | null;
  }>;
  finalVideoUrl: string | null;
  publicationStatus: string;
};

export function buildVideoMasterObject(campaign: CampaignWithRelations): VideoMasterObject {
  const latestScript = campaign.scripts[0] ?? null;
  const finalVideoUrl = latestScript?.generatedVideo?.publicUrl ?? null;
  const publicationStatus = latestScript?.generatedVideo?.publication?.status ?? 'PENDING';

  return {
    productId: campaign.id,
    productImage: campaign.imagePublicUrl,
    generatedBaseImage: campaign.baseImagePublicUrl,
    marketingScript: latestScript?.marketingScript ?? null,
    visualStyle: latestScript?.visualStyle ?? campaign.estiloVisual,
    campaignTone: latestScript?.campaignTone ?? campaign.campaignTone,
    sceneDirection: latestScript?.sceneDirection ?? campaign.sceneDirection,
    frames:
      latestScript?.frames.map((frame) => ({
        id: frame.id,
        order: frame.ordem,
        objective: frame.objetivo,
        status: frame.generatedFrame?.status ?? frame.status,
        publicUrl: frame.generatedFrame?.publicUrl ?? null
      })) ?? [],
    finalVideoUrl,
    publicationStatus
  };
}
