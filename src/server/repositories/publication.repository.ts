import { Prisma, PublicationStatus } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export class PublicationRepository {
  upsertByVideo(generatedVideoId: string, data: Prisma.TikTokPublicationUncheckedCreateInput) {
    return prisma.tikTokPublication.upsert({
      where: { generatedVideoId },
      create: data,
      update: {
        legendaPublicacao: data.legendaPublicacao,
        hashtagsPublicacao: data.hashtagsPublicacao,
        modoVisibilidade: data.modoVisibilidade,
        status: data.status,
        erro: data.erro,
        providerPostId: data.providerPostId,
        creatorTikTokId: data.creatorTikTokId
      }
    });
  }

  updateStatus(id: string, status: PublicationStatus, data?: Partial<Prisma.TikTokPublicationUncheckedUpdateInput>) {
    return prisma.tikTokPublication.update({
      where: { id },
      data: {
        status,
        ...(data ?? {})
      }
    });
  }

  findByIdAndUser(id: string, userId: string) {
    return prisma.tikTokPublication.findFirst({
      where: {
        id,
        generatedVideo: {
          script: {
            campaign: { userId }
          }
        }
      },
      include: {
        generatedVideo: {
          include: {
            script: {
              include: {
                campaign: true,
                frames: {
                  orderBy: { ordem: 'asc' },
                  include: { generatedFrame: true }
                }
              }
            }
          }
        }
      }
    });
  }
}

