import { FrameObjective, FrameStatus } from '@prisma/client';

import { env } from '@/lib/env';
import { prisma } from '@/lib/prisma';
import { veoClient } from '@/server/clients/veo';
import { selectFramesForGeneration } from '@/server/domain/three-frame-rules';
import type { FrameGenerationJob } from '@/server/jobs/constants';
import { enqueueFrameGenerationJob } from '@/server/jobs/producers';
import { FrameRepository } from '@/server/repositories/frame.repository';
import { ScriptRepository } from '@/server/repositories/script.repository';
import { StorageService } from '@/server/services/storage.service';
import { AppError } from '@/utils/errors';

type PromptCampaignContext = {
  nomeProduto: string;
  tipoProduto: string;
  visualStyle: string;
  campaignTone: string;
  sceneDirection: string;
  marketingScript: string;
  referenceImagePublicUrl: string;
};

type ProviderFrameCallbackPayload = {
  code?: number | string;
  msg?: string;
  data?: {
    taskId?: string;
    successFlag?: number | string;
    failReason?: string;
    resultUrls?: string[];
    info?: {
      resultUrls?: string[];
    };
    response?: {
      resultUrls?: string[];
    };
  };
};

export class FrameGenerationService {
  constructor(
    private readonly scriptRepository = new ScriptRepository(),
    private readonly frameRepository = new FrameRepository(),
    private readonly storageService = new StorageService()
  ) {}

  async enqueueFramesGeneration(userId: string, scriptId: string, forceRegenerate = false) {
    const script = await this.scriptRepository.findByIdAndUser(scriptId, userId);
    if (!script) {
      throw new AppError('Roteiro nao encontrado', 404);
    }

    const referenceImage = this.resolveReferenceImage(script.campaign);
    if (!referenceImage) {
      throw new AppError('Imagem de referencia do produto e obrigatoria para gerar os frames', 422);
    }

    if (!forceRegenerate && script.frames.some((frame) => frame.generatedFrame?.status === FrameStatus.PROCESSING)) {
      return { queued: false, processed: false, alreadyQueued: true };
    }

    const payload = {
      scriptId,
      userId,
      forceRegenerate
    } satisfies FrameGenerationJob;

    if (env.DISABLE_QUEUES) {
      await this.handleFrameGenerationJob(payload);
      return { queued: false, processed: true };
    }

    await enqueueFrameGenerationJob(payload);
    return { queued: true, processed: false };
  }

  async regenerateSingleFrame(userId: string, frameId: string) {
    const frame = await this.frameRepository.findByIdAndUser(frameId, userId);
    if (!frame) {
      throw new AppError('Frame nao encontrado', 404);
    }

    const payload = {
      scriptId: frame.scriptId,
      userId,
      frameId,
      forceRegenerate: true
    } satisfies FrameGenerationJob;

    if (env.DISABLE_QUEUES) {
      await this.handleFrameGenerationJob(payload);
      return { queued: false, processed: true };
    }

    await enqueueFrameGenerationJob(payload);
    return { queued: true, processed: false };
  }

  async handleFrameGenerationJob(payload: FrameGenerationJob) {
    const script = await this.scriptRepository.findByIdAndUser(payload.scriptId, payload.userId);
    if (!script) {
      throw new AppError('Roteiro nao encontrado', 404);
    }

    const referenceImage = this.resolveReferenceImage(script.campaign);
    if (!referenceImage) {
      throw new AppError('Imagem de referencia do produto e obrigatoria para gerar os frames', 422);
    }

    const frames = selectFramesForGeneration(script.frames, payload.frameId);
    if (frames.length === 0) {
      throw new AppError('Frame nao encontrado', 404);
    }

    for (const frame of frames) {
      if (!payload.forceRegenerate && frame.generatedFrame?.status === FrameStatus.GENERATED) {
        continue;
      }

      if (!payload.forceRegenerate && frame.generatedFrame?.status === FrameStatus.PROCESSING) {
        continue;
      }

      await this.processSingleFrame(
        script.campaign.userId,
        script.campaignId,
        script.id,
        frame.id,
        {
          nomeProduto: script.campaign.nomeProduto,
          tipoProduto: script.campaign.tipoProduto,
          visualStyle: script.visualStyle ?? script.campaign.estiloVisual,
          campaignTone: script.campaignTone ?? script.campaign.campaignTone,
          sceneDirection: script.sceneDirection ?? script.campaign.sceneDirection,
          marketingScript: script.marketingScript ?? '',
          referenceImagePublicUrl: referenceImage
        }
      );
    }
  }

