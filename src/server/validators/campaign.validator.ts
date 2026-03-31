import { z } from 'zod';

import { PRODUCT_TYPE_VALUES } from '@/domain/product-types';

const productTypeEnum = z.enum(PRODUCT_TYPE_VALUES);

export const createCampaignSchema = z.object({
  nomeProduto: z.string().min(2),
  tipoProduto: productTypeEnum,
  gerarImagemBaseNanoBanana: z.boolean().default(true),
  gerarRoteiroComIa: z.boolean().default(true),
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
    tipoProduto: productTypeEnum.optional(),
    gerarImagemBaseNanoBanana: z.boolean().optional(),
    gerarRoteiroComIa: z.boolean().optional(),
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

