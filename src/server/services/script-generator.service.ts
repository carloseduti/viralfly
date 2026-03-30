import { FrameObjective } from '@prisma/client';
import { z } from 'zod';

import { env } from '@/lib/env';
import { MAX_FRAME_DURATION_SECONDS } from '@/server/domain/constants';
import type { StructuredScriptDraft } from '@/server/domain/types';

type CampaignContext = {
  nomeProduto: string;
  tipoProduto: string;
  descricaoProduto: string;
  idioma: string;
  ctaPreferido: string;
  estiloVisual: string;
  campaignTone: string;
  sceneDirection: string;
  imagePublicUrl?: string | null;
  baseImagePublicUrl?: string | null;
};

export interface ScriptGeneratorService {
  generate(campaign: CampaignContext, customTitle?: string): Promise<StructuredScriptDraft>;
}

export class MockScriptGeneratorService implements ScriptGeneratorService {
  async generate(campaign: CampaignContext, customTitle?: string): Promise<StructuredScriptDraft> {
    const titulo = customTitle ?? `${campaign.nomeProduto} | anuncio rapido para ${campaign.tipoProduto}`;
    const referenceImage = campaign.baseImagePublicUrl ?? campaign.imagePublicUrl ?? 'referencia interna';
    const corePromise = `${campaign.nomeProduto} entrega ${campaign.descricaoProduto}`;
    const marketingScript = [
      `Inicio: hook direto para interromper o scroll e apresentar ${campaign.nomeProduto} com promessa clara.`,
      `Meio: demonstracao objetiva do beneficio principal (${corePromise}) no mesmo contexto visual.`,
      `Fim: CTA com urgencia na mesma linha comercial para converter agora.`
    ].join(' ');
    const baseReference = `Use a imagem base publicitaria como guia principal: ${referenceImage}.`;
    const baseVisual = [
      'Video vertical 9:16 com ritmo de anuncio curto.',
      `Estilo visual fixo: ${campaign.estiloVisual}.`,
      `Tom comercial unico: ${campaign.campaignTone}.`,
      `Direcao narrativa unica: ${campaign.sceneDirection}.`,
      'Preserve formato, cor, identidade e detalhes essenciais do produto.',
      'Manter o mesmo contexto visual entre os 3 frames, sem mudanca brusca de identidade.',
      'Nao incluir banners, legendas, pop-ups, textos sobrepostos, precos ou selos promocionais.',
      'A comunicacao do anuncio deve ser por narracao/voz de apresentacao, sem texto na tela.',
      'Conteudo visual focado exclusivamente no produto.',
      baseReference
    ].join(' ');

    return {
      titulo,
      idioma: campaign.idioma,
      marketingScript,
      visualStyle: campaign.estiloVisual,
      campaignTone: campaign.campaignTone,
      sceneDirection: campaign.sceneDirection,
      legendaFinal: `${campaign.nomeProduto} (${campaign.tipoProduto}) com oferta limitada para conversao rapida.`,
      hashtags: ['#anuncio', '#oferta', '#shortads', `#${sanitizeHashtag(campaign.tipoProduto)}`],
      frames: [
        {
          ordem: 1,
          objetivo: FrameObjective.HOOK,
          fala: `Pare de rolar: ${campaign.nomeProduto} resolve ${campaign.descricaoProduto} de forma imediata.`,
          promptVideo: `${baseVisual} Frame 1 (inicio/hook): abertura forte mantendo o mesmo ambiente comercial do roteiro mestre.`,
          duracaoSegundos: MAX_FRAME_DURATION_SECONDS
        },
        {
          ordem: 2,
          objetivo: FrameObjective.BENEFICIO,
          fala: `Agora veja ${campaign.nomeProduto} em acao: ${campaign.descricaoProduto}, com prova visual do beneficio.`,
          promptVideo: `${baseVisual} Frame 2 (meio/beneficio): continuacao natural do frame 1 com mesma identidade comercial.`,
          duracaoSegundos: MAX_FRAME_DURATION_SECONDS
        },
        {
          ordem: 3,
          objetivo: FrameObjective.CTA,
          fala: `${campaign.ctaPreferido}. Ultimas unidades, aproveite agora na mesma oferta apresentada no inicio.`,
          promptVideo: `${baseVisual} Frame 3 (fim/cta): fechamento no mesmo contexto visual com urgencia e escassez coerentes com os frames anteriores.`,
          duracaoSegundos: MAX_FRAME_DURATION_SECONDS
        }
      ]
    };
  }
}

type KieChatCompletionsResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

const draftSchema = z.object({
  titulo: z.string().min(3),
  idioma: z.string().min(2).optional(),
  legendaFinal: z.string().min(3),
  hashtags: z.array(z.string()).optional().default([]),
  marketingScript: z.string().min(8),
  visualStyle: z.string().min(2),
  campaignTone: z.string().min(2),
  sceneDirection: z.string().min(2),
  frames: z
    .array(
      z.object({
        ordem: z.coerce.number(),
        objetivo: z.string().min(2),
        fala: z.string().min(3),
        promptVideo: z.string().min(5),
        duracaoSegundos: z.coerce.number().optional()
      })
    )
    .length(3)
});

export class KieGeminiScriptGeneratorService implements ScriptGeneratorService {
  private readonly apiBaseUrl = (env.KIE_AI_API_BASE_URL ?? 'https://api.kie.ai').replace(/\/+$/, '');
  private readonly apiKey = env.KIE_AI_API_KEY;
  private readonly endpointPath = '/gemini-3.1-pro/v1/chat/completions';

