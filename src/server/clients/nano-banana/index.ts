import { randomUUID } from 'node:crypto';

import { env } from '@/lib/env';
import type {
  NanoBananaGenerationRequest,
  NanoBananaStatusResponse,
  NanoBananaSubmitResponse
} from '@/server/clients/nano-banana/types';

export interface NanoBananaClient {
  readonly providerName: string;
  submitBaseImageGeneration(payload: NanoBananaGenerationRequest): Promise<NanoBananaSubmitResponse>;
  getGenerationStatus(externalJobId: string): Promise<NanoBananaStatusResponse>;
  downloadGeneratedAsset(assetUrl: string): Promise<Buffer>;
}

export class MockNanoBananaClient implements NanoBananaClient {
  readonly providerName = 'nano-banana-mock';

  private readonly jobs = new Map<string, { createdAt: number; payload: NanoBananaGenerationRequest }>();

  async submitBaseImageGeneration(payload: NanoBananaGenerationRequest): Promise<NanoBananaSubmitResponse> {
    const externalJobId = `nano-${randomUUID()}`;
    this.jobs.set(externalJobId, { createdAt: Date.now(), payload });

    return {
      externalJobId,
      status: 'QUEUED'
    };
  }

  async getGenerationStatus(externalJobId: string): Promise<NanoBananaStatusResponse> {
    const job = this.jobs.get(externalJobId);
    if (!job) {
      return {
        externalJobId,
        status: 'FAILED',
        error: 'Tarefa de imagem base nao encontrada no provider mock.'
      };
    }

    if (Date.now() - job.createdAt < 300) {
      return {
        externalJobId,
        status: 'PROCESSING'
      };
    }

    return {
      externalJobId,
      status: 'SUCCEEDED',
      outputImageUrl: job.payload.referenceImageUrl
    };
  }

  async downloadGeneratedAsset(assetUrl: string): Promise<Buffer> {
    const response = await fetch(assetUrl);
    if (!response.ok) {
      throw new Error(`Falha ao baixar imagem base mock (${response.status}).`);
    }

    return Buffer.from(await response.arrayBuffer());
  }
}

type KieCreateTaskResponse = {
  code?: number;
  msg?: string;
  data?: {
    taskId?: string;
  };
  taskId?: string;
};

type KieTaskDetailResponse = {
  code?: number;
  msg?: string;
  data?: {
    taskId?: string;
    state?: string;
    failMsg?: string;
    resultJson?: string | KieTaskResultJson;
  };
};

type KieTaskResultJson = {
  resultUrls?: string[];
};

export class ApiNanoBananaClient implements NanoBananaClient {
  readonly providerName = 'nano-banana-kie';

  private readonly apiBaseUrl = (env.NANO_BANANA_API_BASE_URL ?? 'https://api.kie.ai').replace(/\/+$/, '');
  private readonly apiKey = env.NANO_BANANA_API_KEY;
  private readonly defaultModel = env.NANO_BANANA_MODEL ?? 'nano-banana-2';
  private readonly callbackUrl = env.NANO_BANANA_CALLBACK_URL;

  async submitBaseImageGeneration(payload: NanoBananaGenerationRequest): Promise<NanoBananaSubmitResponse> {
    if (!this.apiKey) {
      throw new Error('NANO_BANANA_API_KEY e obrigatoria para gerar imagem base com Nano Banana via Kie.ai.');
    }

    const response = await fetch(`${this.apiBaseUrl}/api/v1/jobs/createTask`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify({
        model: payload.model || this.defaultModel,
        callBackUrl: payload.callBackUrl || this.callbackUrl,
        input: {
          prompt: [
            payload.prompt,
            `Estilo visual fixo: ${payload.visualStyle}.`,
            `Tom comercial fixo: ${payload.campaignTone}.`,
            `Direcao narrativa fixa: ${payload.sceneDirection}.`,
            'Preserve fidelidade total do produto e use a referencia anexada.'
          ].join(' '),
          image_input: [payload.referenceImageUrl],
          aspect_ratio: 'auto',
          resolution: '1K',
          output_format: 'png'
        }
      })
    });
    const body = await parseJson<KieCreateTaskResponse>(response);

    if (!response.ok || (body.code !== undefined && body.code >= 400)) {
      throw new Error(composeError(body.msg, 'Falha ao criar tarefa Nano Banana na Kie.ai.'));
    }

    const taskId = body.data?.taskId ?? body.taskId;
    if (!taskId) {
      throw new Error('Resposta invalida da Kie Nano Banana: taskId ausente.');
    }

    return {
      externalJobId: taskId,
      status: 'QUEUED'
    };
  }

  async getGenerationStatus(externalJobId: string): Promise<NanoBananaStatusResponse> {
    if (!this.apiKey) {
      throw new Error('NANO_BANANA_API_KEY e obrigatoria para consultar tarefa Nano Banana na Kie.ai.');
    }

    const url = new URL(`${this.apiBaseUrl}/api/v1/jobs/recordInfo`);
    url.searchParams.set('taskId', externalJobId);

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders()
    });
    const body = await parseJson<KieTaskDetailResponse>(response);

    if (!response.ok || (body.code !== undefined && body.code >= 400)) {
      return {
        externalJobId,
        status: 'FAILED',
        error: composeError(body.msg, 'Falha ao consultar status da tarefa Nano Banana.')
      };
    }

    const state = normalizeState(body.data?.state);
    if (state === 'success') {
      const result = parseResultJson(body.data?.resultJson);
      const outputImageUrl = result?.resultUrls?.[0];
      return {
        externalJobId,
        status: outputImageUrl ? 'SUCCEEDED' : 'FAILED',
        outputImageUrl,
        error: outputImageUrl ? undefined : 'Tarefa concluida sem URL de imagem.'
      };
    }

    if (state === 'fail') {
      return {
        externalJobId,
        status: 'FAILED',
        error: body.data?.failMsg ?? 'Falha na geracao da imagem base.'
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
      throw new Error(`Falha ao baixar imagem base Nano Banana (${response.status}).`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  private buildHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey ?? ''}`,
      'x-api-key': this.apiKey ?? '',
      'Content-Type': 'application/json'
    };
  }
}

export const nanoBananaClient: NanoBananaClient =
  env.IMAGE_PROVIDER === 'mock' ? new MockNanoBananaClient() : new ApiNanoBananaClient();

async function parseJson<T>(response: Response) {
  return (await response.json().catch(() => ({}))) as T;
}

function composeError(message: string | undefined, fallback: string) {
  const normalized = message?.trim();
  if (!normalized) {
    return fallback;
  }
  return `${fallback} ${normalized}`;
}

function normalizeState(state: string | undefined) {
  return (state ?? '').trim().toLowerCase();
}

function parseResultJson(resultJson: string | KieTaskResultJson | undefined): KieTaskResultJson | null {
  if (!resultJson) {
    return null;
  }

  if (typeof resultJson === 'object') {
    return resultJson;
  }

  try {
    return JSON.parse(resultJson) as KieTaskResultJson;
  } catch {
    return null;
  }
}
