import { readFile } from 'node:fs/promises';

import { VideoAssemblyStatus } from '@prisma/client';

import { env } from '@/lib/env';
import { ensureFramesGeneratedForAssembly } from '@/server/domain/three-frame-rules';
import { VideoAssemblerService } from '@/server/ffmpeg/video-assembler.service';
import type { VideoAssemblyJob } from '@/server/jobs/constants';
import { enqueueVideoAssemblyJob } from '@/server/jobs/producers';
import { ScriptRepository } from '@/server/repositories/script.repository';
import { VideoRepository } from '@/server/repositories/video.repository';
import { StorageService } from '@/server/services/storage.service';
import { AppError } from '@/utils/errors';

export class VideoAssemblyService {
  constructor(
    private readonly scriptRepository = new ScriptRepository(),
    private readonly videoRepository = new VideoRepository(),
    private readonly storageService = new StorageService(),
    private readonly assembler = new VideoAssemblerService()
  ) {}

  async assembleVideoFromScript(userId: string, scriptId: string, forceRemount = false) {
    const script = await this.scriptRepository.findByIdAndUser(scriptId, userId);
    if (!script) {
      throw new AppError('Roteiro nao encontrado', 404);
    }

    if (!script.campaign.baseImagePublicUrl) {
      throw new AppError('Produto nao encontrado', 404);
    }

    if (!forceRemount && script.generatedVideo?.statusMontagem === VideoAssemblyStatus.PROCESSING) {
      return { queued: false, processed: false, alreadyQueued: true };
    }

    if (!forceRemount && script.generatedVideo?.statusMontagem === VideoAssemblyStatus.GENERATED) {
      return { queued: false, processed: false, alreadyGenerated: true, videoId: script.generatedVideo.id };
    }

    ensureFramesGeneratedForAssembly(script.frames);

    await this.videoRepository.upsertByScript(script.id, {
      scriptId: script.id,
      statusMontagem: VideoAssemblyStatus.PENDING
    });

    const payload = { scriptId, userId } satisfies VideoAssemblyJob;

    if (env.DISABLE_QUEUES) {
      await this.handleAssemblyJob(payload);
      return { queued: false, processed: true };
    }

    await enqueueVideoAssemblyJob(payload);
    return { queued: true, processed: false };
  }

  async handleAssemblyJob(payload: VideoAssemblyJob) {
    const script = await this.scriptRepository.findByIdAndUser(payload.scriptId, payload.userId);
    if (!script) {
      throw new AppError('Roteiro nao encontrado', 404);
    }

    if (!script.campaign.baseImagePublicUrl) {
      throw new AppError('Produto nao encontrado', 404);
    }

    ensureFramesGeneratedForAssembly(script.frames);

    const generatedVideo = await this.videoRepository.upsertByScript(script.id, {
      scriptId: script.id,
      statusMontagem: VideoAssemblyStatus.PROCESSING
    });

    try {
      const orderedFrames = [...script.frames].sort((a, b) => a.ordem - b.ordem);

      const frameBuffers = await Promise.all(
        orderedFrames.map((frame) => {
          if (!frame.generatedFrame?.storagePath) {
            throw new AppError(`Frame ${frame.ordem} ainda nao foi gerado`, 422);
          }

          return this.storageService.download('generated-frames', frame.generatedFrame.storagePath);
        })
      );

      const assembled = await this.assembler.assembleClips(frameBuffers);
      const finalVideoBuffer = await readFile(assembled.outputVideoPath);
      const thumbnailBuffer = await readFile(assembled.thumbnailPath);

      const finalVideoPath = `${payload.userId}/${script.campaignId}/${script.id}/final-video.mp4`;
      const thumbnailPath = `${payload.userId}/${script.campaignId}/${script.id}/thumb.jpg`;

      await this.storageService.upload('generated-videos', finalVideoPath, finalVideoBuffer, 'video/mp4');
      await this.storageService.upload('thumbnails', thumbnailPath, thumbnailBuffer, 'image/jpeg');

      await this.videoRepository.upsertByScript(script.id, {
        scriptId: script.id,
        statusMontagem: VideoAssemblyStatus.GENERATED,
        storagePath: finalVideoPath,
        publicUrl: this.storageService.getPublicUrl('generated-videos', finalVideoPath),
        thumbnailPath,
        thumbnailUrl: this.storageService.getPublicUrl('thumbnails', thumbnailPath),
        duracaoTotal: assembled.estimatedDurationSeconds,
        erro: null
      });
    } catch (error) {
      await this.videoRepository.updateStatus(
        generatedVideo.id,
        VideoAssemblyStatus.FAILED,
        error instanceof Error ? error.message : 'Falha na montagem do video'
      );
      throw error;
    }
  }

  async getVideoById(userId: string, videoId: string) {
    const video = await this.videoRepository.findByIdAndUser(videoId, userId);
    if (!video) {
      throw new AppError('Video nao encontrado', 404);
    }

    return video;
  }
}
