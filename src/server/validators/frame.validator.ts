import { z } from 'zod';

export const generateFramesSchema = z.object({
  forceRegenerate: z.boolean().default(false)
});

export const regenerateFrameSchema = z.object({
  force: z.boolean().default(true)
});

