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
}

