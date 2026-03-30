import { z } from 'zod';

export const createCampaignSchema = z.object({
  nomeProduto: z.string().min(2),
  tipoProduto: z.string().min(2),
  descricaoProduto: z.string().min(5).optional(),
  idioma: z.string().min(2).default('pt-BR'),
  ctaPreferido: z.string().min(2).default('Compre agora'),
  estiloVisual: z.string().min(2).default('UGC comercial'),
  campaignTone: z.string().min(2).default('Persuasivo direto'),
  sceneDirection: z.string().min(2).default('Narrativa comercial unica do inicio ao fim')
});

export const updateCampaignSchema = z
  .object({
    nomeProduto: z.string().min(2).optional(),
    tipoProduto: z.string().min(2).optional(),
    descricaoProduto: z.string().min(5).optional(),
    idioma: z.string().min(2).optional(),
    ctaPreferido: z.string().min(2).optional(),
    estiloVisual: z.string().min(2).optional(),
    campaignTone: z.string().min(2).optional(),
    sceneDirection: z.string().min(2).optional()
  });

export const generateBaseImageSchema = z.object({
  forceRegenerate: z.boolean().default(false)
});