  async generate(campaign: CampaignContext, customTitle?: string): Promise<StructuredScriptDraft> {
    if (!this.apiKey) {
      throw new Error('KIE_AI_API_KEY nao configurada para gerar roteiro via Kie Gemini 3.1 Pro.');
    }

    const referenceImage = campaign.baseImagePublicUrl ?? campaign.imagePublicUrl;
    if (!referenceImage) {
      throw new Error('Imagem de referencia obrigatoria para gerar roteiro.');
    }

    const response = await fetch(`${this.apiBaseUrl}${this.endpointPath}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content:
              'Voce e um estrategista de performance marketing. Responda APENAS com JSON valido sem markdown.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: this.buildPrompt(campaign, customTitle)
              },
              {
                type: 'image_url',
                image_url: {
                  url: referenceImage
                }
              }
            ]
          }
        ],
        stream: false,
        max_tokens: 1200,
        temperature: 0.7
      })
    });
    const body = (await response.json().catch(() => ({}))) as KieChatCompletionsResponse;

    if (!response.ok) {
      const detail = body.error?.message ? ` ${body.error.message}` : '';
      throw new Error(`Falha ao gerar roteiro no Kie Gemini 3.1 Pro.${detail}`);
    }

    const content = body.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Resposta vazia do Kie Gemini 3.1 Pro ao gerar roteiro.');
    }

    const parsedJson = parseJsonPayload(content);
    const parsed = draftSchema.parse(parsedJson);

    const normalizedFrames = parsed.frames
      .sort((a, b) => a.ordem - b.ordem)
      .map((frame, idx) => ({
        ordem: (idx + 1) as 1 | 2 | 3,
        objetivo: objectiveByOrder[idx] as FrameObjective,
        fala: frame.fala.trim(),
        promptVideo: frame.promptVideo.trim(),
        duracaoSegundos: clampDuration(frame.duracaoSegundos ?? MAX_FRAME_DURATION_SECONDS)
      })) as StructuredScriptDraft['frames'];

    return {
      titulo: customTitle ?? parsed.titulo.trim(),
      idioma: parsed.idioma?.trim() || campaign.idioma,
      legendaFinal: parsed.legendaFinal.trim(),
      hashtags: parsed.hashtags.length ? parsed.hashtags : ['#anuncio', '#oferta', '#shortads'],
      marketingScript: parsed.marketingScript.trim(),
      visualStyle: parsed.visualStyle.trim(),
      campaignTone: parsed.campaignTone.trim(),
      sceneDirection: parsed.sceneDirection.trim(),
      frames: normalizedFrames
    };
  }

  private buildPrompt(campaign: CampaignContext, customTitle?: string) {
    return [
      'Crie roteiro comercial em portugues brasileiro para video curto vertical 9:16.',
      'Objetivo: gerar propaganda unica e continua com 3 frames obrigatorios.',
      `Produto: ${campaign.nomeProduto}.`,
      `Tipo: ${campaign.tipoProduto}.`,
      `Descricao do beneficio: ${campaign.descricaoProduto}.`,
      `CTA preferido: ${campaign.ctaPreferido}.`,
      `Estilo visual fixo: ${campaign.estiloVisual}.`,
      `Tom comercial fixo: ${campaign.campaignTone}.`,
      `Direcao narrativa fixa: ${campaign.sceneDirection}.`,
      'A imagem enviada e referencia principal e deve preservar identidade do produto.',
      'Nao crie estilos desconectados entre frames.',
      'Regra obrigatoria: nao incluir banners, legendas, pop-ups, textos na tela, tarjas ou selos promocionais em nenhuma cena.',
      'Regra obrigatoria: o conteudo visual deve mostrar exclusivamente o produto como foco principal.',
      'Regra obrigatoria: a comunicacao deve acontecer por narracao/voz de apresentacao (voice-over), sem texto sobreposto.',
      'Garanta que os campos "fala" representem frases naturais de narracao para cada frame.',
      'Garanta que cada "promptVideo" repita explicitamente a regra de nao usar textos, banners, legendas ou pop-ups.',
      'Retorne JSON com esta estrutura EXATA:',
      '{',
      '  "titulo": "string",',
      '  "idioma": "pt-BR",',
      '  "legendaFinal": "string",',
      '  "hashtags": ["#a", "#b"],',
      '  "marketingScript": "string unica com inicio, meio e fim",',
      '  "visualStyle": "string",',
      '  "campaignTone": "string",',
      '  "sceneDirection": "string",',
      '  "frames": [',
      '    { "ordem": 1, "objetivo": "HOOK", "fala": "string", "promptVideo": "string", "duracaoSegundos": 8 },',
      '    { "ordem": 2, "objetivo": "BENEFICIO", "fala": "string", "promptVideo": "string", "duracaoSegundos": 8 },',
      '    { "ordem": 3, "objetivo": "CTA", "fala": "string", "promptVideo": "string", "duracaoSegundos": 8 }',
      '  ]',
      '}',
      customTitle ? `Use este titulo: ${customTitle}.` : 'Crie um titulo comercial objetivo.'
    ].join(' ');
  }
}

const objectiveByOrder: FrameObjective[] = [FrameObjective.HOOK, FrameObjective.BENEFICIO, FrameObjective.CTA];

function clampDuration(value: number) {
  if (value < 1) return 1;
  if (value > MAX_FRAME_DURATION_SECONDS) return MAX_FRAME_DURATION_SECONDS;
  return Math.round(value);
}

function parseJsonPayload(rawContent: string): unknown {
  const trimmed = rawContent.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return JSON.parse(trimmed);
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    return JSON.parse(fencedMatch[1]);
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
  }

  throw new Error('Resposta do modelo nao contem JSON valido.');
}

function sanitizeHashtag(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '');
}

export const scriptGeneratorService: ScriptGeneratorService =
  env.SCRIPT_PROVIDER === 'mock' ? new MockScriptGeneratorService() : new KieGeminiScriptGeneratorService();
