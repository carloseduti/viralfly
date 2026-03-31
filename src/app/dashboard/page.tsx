import { prisma } from '@/lib/prisma';
import { authError, envPresenceSnapshot } from '@/server/auth/auth-observability';
import { requirePageAuthenticatedUser } from '@/server/auth/require-authenticated-user';

import { DashboardContent } from './dashboard-content';

export default async function DashboardPage() {
  const user = await requirePageAuthenticatedUser();

  let campaignCount = 0;
  let scriptCount = 0;
  let frameCount = 0;
  let videoCount = 0;
  let publicationCount = 0;
  let latestCampaigns: Array<{
    id: string;
    nomeProduto: string;
    tipoProduto: string;
    status: string;
    createdAt: Date;
  }> = [];

  try {
    [campaignCount, scriptCount, frameCount, videoCount, publicationCount, latestCampaigns] = await Promise.all([
      prisma.campaign.count({ where: { userId: user.id } }),
      prisma.videoScript.count({ where: { campaign: { userId: user.id } } }),
      prisma.scriptFrame.count({ where: { script: { campaign: { userId: user.id } } } }),
      prisma.generatedVideo.count({ where: { script: { campaign: { userId: user.id } } } }),
      prisma.tikTokPublication.count({ where: { generatedVideo: { script: { campaign: { userId: user.id } } } } }),
      prisma.campaign.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);
  } catch (error) {
    authError('dashboard:load-failed', error, {
      userId: user.id,
      ...envPresenceSnapshot()
    });
    throw error;
  }

  const totalOutput = campaignCount + scriptCount + frameCount + videoCount + publicationCount;

  return (
    <DashboardContent
      metrics={{
        totalOutput,
        campaignCount,
        scriptCount,
        frameCount,
        videoCount,
        publicationCount
      }}
      latestCampaigns={latestCampaigns.map((c) => ({
        id: c.id,
        nomeProduto: c.nomeProduto,
        tipoProduto: c.tipoProduto,
        status: c.status,
        createdAt: c.createdAt.toISOString()
      }))}
    />
  );
}
