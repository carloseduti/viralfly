import { z } from 'zod';

export const preparePublicationSchema = z.object({
  modoVisibilidade: z.enum(['PRIVATE', 'PUBLIC', 'FOLLOWERS']).default('PRIVATE')
});

export const publishPublicationSchema = z.object({
  publishNow: z.boolean().default(true)
});

