import { Campaign, Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export class CampaignRepository {
  create(data: Prisma.CampaignUncheckedCreateInput): Promise<Campaign> {
    return prisma.campaign.create({ data });
  }

  async updateByIdAndUser(id: string, userId: string, data: Prisma.CampaignUncheckedUpdateInput): Promise<Campaign | null> {
    const result = await prisma.campaign.updateMany({
      where: { id, userId },
      data
    });

    if (result.count === 0) {
      return null;
    }

    return prisma.campaign.findUnique({ where: { id } });
  }

  listByUser(userId: string): Promise<Campaign[]> {
    return prisma.campaign.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  findByIdAndUser(id: string, userId: string) {
    return prisma.campaign.findFirst({
      where: { id, userId },
      include: {
        scripts: {
          orderBy: { createdAt: 'desc' },
          include: {
            frames: {
              orderBy: { ordem: 'asc' },
              include: { generatedFrame: true }
            },
            generatedVideo: {
              include: { publication: true }
            }
          }
        }
      }
    });
  }

  findByBaseImageExternalJobId(externalJobId: string) {
    return prisma.campaign.findFirst({
      where: { baseImageExternalJobId: externalJobId }
    });
  }

  async deleteByIdAndUser(id: string, userId: string) {
    const result = await prisma.campaign.deleteMany({
      where: { id, userId }
    });

    return result.count > 0;
  }

  async getDeletionSummary(id: string, userId: string) {
    const campaign = await prisma.campaign.findFirst({
      where: { id, userId },
      select: {
        id: true,
        nomeProduto: true,
        _count: {
          select: {
            scripts: true
          }
        },
        scripts: {
          select: {
            id: true,
            _count: {
              select: {
                frames: true
              }
            },
            generatedVideo: {
              select: {
                id: true,
                publication: {
                  select: {
                    id: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!campaign) {
      return null;
    }

    const frameCount = campaign.scripts.reduce((sum, script) => sum + script._count.frames, 0);
    const videoCount = campaign.scripts.reduce((sum, script) => sum + (script.generatedVideo ? 1 : 0), 0);
    const publicationCount = campaign.scripts.reduce(
      (sum, script) => sum + (script.generatedVideo?.publication ? 1 : 0),
      0
    );

    return {
      id: campaign.id,
      nomeProduto: campaign.nomeProduto,
      scripts: campaign._count.scripts,
      frames: frameCount,
      videos: videoCount,
      publications: publicationCount
    };
  }
}

