import { extname } from 'node:path';

import { FrameStatus } from '@prisma/client';

import { env } from '@/lib/env';
import { nanoBananaClient } from '@/server/clients/nano-banana';
import { CampaignRepository } from '@/server/repositories/campaign.repository';
import { StorageService } from '@/server/services/storage.service';
import { AppError } from '@/utils/errors';

type NanoBananaCallbackPayload = {
  code?: number | string;
  msg?: string;
  data?: {
    taskId?: string;
    state?: string;
    failMsg?: string;
    resultJson?: string | { resultUrls?: string[] };
  };
};

export class BaseImageService {
  constructor(
    private readonly campaignRepository = new CampaignRepository(),
    private readonly storageService = new StorageService()
  ) {}

  async generateBaseImage(userId: string, campaignId: string, forceRegenerate = false) {
    const campaign = await this.campaignRepository.findByIdAndUser(campaignId, userId);
    if (!campaign) {
      throw new AppError('Produto nao encontrado', 404);
    }

    if (!campaign.imagePublicUrl) {
      throw new AppError('Imagem do produto e obrigatoria para gerar imagem base', 422);
    }

    if (!forceRegenerate && campaign.baseImageStatus === FrameStatus.GENERATED && campaign.baseImagePublicUrl) {
      return campaign;
    }

    await this.campaignRepository.updateByIdAndUser(campaignId, userId, {
      baseImageStatus: FrameStatus.PROCESSING,
      baseImageError: null
    });

    try {
      const submit = await nanoBananaClient.submitBaseImageGeneration({
        prompt: buildNanoPrompt(campaign.nomeProduto, campaign.tipoProduto, campaign.estiloVisual, campaign.campaignTone),
        referenceImageUrl: campaign.imagePublicUrl,
        model: env.NANO_BANANA_MODEL ?? 'nano-banana-2',
        callBackUrl: env.NANO_BANANA_CALLBACK_URL,
        visualStyle: campaign.estiloVisual,
        campaignTone: campaign.campaignTone,
        sceneDirection: campaign.sceneDirection
      });

      await this.campaignRepository.updateByIdAndUser(campaignId, userId, {
        baseImageProvider: nanoBananaClient.providerName,
        baseImageExternalJobId: submit.externalJobId,
        baseImageStatus: FrameStatus.PROCESSING
      });

      let outputImageUrl = submit.outputImageUrl;
      if (!outputImageUrl) {
        let status = await nanoBananaClient.getGenerationStatus(submit.externalJobId);
        for (let attempt = 0; attempt < 3 && status.status === 'PROCESSING'; attempt += 1) {
          await wait(300);
          status = await nanoBananaClient.getGenerationStatus(submit.externalJobId);
        }

        if (status.status === 'FAILED') {
          throw new AppError(status.error ?? 'Falha ao gerar imagem base com Nano Banana', 502);
        }

        if (status.status !== 'SUCCEEDED' || !status.outputImageUrl) {
          const processingCampaign = await this.campaignRepository.updateByIdAndUser(campaignId, userId, {
            baseImageStatus: FrameStatus.PROCESSING
          });
          if (!processingCampaign) {
            throw new AppError('Produto nao encontrado', 404);
          }
          return processingCampaign;
        }

        outputImageUrl = status.outputImageUrl;
      }

      return this.persistBaseImageResult(campaignId, userId, outputImageUrl, submit.externalJobId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao gerar imagem base com Nano Banana';

      await this.campaignRepository.updateByIdAndUser(campaignId, userId, {
        baseImageStatus: FrameStatus.FAILED,
        baseImageError: message
      });

      throw new AppError(message, 502);
    }
  }

  async ensureBaseImageGenerated(userId: string, campaignId: string) {
    const campaign = await this.generateBaseImage(userId, campaignId, false);
    if (campaign.baseImageStatus !== FrameStatus.GENERATED || !campaign.baseImagePublicUrl) {
      throw new AppError('Imagem base publicitaria ainda em processamento. Tente novamente em instantes.', 409);
    }

    return campaign;
  }

  async refreshBaseImageStatus(userId: string, campaignId: string) {
    const campaign = await this.campaignRepository.findByIdAndUser(campaignId, userId);
    if (!campaign) {
      throw new AppError('Produto nao encontrado', 404);
    }

    if (campaign.baseImageStatus === FrameStatus.GENERATED && campaign.baseImagePublicUrl) {
      return campaign;
    }

    const taskId = campaign.baseImageExternalJobId;
    if (!taskId) {
      throw new AppError('Tarefa da imagem base ainda nao foi iniciada para este produto', 422);
    }

    const status = await nanoBananaClient.getGenerationStatus(taskId);

    if (status.status === 'PROCESSING') {
      const updated = await this.campaignRepository.updateByIdAndUser(campaignId, userId, {
        baseImageStatus: FrameStatus.PROCESSING,
        baseImageError: null
      });
      if (!updated) {
        throw new AppError('Produto nao encontrado', 404);
      }
      return updated;
    }

    if (status.status === 'FAILED') {
      const updated = await this.campaignRepository.updateByIdAndUser(campaignId, userId, {
        baseImageStatus: FrameStatus.FAILED,
        baseImageError: status.error ?? 'Falha na geracao da imagem base'
      });
      if (!updated) {
        throw new AppError('Produto nao encontrado', 404);
      }
      return updated;
    }

    if (!status.outputImageUrl) {
      const updated = await this.campaignRepository.updateByIdAndUser(campaignId, userId, {
        baseImageStatus: FrameStatus.FAILED,
        baseImageError: 'Tarefa concluida sem URL da imagem base'
      });
      if (!updated) {
        throw new AppError('Produto nao encontrado', 404);
      }
      return updated;
    }

    return this.persistBaseImageResult(campaignId, userId, status.outputImageUrl, taskId);
  }

  async handleProviderCallback(payload: NanoBananaCallbackPayload) {
    const taskId = payload.data?.taskId?.trim();
    if (!taskId) {
      throw new AppError('taskId do callback da imagem base nao informado', 422);
    }

    const campaign = await this.campaignRepository.findByBaseImageExternalJobId(taskId);
    if (!campaign) {
      return { acknowledged: true, updated: false, reason: 'task-nao-encontrada' as const };
    }

    const callbackCode = Number(payload.code ?? 0);
    const state = (payload.data?.state ?? '').toLowerCase();
    const resultJson = parseCallbackResultJson(payload.data?.resultJson);
    const resultUrl = resultJson?.resultUrls?.[0];
    const isSuccess = state === 'success' || (!!resultUrl && (callbackCode === 200 || callbackCode === 0));

    if (isSuccess && resultUrl) {
      await this.persistBaseImageResult(campaign.id, campaign.userId, resultUrl, taskId);
      return { acknowledged: true, updated: true, status: 'GENERATED' as const };
    }

    const errorMessage = payload.data?.failMsg ?? payload.msg ?? 'Falha na geracao da imagem base';
    await this.campaignRepository.updateByIdAndUser(campaign.id, campaign.userId, {
      baseImageStatus: FrameStatus.FAILED,
      baseImageError: errorMessage
    });

    return { acknowledged: true, updated: true, status: 'FAILED' as const };
  }

  private async persistBaseImageResult(campaignId: string, userId: string, outputImageUrl: string, taskId: string) {
    const imageBuffer = await nanoBananaClient.downloadGeneratedAsset(outputImageUrl);
    const extension = resolveOutputImageExtension(outputImageUrl);
    const storagePath = `product-images/${userId}/${campaignId}/base-image.${extension}`;
    const mimeType = extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : 'image/jpeg';

    await this.storageService.upload('product-images', storagePath, imageBuffer, mimeType);
    const publicUrl = this.storageService.getPublicUrl('product-images', storagePath);

    const updatedCampaign = await this.campaignRepository.updateByIdAndUser(campaignId, userId, {
      baseImageStatus: FrameStatus.GENERATED,
      baseImageStoragePath: storagePath,
      baseImagePublicUrl: publicUrl,
      baseImageProvider: nanoBananaClient.providerName,
      baseImageExternalJobId: taskId,
      baseImageError: null
    });

    if (!updatedCampaign) {
      throw new AppError('Produto nao encontrado', 404);
    }

    return updatedCampaign;
  }
}

function buildNanoPrompt(nomeProduto: string, tipoProduto: string, estiloVisual: string, campaignTone: string) {
  return [
    `Crie uma imagem base publicitaria para ${nomeProduto} (${tipoProduto}).`,
    `Estilo visual fixo: ${estiloVisual}.`,
    `Tom comercial: ${campaignTone}.`,
    'Preserve 100% a identidade visual do produto original.',
    'A imagem deve servir como referencia unica para todas as cenas do mesmo anuncio.',
    'Composicao deve apresentar exclusivamente o produto como elemento principal.',
    'Proibido inserir banners, legendas, pop-ups, textos sobrepostos, precos ou selos promocionais.'
  ].join(' ');
}

function resolveOutputImageExtension(assetUrl: string) {
  const pathname = safePathname(assetUrl);
  const ext = extname(pathname).toLowerCase().replace('.', '');

  if (ext === 'png' || ext === 'webp' || ext === 'jpg' || ext === 'jpeg') {
    return ext === 'jpeg' ? 'jpg' : ext;
  }

  return 'jpg';
}

function safePathname(urlOrPath: string) {
  try {
    return new URL(urlOrPath).pathname;
  } catch {
    return urlOrPath;
  }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseCallbackResultJson(resultJson: string | { resultUrls?: string[] } | undefined) {
  if (!resultJson) {
    return null;
  }

  if (typeof resultJson === 'object') {
    return resultJson;
  }

  try {
    return JSON.parse(resultJson) as { resultUrls?: string[] };
  } catch {
    return null;
  }
}