  async getFrameById(userId: string, frameId: string) {
    const frame = await this.frameRepository.findByIdAndUser(frameId, userId);
    if (!frame) {
      throw new AppError('Frame nao encontrado', 404);
    }

    return frame;
  }

  async refreshFrameStatus(userId: string, frameId: string) {
    const frame = await this.frameRepository.findByIdAndUser(frameId, userId);
    if (!frame) {
      throw new AppError('Frame nao encontrado', 404);
    }

    if (!frame.generatedFrame?.externalJobId) {
      return frame;
    }

    if (frame.generatedFrame.status === FrameStatus.GENERATED || frame.generatedFrame.status === FrameStatus.FAILED) {
      return frame;
    }

    await this.syncFrameStatusWithProvider({
      frameId: frame.id,
      frameOrder: frame.ordem,
      scriptId: frame.scriptId,
      campaignId: frame.script.campaign.id,
      userId,
      externalJobId: frame.generatedFrame.externalJobId,
      promptSent: frame.generatedFrame.promptEnviado,
      tentativas: frame.generatedFrame.tentativas,
      durationSeconds: frame.duracaoSegundos
    });

    return this.getFrameById(userId, frameId);
  }

  async handleProviderCallback(payload: ProviderFrameCallbackPayload) {
    const taskId = payload.data?.taskId?.trim();
    if (!taskId) {
      throw new AppError('taskId do callback nao informado', 422);
    }

    const generatedFrame = await this.frameRepository.findGeneratedFrameByExternalJobId(taskId);
    if (!generatedFrame) {
      return { acknowledged: true, updated: false, reason: 'task-nao-encontrada' as const };
    }

    if (generatedFrame.status === FrameStatus.GENERATED) {
      return { acknowledged: true, updated: false, reason: 'ja-gerado' as const };
    }

    const resultUrl =
      payload.data?.info?.resultUrls?.[0] ?? payload.data?.response?.resultUrls?.[0] ?? payload.data?.resultUrls?.[0];
    const successFlag = Number(payload.data?.successFlag ?? 0);
    const callbackCode = Number(payload.code ?? 0);
    const isSuccess = successFlag === 1 || (!!resultUrl && (callbackCode === 200 || callbackCode === 0));

    if (isSuccess && resultUrl) {
      const scriptFrame = generatedFrame.scriptFrame;
      const script = scriptFrame.script;
      const campaign = script.campaign;
      const storagePath = `${campaign.userId}/${campaign.id}/${script.id}/frame-${scriptFrame.ordem}.mp4`;

      const assetBuffer = await veoClient.downloadGeneratedAsset(resultUrl);
      await this.storageService.upload('generated-frames', storagePath, assetBuffer, 'video/mp4');
      const publicUrl = this.storageService.getPublicUrl('generated-frames', storagePath);

      await this.frameRepository.upsertGeneratedFrame(scriptFrame.id, {
        scriptFrameId: scriptFrame.id,
        provider: generatedFrame.provider || veoClient.providerName,
        externalJobId: taskId,
        promptEnviado: generatedFrame.promptEnviado,
        status: FrameStatus.GENERATED,
        storagePath,
        publicUrl,
        duracaoGerada: scriptFrame.duracaoSegundos,
        erro: null,
        tentativas: Math.max(1, generatedFrame.tentativas)
      });
      await this.frameRepository.markFrameStatus(scriptFrame.id, FrameStatus.GENERATED);

      return {
        acknowledged: true,
        updated: true,
        status: 'GENERATED' as const,
        campaignId: campaign.id,
        userId: campaign.userId
      };
    }

    const errorMessage = payload.data?.failReason ?? payload.msg ?? 'Falha na geracao do frame reportada pelo callback';
    await this.frameRepository.upsertGeneratedFrame(generatedFrame.scriptFrameId, {
      scriptFrameId: generatedFrame.scriptFrameId,
      provider: generatedFrame.provider || veoClient.providerName,
      externalJobId: taskId,
      promptEnviado: generatedFrame.promptEnviado,
      status: FrameStatus.FAILED,
      erro: errorMessage,
      tentativas: Math.max(1, generatedFrame.tentativas)
    });
    await this.frameRepository.markFrameStatus(generatedFrame.scriptFrameId, FrameStatus.FAILED);

    return {
      acknowledged: true,
      updated: true,
      status: 'FAILED' as const,
      campaignId: generatedFrame.scriptFrame.script.campaign.id,
      userId: generatedFrame.scriptFrame.script.campaign.userId
    };
  }

