import { describe, expect, it } from 'vitest';

import { PublicationService } from '@/server/modules/publications/publication.service';

describe('PublicationService', () => {
  it('deve preparar publicação com legenda e hashtags', async () => {
    const videoRepo = {
      findByIdAndUser: async () => ({
        id: 'video-1',
        statusMontagem: 'GENERATED',
        storagePath: 'u/c/s/final-video.mp4',
        script: {
          titulo: 'Escova secadora',
          hashtags: ['#tiktokshop'],
          frames: [
            { ordem: 1, fala: 'hook' },
            { ordem: 2, fala: 'beneficio' },
            { ordem: 3, fala: 'compre agora' }
          ]
        }
      })
    };

    let upsertInput: any;

    const publicationRepo = {
      upsertByVideo: async (_generatedVideoId: string, data: any) => {
        upsertInput = data;
        return { id: 'pub-1', ...data };
      }
    };

    const service = new PublicationService(videoRepo as any, publicationRepo as any);

    const result = await service.preparePublication('user-1', 'video-1', 'PRIVATE');

    expect(result.status).toBe('READY_TO_PUBLISH');
    expect(upsertInput.legendaPublicacao).toContain('Escova secadora');
    expect(upsertInput.hashtagsPublicacao).toContain('#tiktokshop');
  });
});
