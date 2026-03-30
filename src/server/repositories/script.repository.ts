import { Prisma, ScriptStatus, VideoScript } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export class ScriptRepository {
  create(data: Prisma.VideoScriptUncheckedCreateInput): Promise<VideoScript> {
    return prisma.videoScript.create({ data });
  }

  createFrames(data: Prisma.ScriptFrameUncheckedCreateInput[]) {
    return prisma.scriptFrame.createMany({ data });
  }

  findByIdAndUser(id: string, userId: string) {
    return prisma.videoScript.findFirst({
      where: {
        id,
        campaign: { userId }
      },
      include: {
        campaign: true,
        frames: {
          orderBy: { ordem: 'asc' },
          include: { generatedFrame: true }
        },
        generatedVideo: {
          include: { publication: true }
        }
      }
    });
  }

  findLatestByCampaign(campaignId: string, userId: string) {
    return prisma.videoScript.findFirst({
      where: {
        campaignId,
        campaign: { userId }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        frames: {
          orderBy: { ordem: 'asc' },
          include: { generatedFrame: true }
        },
        generatedVideo: { include: { publication: true } }
      }
    });
  }

  updateStatus(id: string, status: ScriptStatus) {
    return prisma.videoScript.update({
      where: { id },
      data: { status }
    });
  }
}

