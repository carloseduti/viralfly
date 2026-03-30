import { randomUUID } from 'node:crypto';

import type {
  TikTokCreatorInfo,
  TikTokInitializePostRequest,
  TikTokInitializePostResponse,
  TikTokPostStatusResponse,
  TikTokUploadResponse
} from '@/server/clients/tiktok/types';

export interface TikTokPublishingClient {
  queryCreatorInfo(): Promise<TikTokCreatorInfo>;
  initializePost(payload: TikTokInitializePostRequest): Promise<TikTokInitializePostResponse>;
  uploadMedia(uploadUrl: string, media: Buffer): Promise<TikTokUploadResponse>;
  getPostStatus(publishId: string): Promise<TikTokPostStatusResponse>;
}

export class MockTikTokPublishingClient implements TikTokPublishingClient {
  private readonly posts = new Map<string, { createdAt: number; failed?: boolean }>();

  async queryCreatorInfo(): Promise<TikTokCreatorInfo> {
    return {
      creatorId: 'mock-creator-001',
      nickname: 'viralfly_admin'
    };
  }

  async initializePost(_payload: TikTokInitializePostRequest): Promise<TikTokInitializePostResponse> {
    const publishId = `tt-${randomUUID()}`;
    this.posts.set(publishId, { createdAt: Date.now() });

    return {
      uploadUrl: `mock://tiktok/upload/${publishId}`,
      publishId
    };
  }

  async uploadMedia(_uploadUrl: string, _media: Buffer): Promise<TikTokUploadResponse> {
    return {
      uploadToken: `upload-${randomUUID()}`
    };
  }

  async getPostStatus(publishId: string): Promise<TikTokPostStatusResponse> {
    const post = this.posts.get(publishId);
    if (!post) {
      return {
        publishId,
        status: 'FAILED',
        error: 'Publicação não encontrada no provider mock.'
      };
    }

    if (Date.now() - post.createdAt < 300) {
      return {
        publishId,
        status: 'PROCESSING'
      };
    }

    return {
      publishId,
      status: 'PUBLISHED'
    };
  }
}

export const tiktokClient: TikTokPublishingClient = new MockTikTokPublishingClient();
