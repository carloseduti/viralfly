import { extname } from 'node:path';

import { CampaignStatus, FrameStatus, Prisma } from '@prisma/client';

import { buildVideoMasterObject } from '@/server/domain/video-master';
import { CampaignRepository } from '@/server/repositories/campaign.repository';
import { StorageService } from '@/server/services/storage.service';
import { AppError } from '@/utils/errors';

type CreateCampaignInput = {
  nomeProduto: string;
  tipoProduto: string;
  descricaoProduto?: string;
  idioma?: string;
  ctaPreferido?: string;
  estiloVisual?: string;
  campaignTone?: string;
  sceneDirection?: string;
};

type UpdateCampaignInput = Partial<CreateCampaignInput>;

type CampaignImageInput = {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
};

export class CampaignService {
  constructor(
    private readonly campaignRepository = new CampaignRepository(),
    private readonly storageService = new StorageService()
  ) {}

  async createCampaign(userId: string, input: CreateCampaignInput, image: CampaignImageInput) {
    if (!image.buffer.length) {
      throw new AppError('Imagem do produto e obrigatoria para gerar os frames', 422);
    }

    const defaults = this.applyDefaults(input);

    const campaign = await this.campaignRepository.create({
      userId,
      nomeProduto: defaults.nomeProduto,
      tipoProduto: defaults.tipoProduto,
      descricaoProduto: defaults.descricaoProduto,
      nicho: defaults.tipoProduto,
      idioma: defaults.idioma,
      ctaPreferido: defaults.ctaPreferido,
      estiloVisual: defaults.estiloVisual,
      campaignTone: defaults.campaignTone,
      sceneDirection: defaults.sceneDirection,
      status: CampaignStatus.DRAFT
    });

    const storagePath = this.buildImageStoragePath(userId, campaign.id, image.fileName, image.mimeType);
    await this.storageService.upload('product-images', storagePath, image.buffer, image.mimeType);
    const publicUrl = this.storageService.getPublicUrl('product-images', storagePath);

    const updatedCampaign = await this.campaignRepository.updateByIdAndUser(campaign.id, userId, {
      imageStoragePath: storagePath,
      imagePublicUrl: publicUrl,
      imageFileName: image.fileName,
      imageMimeType: image.mimeType,
      baseImageStatus: FrameStatus.PENDING,
      baseImageStoragePath: null,
      baseImagePublicUrl: null,
      baseImageProvider: null,
      baseImageExternalJobId: null,
      baseImageError: null
    });

    if (!updatedCampaign) {
      throw new AppError('Produto nao encontrado', 404);
    }

    return updatedCampaign;
  }

  async listCampaigns(userId: string) {
    return this.campaignRepository.listByUser(userId);
  }

  async getCampaignById(userId: string, campaignId: string) {
    const campaign = await this.campaignRepository.findByIdAndUser(campaignId, userId);
    if (!campaign) {
      throw new AppError('Produto nao encontrado', 404);
    }

    return {
      ...campaign,
      videoMaster: buildVideoMasterObject(campaign)
    };
  }

  async updateCampaign(userId: string, campaignId: string, input: UpdateCampaignInput, image?: CampaignImageInput) {
    const existing = await this.campaignRepository.findByIdAndUser(campaignId, userId);
    if (!existing) {
      throw new AppError('Produto nao encontrado', 404);
    }

    const data = this.buildUpdateData(existing.tipoProduto, input);

    if (image?.buffer.length) {
      const storagePath = this.buildImageStoragePath(userId, campaignId, image.fileName, image.mimeType);
      await this.storageService.upload('product-images', storagePath, image.buffer, image.mimeType);
      const publicUrl = this.storageService.getPublicUrl('product-images', storagePath);

      data.imageStoragePath = storagePath;
      data.imagePublicUrl = publicUrl;
      data.imageFileName = image.fileName;
      data.imageMimeType = image.mimeType;
      data.baseImageStatus = FrameStatus.PENDING;
      data.baseImageStoragePath = null;
      data.baseImagePublicUrl = null;
      data.baseImageProvider = null;
      data.baseImageExternalJobId = null;
      data.baseImageError = null;
    }

    const updated = await this.campaignRepository.updateByIdAndUser(campaignId, userId, data);
    if (!updated) {
      throw new AppError('Produto nao encontrado', 404);
    }

    return updated;
  }

