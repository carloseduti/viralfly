import { GeneratedVideo, Prisma, VideoAssemblyStatus } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export class VideoRepository {
  upsertByScript(scriptId: string, data: Prisma.GeneratedVideoUncheckedCreateInput): Promise<GeneratedVideo> {
    return prisma.generatedVideo.upsert({
      where: { scriptId },
      create: data,
      update: {
        statusMontagem: data.statusMontagem,
        storagePath: data.storagePath,
        publicUrl: data.publicUrl,
        thumbnailPath: data.thumbnailPath,
        thumbnailUrl: data.thumbnailUrl,
        duracaoTotal: data.duracaoTotal,
        erro: data.erro
      }
    });
  }

  updateStatus(id: string, statusMontagem: VideoAssemblyStatus, erro?: string | null) {
    return prisma.generatedVideo.update({
      where: { id },
      data: { statusMontagem, erro: erro ?? null }
    });
  }

  findByIdAndUser(videoId: string, userId: string) {
    return prisma.generatedVideo.findFirst({
      where: {
        id: videoId,
        script: {
          campaign: { userId }
        }
      },
      include: {
        script: {
          include: {
            campaign: true,
            frames: {
              orderBy: { ordem: 'asc' },
              include: { generatedFrame: true }
            }
          }
        },
        publication: true
      }
    });
  }
}

