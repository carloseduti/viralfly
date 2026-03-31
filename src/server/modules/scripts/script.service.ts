import { CampaignStatus, FrameStatus, PublicationStatus, ScriptStatus, VideoAssemblyStatus } from '@prisma/client';

import { env } from '@/lib/env';
import { prisma } from '@/lib/prisma';
import type { StructuredScriptDraft } from '@/server/domain/types';
import { validateThreeFrameStructure } from '@/server/domain/three-frame-rules';
import type { ScriptGenerationJob } from '@/server/jobs/constants';
import { enqueueScriptGenerationJob } from '@/server/jobs/producers';
import { BaseImageService } from '@/server/modules/campaigns/base-image.service';
import { CampaignRepository } from '@/server/repositories/campaign.repository';
import { ScriptRepository } from '@/server/repositories/script.repository';
import {
  MockScriptGeneratorService,
  scriptGeneratorService,
  type ScriptGeneratorService
} from '@/server/services/script-generator.service';
import { AppError } from '@/utils/errors';

type ScriptGenerationOptions = {
  forceRegenerate?: boolean;
};

type UpdateScriptContentInput = {
  marketingScript: string;
  frames: Array<{
    id: string;
    fala: string;
    promptVideo: string;
  }>;
};

export class ScriptService {
  constructor(
    private readonly campaignRepository = new CampaignRepository(),
    private readonly scriptRepository = new ScriptRepository(),
    private readonly baseImageService = new BaseImageService(),
    private readonly scriptGenerator: ScriptGeneratorService = scriptGeneratorService,
    private readonly fallbackGenerator: ScriptGeneratorService = new MockScriptGeneratorService()
  ) {}

  async enqueueScriptGeneration(userId: string, campaignId: string, titulo?: string, options: ScriptGenerationOptions = {}) {
    const campaign = await this.campaignRepository.findByIdAndUser(campaignId, userId);
    if (!campaign) {
      throw new AppError('Produto nao encontrado', 404);
    }

    if (!campaign.imagePublicUrl) {
      throw new AppError('Imagem do produto e obrigatoria para gerar os frames', 422);
    }

    const latestScript = await this.scriptRepository.findLatestByCampaign(campaignId, userId);

    if (!options.forceRegenerate) {
      if (latestScript?.status === ScriptStatus.GENERATED) {
        return { queued: false, processed: false, alreadyGenerated: true, scriptId: latestScript.id };
      }

      if (latestScript?.status === ScriptStatus.DRAFT) {
        return { queued: false, processed: false, alreadyQueued: true, scriptId: latestScript.id };
      }
    }

    if (!campaign.gerarRoteiroComIa) {
      await this.generateTemplateScriptForCampaign(userId, campaignId, titulo);
      return { queued: false, processed: true };
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

  async generateTemplateScriptForCampaign(userId: string, campaignId: string, titulo?: string) {
    return this.generateScriptForCampaign(userId, campaignId, titulo, this.fallbackGenerator);
  }

  async generateScriptForCampaign(
    userId: string,
    campaignId: string,
    titulo?: string,
    generator: ScriptGeneratorService = this.scriptGenerator
  ) {
    const campaign = await this.campaignRepository.findByIdAndUser(campaignId, userId);
    if (!campaign) {
      throw new AppError('Produto nao encontrado', 404);
    }

    if (!campaign.imagePublicUrl) {
      throw new AppError('Imagem do produto e obrigatoria para gerar os frames', 422);
    }

    const campaignWithReference =
      campaign.baseImagePublicUrl && campaign.baseImageStatus === FrameStatus.GENERATED
        ? campaign
        : campaign.gerarImagemBaseNanoBanana
          ? await this.baseImageService.ensureBaseImageGenerated(userId, campaignId)
          : campaign;

    const structuredScript = await generator.generate(campaignWithReference, titulo);
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
        where: { id: campaignWithReference.id },
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

  async updateScriptContent(userId: string, scriptId: string, input: UpdateScriptContentInput) {
    const script = await this.scriptRepository.findByIdAndUser(scriptId, userId);
    if (!script) {
      throw new AppError('Roteiro nao encontrado', 404);
    }

    if (!input.frames.length) {
      throw new AppError('Nenhum frame enviado para atualizacao', 422);
    }

    const frameIds = new Set(script.frames.map((frame) => frame.id));
    for (const frameInput of input.frames) {
      if (!frameIds.has(frameInput.id)) {
        throw new AppError('Frame invalido para este roteiro', 422);
      }
    }

    const invalidationMessage = 'Roteiro atualizado. Regenere frames e video para refletir as alteracoes.';

    await prisma.$transaction(async (tx) => {
      await tx.videoScript.update({
        where: { id: script.id },
        data: {
          marketingScript: input.marketingScript.trim(),
          status: ScriptStatus.GENERATED
        }
      });

      for (const frameInput of input.frames) {
        await tx.scriptFrame.update({
          where: { id: frameInput.id },
          data: {
            fala: frameInput.fala.trim(),
            promptVideo: frameInput.promptVideo.trim(),
            status: FrameStatus.PENDING
          }
        });
      }

      await tx.generatedFrame.updateMany({
        where: {
          scriptFrame: {
            scriptId: script.id
          }
        },
        data: {
          status: FrameStatus.PENDING,
          storagePath: null,
          publicUrl: null,
          duracaoGerada: null,
          erro: invalidationMessage
        }
      });

      if (script.generatedVideo) {
        await tx.generatedVideo.update({
          where: { id: script.generatedVideo.id },
          data: {
            statusMontagem: VideoAssemblyStatus.PENDING,
            storagePath: null,
            publicUrl: null,
            thumbnailPath: null,
            thumbnailUrl: null,
            duracaoTotal: null,
            erro: invalidationMessage
          }
        });

        if (script.generatedVideo.publication) {
          await tx.tikTokPublication.update({
            where: { id: script.generatedVideo.publication.id },
            data: {
              status: PublicationStatus.PENDING,
              providerPostId: null,
              erro: invalidationMessage
            }
          });
        }
      }
    });

    return this.getScriptById(userId, scriptId);
  }

  validateThreeFrameStructure(script: StructuredScriptDraft | { frames: Array<{ ordem: number; objetivo: string; duracaoSegundos: number }> }) {
    validateThreeFrameStructure(script.frames);
  }
}