  private async processSingleFrame(
    userId: string,
    campaignId: string,
    scriptId: string,
    frameId: string,
    campaign: PromptCampaignContext
  ) {
    const frame = await prisma.scriptFrame.findUnique({
      where: { id: frameId },
      include: { generatedFrame: true }
    });

    if (!frame) {
      throw new AppError('Frame nao encontrado', 404);
    }

    const finalPrompt = buildPromptForVeo(frame.objetivo, frame.fala, frame.promptVideo, campaign);

    await this.frameRepository.markFrameStatus(frame.id, FrameStatus.PROCESSING);
    const nextTentativas = (frame.generatedFrame?.tentativas ?? 0) + 1;

    try {
      const submit = await veoClient.submitFrameGeneration({
        prompt: finalPrompt,
        durationSeconds: frame.duracaoSegundos,
        aspectRatio: '9:16',
        format: 'mp4',
        referenceImageUrl: campaign.referenceImagePublicUrl
      });

      await this.frameRepository.upsertGeneratedFrame(frame.id, {
        scriptFrameId: frame.id,
        provider: veoClient.providerName,
        externalJobId: submit.externalJobId,
        promptEnviado: finalPrompt,
        status: FrameStatus.PROCESSING,
        tentativas: nextTentativas
      });

      await this.syncFrameStatusWithProvider({
        frameId: frame.id,
        frameOrder: frame.ordem,
        scriptId,
        campaignId,
        userId,
        externalJobId: submit.externalJobId,
        promptSent: finalPrompt,
        tentativas: nextTentativas,
        durationSeconds: frame.duracaoSegundos
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha na geracao do frame';

      await this.frameRepository.upsertGeneratedFrame(frame.id, {
        scriptFrameId: frame.id,
        provider: veoClient.providerName,
        externalJobId: frame.generatedFrame?.externalJobId,
        promptEnviado: finalPrompt,
        status: FrameStatus.FAILED,
        erro: message,
        tentativas: nextTentativas
      });
      await this.frameRepository.markFrameStatus(frame.id, FrameStatus.FAILED);

      throw new AppError(message, 502);
    }
  }

  private async syncFrameStatusWithProvider(payload: {
    frameId: string;
    frameOrder: number;
    scriptId: string;
    campaignId: string;
    userId: string;
    externalJobId: string;
    promptSent: string;
    tentativas: number;
    durationSeconds: number;
  }) {
    let providerStatus = await veoClient.getGenerationStatus(payload.externalJobId);

    for (let i = 0; i < 2 && providerStatus.status === 'PROCESSING'; i += 1) {
      await wait(250);
      providerStatus = await veoClient.getGenerationStatus(payload.externalJobId);
    }

    if (providerStatus.status === 'PROCESSING') {
      await this.frameRepository.upsertGeneratedFrame(payload.frameId, {
        scriptFrameId: payload.frameId,
        provider: veoClient.providerName,
        externalJobId: payload.externalJobId,
        promptEnviado: payload.promptSent,
        status: FrameStatus.PROCESSING,
        tentativas: payload.tentativas
      });
      await this.frameRepository.markFrameStatus(payload.frameId, FrameStatus.PROCESSING);
      return;
    }

    if (providerStatus.status !== 'SUCCEEDED' || !providerStatus.outputAssetUrl) {
      const error = providerStatus.error ?? 'Falha na geracao do frame';
      await this.frameRepository.upsertGeneratedFrame(payload.frameId, {
        scriptFrameId: payload.frameId,
        provider: veoClient.providerName,
        externalJobId: payload.externalJobId,
        promptEnviado: payload.promptSent,
        status: FrameStatus.FAILED,
        erro: error,
        tentativas: payload.tentativas
      });

      await this.frameRepository.markFrameStatus(payload.frameId, FrameStatus.FAILED);
      throw new AppError(error, 502);
    }

    const assetBuffer = await veoClient.downloadGeneratedAsset(providerStatus.outputAssetUrl);
    const storagePath = `${payload.userId}/${payload.campaignId}/${payload.scriptId}/frame-${payload.frameOrder}.mp4`;

    await this.storageService.upload('generated-frames', storagePath, assetBuffer, 'video/mp4');
    const publicUrl = this.storageService.getPublicUrl('generated-frames', storagePath);

    await this.frameRepository.upsertGeneratedFrame(payload.frameId, {
      scriptFrameId: payload.frameId,
      provider: veoClient.providerName,
      externalJobId: payload.externalJobId,
      promptEnviado: payload.promptSent,
      status: FrameStatus.GENERATED,
      storagePath,
      publicUrl,
      duracaoGerada: payload.durationSeconds,
      erro: null,
      tentativas: payload.tentativas
    });

    await this.frameRepository.markFrameStatus(payload.frameId, FrameStatus.GENERATED);
  }

  private resolveReferenceImage(campaign: {
    imagePublicUrl: string | null;
    baseImagePublicUrl: string | null;
    baseImageStatus: FrameStatus;
    gerarImagemBaseNanoBanana?: boolean;
  }) {
    return resolveReferenceImageFromCampaign(campaign);
  }
}

function resolveReferenceImageFromCampaign(campaign: {
  imagePublicUrl: string | null;
  baseImagePublicUrl: string | null;
  baseImageStatus: FrameStatus;
  gerarImagemBaseNanoBanana?: boolean;
}) {
  if (campaign.gerarImagemBaseNanoBanana ?? true) {
    if (campaign.baseImagePublicUrl && campaign.baseImageStatus === FrameStatus.GENERATED) {
      return campaign.baseImagePublicUrl;
    }

    return null;
  }

  return campaign.baseImagePublicUrl ?? campaign.imagePublicUrl;
}

function buildPromptForVeo(
  objetivo: FrameObjective,
  fala: string,
  promptVideo: string,
  campaign: PromptCampaignContext
) {
  const objectiveInstructionByFrame: Record<FrameObjective, string> = {
    HOOK: 'Objetivo do frame: hook agressivo para capturar atencao nos primeiros segundos.',
    BENEFICIO: 'Objetivo do frame: apresentar beneficios praticos e diferencial do produto.',
    CTA: 'Objetivo do frame: fechamento com CTA, urgencia e escassez.'
  };

  return [
    `Produto principal: ${campaign.nomeProduto} (${campaign.tipoProduto}).`,
    `Referencia visual obrigatoria: ${campaign.referenceImagePublicUrl}.`,
    `Roteiro mestre unico: ${campaign.marketingScript}.`,
    `Tom unico da campanha: ${campaign.campaignTone}.`,
    `Direcao narrativa entre cenas: ${campaign.sceneDirection}.`,
    'Preserve identidade visual, formato, cor e caracteristicas essenciais do produto.',
    'Nao descaracterizar o produto nem alterar marca, design ou proporcoes.',
    'Nao mudar drasticamente fundo, linguagem ou posicionamento entre frames.',
    'Cada frame deve parecer continuacao natural do frame anterior.',
    'Conteudo visual deve mostrar exclusivamente o produto como foco principal do anuncio.',
    'Nao incluir banners, legendas, pop-ups, textos na tela, precos, tarjas ou elementos graficos promocionais.',
    'A comunicacao deve acontecer por narracao/voz de apresentacao (voice-over), sem texto sobreposto.',
    `Estilo visual geral fixo: ${campaign.visualStyle}.`,
    objectiveInstructionByFrame[objetivo],
    `Fala comercial do frame: ${fala}`,
    `Direcao visual adicional: ${promptVideo}`,
    'Formato final: video vertical 9:16 para anuncio curto.'
  ].join(' ');
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

