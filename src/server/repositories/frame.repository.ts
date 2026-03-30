import { FrameStatus, Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export class FrameRepository {
  listByScriptAndUser(scriptId: string, userId: string) {
    return prisma.scriptFrame.findMany({
      where: {
        scriptId,
        script: {
          campaign: { userId }
        }
      },
      orderBy: { ordem: 'asc' },
      include: { generatedFrame: true }
    });
  }

  findByIdAndUser(frameId: string, userId: string) {
    return prisma.scriptFrame.findFirst({
      where: {
        id: frameId,
        script: {
          campaign: { userId }
        }
      },
      include: {
        script: { include: { campaign: true } },
        generatedFrame: true
      }
    });
  }

  markFrameStatus(frameId: string, status: FrameStatus) {
    return prisma.scriptFrame.update({ where: { id: frameId }, data: { status } });
  }

  upsertGeneratedFrame(scriptFrameId: string, data: Prisma.GeneratedFrameUncheckedCreateInput) {
    return prisma.generatedFrame.upsert({
      where: { scriptFrameId },
      create: data,
      update: {
        provider: data.provider,
        externalJobId: data.externalJobId,
        promptEnviado: data.promptEnviado,
        status: data.status,
        storagePath: data.storagePath,
        publicUrl: data.publicUrl,
        duracaoGerada: data.duracaoGerada,
        erro: data.erro,
        tentativas: data.tentativas
      }
    });
  }

  findGeneratedFrameByExternalJobId(externalJobId: string) {
    return prisma.generatedFrame.findFirst({
      where: { externalJobId },
      include: {
        scriptFrame: {
          include: {
            script: {
              include: { campaign: true }
            }
          }
        }
      }
    });
  }
}

