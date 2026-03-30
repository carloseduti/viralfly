import { z } from 'zod';

export const assembleVideoSchema = z.object({
  forceRemount: z.boolean().default(false)
});

