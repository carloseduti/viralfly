import { FrameStatus, PublicationStatus, ScriptStatus, VideoAssemblyStatus } from '@prisma/client';

import { BaseImageService } from '@/server/modules/campaigns/base-image.service';
import { FrameGenerationService } from '@/server/modules/frames/frame-generation.service';
import { PublicationService } from '@/server/modules/publications/publication.service';
import { ScriptService } from '@/server/modules/scripts/script.service';
import { VideoAssemblyService } from '@/server/modules/videos/video-assembly.service';
import { CampaignRepository } from '@/server/repositories/campaign.repository';
import { AppError } from '@/utils/errors';

export const PIPELINE_STEPS = ['base-image', 'script', 'frames', 'video', 'publication'] as const;

export type PipelineStepKey = (typeof PIPELINE_STEPS)[number];

type PipelineProgress = {
  campaignId: string;
  advanced: boolean;
  completed: boolean;
  stoppedAt?: PipelineStepKey;
  reason?: string;
};

export class PipelineOrchestratorService {
  constructor(
    private readonly campaignRepository = new CampaignRepository(),
    private readonly baseImageService = new BaseImageService(),
    private readonly scriptService = new ScriptService(),
    private readonly frameGenerationService = new FrameGenerationService(),
    private readonly videoAssemblyService = new VideoAssemblyService(),
    private readonly publicationService = new PublicationService()
  ) {}

  async startOrResume(userId: string, campaignId: string): Promise<PipelineProgress> {
    let advanced = false;

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const campaign = await this.campaignRepository.findByIdAndUser(campaignId, userId);
      if (!campaign) {
        throw new AppError('Produto nao encontrado', 404);
      }

      const script = campaign.scripts[0] ?? null;
      const video = script?.generatedVideo ?? null;
      const publication = video?.publication ?? null;

      if (campaign.gerarImagemBaseNanoBanana && campaign.baseImageStatus === FrameStatus.FAILED) {
        return { campaignId, advanced, completed: false, stoppedAt: 'base-image', reason: 'failed' };
      }

      if (script?.status === ScriptStatus.FAILED) {
        return { campaignId, advanced, completed: false, stoppedAt: 'script', reason: 'failed' };
      }

      if (script?.frames.some((frame) => frame.status === FrameStatus.FAILED || frame.generatedFrame?.status === FrameStatus.FAILED)) {
        return { campaignId, advanced, completed: false, stoppedAt: 'frames', reason: 'failed' };
      }

      if (video?.statusMontagem === VideoAssemblyStatus.FAILED) {
        return { campaignId, advanced, completed: false, stoppedAt: 'video', reason: 'failed' };
      }

      if (publication?.status === PublicationStatus.FAILED) {
        return { campaignId, advanced, completed: false, stoppedAt: 'publication', reason: 'failed' };
      }

      if (campaign.gerarImagemBaseNanoBanana && (campaign.baseImageStatus === FrameStatus.PENDING || !campaign.baseImagePublicUrl)) {
        await this.baseImageService.generateBaseImage(userId, campaignId, false);
        advanced = true;
        continue;
      }

      if (campaign.gerarImagemBaseNanoBanana && campaign.baseImageStatus === FrameStatus.PROCESSING) {
        return { campaignId, advanced, completed: false, stoppedAt: 'base-image', reason: 'processing' };
      }

      if (!script) {
        if (campaign.gerarRoteiroComIa) {
          const scriptResult = await this.scriptService.enqueueScriptGeneration(userId, campaignId, undefined, {
            forceRegenerate: false
          });
          if (scriptResult.processed) {
            advanced = true;
            continue;
          }

          return { campaignId, advanced: true, completed: false, stoppedAt: 'script', reason: 'queued' };
        }

        await this.scriptService.generateTemplateScriptForCampaign(userId, campaignId);
        advanced = true;
        continue;
      }

      const allFramesGenerated = script.frames.length > 0 && script.frames.every((frame) => frame.generatedFrame?.status === FrameStatus.GENERATED);
      const someFrameProcessing = script.frames.some(
        (frame) => frame.status === FrameStatus.PROCESSING || frame.generatedFrame?.status === FrameStatus.PROCESSING
      );

      if (!allFramesGenerated) {
        if (someFrameProcessing) {
          return { campaignId, advanced, completed: false, stoppedAt: 'frames', reason: 'processing' };
        }

        const frameResult = await this.frameGenerationService.enqueueFramesGeneration(userId, script.id, false);
        if (frameResult.processed) {
          advanced = true;
          continue;
        }

        return { campaignId, advanced: true, completed: false, stoppedAt: 'frames', reason: 'queued' };
      }

      if (!video || video.statusMontagem === VideoAssemblyStatus.PENDING) {
        const videoResult = await this.videoAssemblyService.assembleVideoFromScript(userId, script.id, false);
        if (videoResult.processed) {
          advanced = true;
          continue;
        }

        return { campaignId, advanced: true, completed: false, stoppedAt: 'video', reason: 'queued' };
      }

      if (video.statusMontagem === VideoAssemblyStatus.PROCESSING) {
        return { campaignId, advanced, completed: false, stoppedAt: 'video', reason: 'processing' };
      }

      if (!publication || publication.status === PublicationStatus.PENDING) {
        await this.publicationService.preparePublication(userId, video.id, 'PRIVATE');
        return { campaignId, advanced: true, completed: true, stoppedAt: 'publication', reason: 'prepared' };
      }

      return { campaignId, advanced, completed: publication.status === PublicationStatus.READY_TO_PUBLISH || publication.status === PublicationStatus.PUBLISHED };
    }

