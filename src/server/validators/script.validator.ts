import { z } from 'zod';

export const generateScriptSchema = z.object({
  titulo: z.string().min(2).optional()
});

export const updateScriptContentSchema = z.object({
  marketingScript: z.string().min(8),
  frames: z
    .array(
      z.object({
        id: z.string().min(1),
        fala: z.string().min(3),
        promptVideo: z.string().min(5)
      })
    )
    .min(1)
});

