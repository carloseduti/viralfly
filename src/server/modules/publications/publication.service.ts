import { PublicationStatus } from '@prisma/client';

import { env } from '@/lib/env';
import { tiktokClient } from '@/server/clients/tiktok';
import type { TikTokPublicationJob } from '@/server/jobs/constants';
import { enqueueTikTokPublicationJob } from '@/server/jobs/producers';
import { PublicationRepository } from '@/server/repositories/publication.repository';
import { VideoRepository } from '@/server/repositories/video.repository';
import { CaptionHashtagService } from '@/server/services/caption-hashtag.service';
import { StorageService } from '@/server/services/storage.service';
import { AppError } from '@/utils/errors';

export class PublicationService {
  constructor(
    private readonly videoRepository = new VideoRepository(),
    private readonly publicationRepository = new PublicationRepository(),
    private readonly captionService = new CaptionHashtagService(),
    private readonly storageService = new StorageService()
  ) {}

  async preparePublication(userId: string, videoId: string, modoVisibilidade: 'PRIVATE' | 'PUBLIC' | 'FOLLOWERS') {
    const video = await this.videoRepository.findByIdAndUser(videoId, userId);
    if (!video) {
      throw new AppError('Vídeo não encontrado', 404);
    }

    if (video.statusMontagem !== 'GENERATED' || !video.storagePath) {
      throw new AppError('Não publicar sem vídeo final gerado', 422);
    }

    const ctaFrame = video.script.frames.find((frame) => frame.ordem === 3);
    const meta = this.captionService.buildCaptionAndHashtags({
      titulo: video.script.titulo,
      falaCTA: ctaFrame?.fala ?? 'Confira agora.',
      hashtagsBase: video.script.hashtags
    });

    return this.publicationRepository.upsertByVideo(video.id, {
      generatedVideoId: video.id,
      legendaPublicacao: meta.legenda,
      hashtagsPublicacao: meta.hashtags,
      modoVisibilidade,
      status: PublicationStatus.READY_TO_PUBLISH
    });
  }

  async publishToTikTok(userId: string, publicationId: string) {
    const publication = await this.publicationRepository.findByIdAndUser(publicationId, userId);
    if (!publication) {
      throw new AppError('Publicação não encontrada', 404);
    }

    if (!['READY_TO_PUBLISH', 'FAILED'].includes(publication.status)) {
      throw new AppError('Publicação ainda não está pronta para envio', 422);
    }

    const payload = { publicationId, userId } satisfies TikTokPublicationJob;

    if (env.DISABLE_QUEUES) {
      await this.handlePublicationJob(payload);
      return { queued: false, processed: true };
    }

    await enqueueTikTokPublicationJob(payload);
    return { queued: true, processed: false };
  }

  async handlePublicationJob(payload: TikTokPublicationJob) {
    const publication = await this.publicationRepository.findByIdAndUser(payload.publicationId, payload.userId);
    if (!publication) {
      throw new AppError('Publicação não encontrada', 404);
    }

    const videoPath = publication.generatedVideo.storagePath;
    if (!videoPath) {
      throw new AppError('Vídeo final ausente para publicação', 422);
    }

    await this.publicationRepository.updateStatus(publication.id, PublicationStatus.PROCESSING, { erro: null });

    try {
      const creatorInfo = await tiktokClient.queryCreatorInfo();
      const initialized = await tiktokClient.initializePost({
        caption: `${publication.legendaPublicacao} ${publication.hashtagsPublicacao.join(' ')}`,
        visibility: publication.modoVisibilidade as 'PRIVATE' | 'PUBLIC' | 'FOLLOWERS'
      });

      const media = await this.storageService.download('generated-videos', videoPath);
      await tiktokClient.uploadMedia(initialized.uploadUrl, media);

      let status = await tiktokClient.getPostStatus(initialized.publishId);
      if (status.status === 'PROCESSING') {
        await wait(300);
        status = await tiktokClient.getPostStatus(initialized.publishId);
      }

      if (status.status !== 'PUBLISHED') {
        throw new AppError(status.error ?? 'Falha ao iniciar publicação no TikTok', 500);
      }

      await this.publicationRepository.updateStatus(publication.id, PublicationStatus.PUBLISHED, {
        providerPostId: initialized.publishId,
        creatorTikTokId: creatorInfo.creatorId,
        erro: null
      });
    } catch (error) {
      await this.publicationRepository.updateStatus(publication.id, PublicationStatus.FAILED, {
        erro: error instanceof Error ? error.message : 'Falha ao iniciar publicação no TikTok'
      });
      throw error;
    }
  }

  async getPublicationById(userId: string, publicationId: string) {
    const publication = await this.publicationRepository.findByIdAndUser(publicationId, userId);
    if (!publication) {
      throw new AppError('Publicação não encontrada', 404);
    }

    return publication;
  }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
