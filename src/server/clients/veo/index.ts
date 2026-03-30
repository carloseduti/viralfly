import { randomUUID } from 'node:crypto';

import { env } from '@/lib/env';
import type { VeoGenerationRequest, VeoStatusResponse, VeoSubmitResponse } from '@/server/clients/veo/types';

export interface VeoClient {
  readonly providerName: string;
  submitFrameGeneration(payload: VeoGenerationRequest): Promise<VeoSubmitResponse>;
  getGenerationStatus(externalJobId: string): Promise<VeoStatusResponse>;
  downloadGeneratedAsset(assetUrl: string): Promise<Buffer>;
}

export class MockVeoClient implements VeoClient {
  readonly providerName = 'veo-mock';

  private readonly jobMap = new Map<string, { payload: VeoGenerationRequest; createdAt: number }>();

  async submitFrameGeneration(payload: VeoGenerationRequest): Promise<VeoSubmitResponse> {
    const externalJobId = `veo-${randomUUID()}`;
    this.jobMap.set(externalJobId, { payload, createdAt: Date.now() });
    return { externalJobId, status: 'QUEUED' };
  }

  async getGenerationStatus(externalJobId: string): Promise<VeoStatusResponse> {
    const job = this.jobMap.get(externalJobId);
    if (!job) {
      return { externalJobId, status: 'FAILED', error: 'Job não encontrado no provider Veo mock.' };
    }

    const elapsed = Date.now() - job.createdAt;
    if (elapsed < 500) {
      return { externalJobId, status: 'PROCESSING' };
    }

    return {
      externalJobId,
      status: 'SUCCEEDED',
      outputAssetUrl: `mock://veo/${externalJobId}.mp4`
    };
  }

  async downloadGeneratedAsset(assetUrl: string): Promise<Buffer> {
    const marker = `MOCK_VIDEO_CONTENT:${assetUrl}`;
    return Buffer.from(marker, 'utf-8');
  }
}

type KieGenerateResponse = {
  code?: number;
  msg?: string;
  taskId?: string;
  data?: {
    taskId?: string;
  };
};

type KieRecordInfoResponse = {
  code?: number;
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

export class KieAIVeoClient implements VeoClient {
  readonly providerName = 'kie-ai-veo-3.1';

  private readonly apiBaseUrl = (env.KIE_AI_API_BASE_URL ?? 'https://api.kie.ai').replace(/\/+$/, '');
  private readonly apiKey = env.KIE_AI_API_KEY;
  private readonly model = env.KIE_AI_MODEL ?? 'veo3';
  private readonly callBackUrl = env.KIE_AI_CALLBACK_URL;

  async submitFrameGeneration(payload: VeoGenerationRequest): Promise<VeoSubmitResponse> {
    if (!this.apiKey) {
      throw new Error('KIE_AI_API_KEY nao configurada. Defina no .env para usar geracao real via Kie.ai.');
    }

    if (!payload.referenceImageUrl) {
      throw new Error('Imagem de referencia do produto obrigatoria para gerar video na Kie.ai.');
    }

    const requestBody = {
      prompt: payload.prompt,
      imageUrls: [payload.referenceImageUrl],
      model: this.model,
      callBackUrl: this.callBackUrl,
      aspect_ratio: payload.aspectRatio,
      generationType: 'REFERENCE_2_VIDEO',
      enableTranslation: true,
      enableFallback: true
    };

    const response = await fetch(`${this.apiBaseUrl}/api/v1/veo/generate`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(requestBody)
    });
    const body = await parseJson<KieGenerateResponse>(response);

    if (!response.ok || (body.code !== undefined && body.code >= 400)) {
      throw new Error(extractKieError(body.msg, 'Falha ao criar tarefa de video na Kie.ai.'));
    }

    const taskId = body.data?.taskId ?? body.taskId;
    if (!taskId) {
      throw new Error('Resposta invalida da Kie.ai: taskId ausente.');
    }

    return {
      externalJobId: taskId,
      status: 'QUEUED'
    };
  }

  async getGenerationStatus(externalJobId: string): Promise<VeoStatusResponse> {
    if (!this.apiKey) {
      throw new Error('KIE_AI_API_KEY nao configurada. Defina no .env para usar geracao real via Kie.ai.');
    }

    const statusUrl = new URL(`${this.apiBaseUrl}/api/v1/veo/record-info`);
    statusUrl.searchParams.set('taskId', externalJobId);

    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: this.buildHeaders()
    });
    const body = await parseJson<KieRecordInfoResponse>(response);

    if (!response.ok || (body.code !== undefined && body.code >= 400)) {
      return {
        externalJobId,
        status: 'FAILED',
        error: extractKieError(body.msg, 'Falha ao consultar status da tarefa na Kie.ai.')
      };
    }

    const successFlag = Number(body.data?.successFlag ?? 0);
    if (successFlag === 1) {
      const outputAssetUrl = body.data?.info?.resultUrls?.[0] ?? body.data?.response?.resultUrls?.[0] ?? body.data?.resultUrls?.[0];
      return {
        externalJobId,
        status: 'SUCCEEDED',
        outputAssetUrl
      };
    }

    if (successFlag === 2 || successFlag === 3) {
      return {
        externalJobId,
        status: 'FAILED',
        error: body.data?.failReason ?? 'A Kie.ai retornou falha na geracao do video.'
      };
    }

    return {
      externalJobId,
      status: 'PROCESSING'
    };
  }

  async downloadGeneratedAsset(assetUrl: string): Promise<Buffer> {
    const response = await fetch(assetUrl);
    if (!response.ok) {
      throw new Error(`Falha ao baixar asset da Kie.ai (${response.status}).`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  private buildHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey ?? ''}`,
      'x-api-key': this.apiKey ?? '',
      'Content-Type': 'application/json'
    };
  }
}

export const veoClient: VeoClient = env.VEO_PROVIDER === 'mock' ? new MockVeoClient() : new KieAIVeoClient();

async function parseJson<T>(response: Response) {
  return (await response.json().catch(() => ({}))) as T;
}

function extractKieError(rawMessage: string | undefined, fallback: string) {
  const message = rawMessage?.trim();
  if (!message) {
    return fallback;
  }
  return `${fallback} ${message}`;
}