  private applyDefaults(input: CreateCampaignInput) {
    const tipoProduto = input.tipoProduto.trim();

    return {
      nomeProduto: input.nomeProduto.trim(),
      tipoProduto,
      descricaoProduto: input.descricaoProduto?.trim() || `Produto ${tipoProduto} para anuncios curtos.`,
      idioma: input.idioma?.trim() || 'pt-BR',
      ctaPreferido: input.ctaPreferido?.trim() || 'Compre agora',
      estiloVisual: input.estiloVisual?.trim() || 'UGC comercial',
      campaignTone: input.campaignTone?.trim() || 'Persuasivo direto',
      sceneDirection: input.sceneDirection?.trim() || 'Narrativa comercial unica do inicio ao fim'
    };
  }

  private buildUpdateData(existingTipoProduto: string, input: UpdateCampaignInput): Prisma.CampaignUncheckedUpdateInput {
    const data: Prisma.CampaignUncheckedUpdateInput = {};

    if (input.nomeProduto) {
      data.nomeProduto = input.nomeProduto.trim();
    }

    if (input.tipoProduto) {
      const tipoProduto = input.tipoProduto.trim();
      data.tipoProduto = tipoProduto;
      data.nicho = tipoProduto;

      if (!input.descricaoProduto && tipoProduto !== existingTipoProduto) {
        data.descricaoProduto = `Produto ${tipoProduto} para anuncios curtos.`;
      }
    }

    if (input.descricaoProduto) {
      data.descricaoProduto = input.descricaoProduto.trim();
    }

    if (input.idioma) {
      data.idioma = input.idioma.trim();
    }

    if (input.ctaPreferido) {
      data.ctaPreferido = input.ctaPreferido.trim();
    }

    if (input.estiloVisual) {
      data.estiloVisual = input.estiloVisual.trim();
      data.baseImageStatus = FrameStatus.PENDING;
      data.baseImageStoragePath = null;
      data.baseImagePublicUrl = null;
      data.baseImageProvider = null;
      data.baseImageExternalJobId = null;
      data.baseImageError = null;
    }

    if (input.campaignTone) {
      data.campaignTone = input.campaignTone.trim();
      data.baseImageStatus = FrameStatus.PENDING;
      data.baseImageStoragePath = null;
      data.baseImagePublicUrl = null;
      data.baseImageProvider = null;
      data.baseImageExternalJobId = null;
      data.baseImageError = null;
    }

    if (input.sceneDirection) {
      data.sceneDirection = input.sceneDirection.trim();
      data.baseImageStatus = FrameStatus.PENDING;
      data.baseImageStoragePath = null;
      data.baseImagePublicUrl = null;
      data.baseImageProvider = null;
      data.baseImageExternalJobId = null;
      data.baseImageError = null;
    }

    return data;
  }

  private buildImageStoragePath(userId: string, campaignId: string, fileName: string, mimeType: string) {
    const extension = resolveImageExtension(fileName, mimeType);
    return `product-images/${userId}/${campaignId}/original.${extension}`;
  }
}

function resolveImageExtension(fileName: string, mimeType: string) {
  const normalizedMime = mimeType.toLowerCase();

  if (normalizedMime === 'image/png') return 'png';
  if (normalizedMime === 'image/webp') return 'webp';
  if (normalizedMime === 'image/jpeg' || normalizedMime === 'image/jpg') return 'jpg';

  const fileExtension = extname(fileName).replace('.', '').toLowerCase();
  if (fileExtension) {
    return fileExtension;
  }

  return 'jpg';
}
