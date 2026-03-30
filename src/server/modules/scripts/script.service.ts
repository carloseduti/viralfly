import { CampaignStatus, FrameStatus, ScriptStatus } from '@prisma/client';

import { env } from '@/lib/env';
import { prisma } from '@/lib/prisma';
import type { StructuredScriptDraft } from '@/server/domain/types';
import { validateThreeFrameStructure } from '@/server/domain/three-frame-rules';
import type { ScriptGenerationJob } from '@/server/jobs/constants';
import { enqueueScriptGenerationJob } from '@/server/jobs/producers';
import { CampaignRepository } from '@/server/repositories/campaign.repository';
import { ScriptRepository } from '@/server/repositories/script.repository';
import { BaseImageService } from '@/server/modules/campaigns/base-image.service';
import { scriptGeneratorService, type ScriptGeneratorService } from '@/server/services/script-generator.service';
import { AppError } from '@/utils/errors';

export class ScriptService {
  constructor(
    private readonly campaignRepository = new CampaignRepository(),
    private readonly scriptRepository = new ScriptRepository(),
    private readonly baseImageService = new BaseImageService(),
    private readonly scriptGenerator: ScriptGeneratorService = scriptGeneratorService
  ) {}

  async enqueueScriptGeneration(userId: string, campaignId: string, titulo?: string) {
    const campaign = await this.campaignRepository.findByIdAndUser(campaignId, userId);
    if (!campaign) {
      throw new AppError('Produto nao encontrado', 404);
    }

    if (!campaign.imagePublicUrl) {
      throw new AppError('Imagem do produto e obrigatoria para gerar os frames', 422);
    }

    if (!campaign.baseImagePublicUrl || campaign.baseImageStatus !== FrameStatus.GENERATED) {
      await this.baseImageService.ensureBaseImageGenerated(userId, campaignId);
    }

    if (env.DISABLE_QUEUES) {
      await this.generateScriptForCampaign(userId, campaignId, titulo);
      return { queued: false, processed: true };
    }

    await enqueueScriptGenerationJob({ campaignId, userId, titulo });
    return { queued: true, processed: false };
  }

  async handleScriptGenerationJob(payload: ScriptGenerationJob) {
    await this.generateScriptForCampaign(payload.userId, payload.campaignId, payload.titulo);
  }

  async generateScriptForCampaign(userId: string, campaignId: string, titulo?: string) {
    const campaign = await this.campaignRepository.findByIdAndUser(campaignId, userId);
    if (!campaign) {
      throw new AppError('Produto nao encontrado', 404);
    }

    if (!campaign.imagePublicUrl) {
      throw new AppError('Imagem do produto e obrigatoria para gerar os frames', 422);
    }

    const campaignWithBaseImage =
      campaign.baseImagePublicUrl && campaign.baseImageStatus === FrameStatus.GENERATED
        ? campaign
        : await this.baseImageService.ensureBaseImageGenerated(userId, campaignId);

    const structuredScript = await this.scriptGenerator.generate(campaignWithBaseImage, titulo);
    this.validateThreeFrameStructure(structuredScript);

    const createdScript = await prisma.$transaction(async (tx) => {
      const script = await tx.videoScript.create({
        data: {
          campaignId: campaign.id,
          titulo: structuredScript.titulo,
          idioma: structuredScript.idioma,
          legendaFinal: structuredScript.legendaFinal,
          marketingScript: structuredScript.marketingScript,
          visualStyle: structuredScript.visualStyle,
          campaignTone: structuredScript.campaignTone,
          sceneDirection: structuredScript.sceneDirection,
          hashtags: structuredScript.hashtags,
          status: ScriptStatus.DRAFT
        }
      });

      await tx.scriptFrame.createMany({
        data: structuredScript.frames.map((frame) => ({
          scriptId: script.id,
          ordem: frame.ordem,
          objetivo: frame.objetivo,
          fala: frame.fala,
          promptVideo: frame.promptVideo,
          duracaoSegundos: frame.duracaoSegundos
        }))
      });

      await tx.videoScript.update({
        where: { id: script.id },
        data: { status: ScriptStatus.GENERATED }
      });

      await tx.campaign.update({
        where: { id: campaignWithBaseImage.id },
        data: { status: CampaignStatus.READY }
      });

      return script;
    });

    return createdScript;
  }

  async getScriptById(userId: string, scriptId: string) {
    const script = await this.scriptRepository.findByIdAndUser(scriptId, userId);
    if (!script) {
      throw new AppError('Roteiro nao encontrado', 404);
    }

    return script;
  }

  validateThreeFrameStructure(script: StructuredScriptDraft | { frames: Array<{ ordem: number; objetivo: string; duracaoSegundos: number }> }) {
    validateThreeFrameStructure(script.frames);
  }
}