    return { campaignId, advanced, completed: false, reason: 'max-attempts' };
  }

  async retryFromStep(userId: string, campaignId: string, step: PipelineStepKey) {
    const campaign = await this.campaignRepository.findByIdAndUser(campaignId, userId);
    if (!campaign) {
      throw new AppError('Produto nao encontrado', 404);
    }

    const latestScript = campaign.scripts[0] ?? null;
    const latestVideo = latestScript?.generatedVideo ?? null;

    if (step === 'base-image') {
      await this.baseImageService.generateBaseImage(userId, campaignId, true);
      return this.startOrResume(userId, campaignId);
    }

    if (step === 'script') {
      if (campaign.gerarRoteiroComIa) {
        const result = await this.scriptService.enqueueScriptGeneration(userId, campaignId, undefined, { forceRegenerate: true });
        if (!result.processed) {
          return { campaignId, advanced: true, completed: false, stoppedAt: 'script', reason: 'queued' };
        }
      } else {
        await this.scriptService.generateTemplateScriptForCampaign(userId, campaignId);
      }
      return this.startOrResume(userId, campaignId);
    }

    if (step === 'frames') {
      if (!latestScript) {
        throw new AppError('Nao existe roteiro para reprocessar frames', 409);
      }
      const result = await this.frameGenerationService.enqueueFramesGeneration(userId, latestScript.id, true);
      if (!result.processed) {
        return { campaignId, advanced: true, completed: false, stoppedAt: 'frames', reason: 'queued' };
      }
      return this.startOrResume(userId, campaignId);
    }

    if (step === 'video') {
      if (!latestScript) {
        throw new AppError('Nao existe roteiro para montar video', 409);
      }
      const result = await this.videoAssemblyService.assembleVideoFromScript(userId, latestScript.id, true);
      if (!result.processed) {
        return { campaignId, advanced: true, completed: false, stoppedAt: 'video', reason: 'queued' };
      }
      return this.startOrResume(userId, campaignId);
    }

    if (step === 'publication') {
      if (!latestVideo) {
        throw new AppError('Nao existe video para preparar publicacao', 409);
      }
      await this.publicationService.preparePublication(userId, latestVideo.id, 'PRIVATE');
      return this.startOrResume(userId, campaignId);
    }

    throw new AppError('Step de pipeline invalido', 422);
  }
}
