import { z } from 'zod';

export const generateScriptSchema = z.object({
  titulo: z.string().min(2).optional()
});

