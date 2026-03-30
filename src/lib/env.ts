import { z } from 'zod';

const optionalUrl = z.preprocess((value) => (value === '' ? undefined : value), z.string().url().optional());
const optionalString = z.preprocess((value) => (value === '' ? undefined : value), z.string().optional());
const defaultDisableQueues = process.env.VERCEL === '1' || process.env.VERCEL === 'true';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().default('http://127.0.0.1:54321'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  DATABASE_URL: z.string().min(1).default('postgresql://postgres:postgres@127.0.0.1:5432/postgres'),
  DISABLE_QUEUES: z
    .preprocess((value) => {
      if (value === undefined || value === null || value === '') {
        return undefined;
      }

      if (value === true || value === 'true') {
        return true;
      }

      if (value === false || value === 'false') {
        return false;
      }

      return value;
    }, z.boolean())
    .default(defaultDisableQueues),
  REDIS_HOST: z.string().default('127.0.0.1'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  NANO_BANANA_API_BASE_URL: optionalUrl,
  NANO_BANANA_API_KEY: z.string().optional(),
  NANO_BANANA_MODEL: z.string().optional(),
  NANO_BANANA_CALLBACK_URL: optionalUrl,
  IMAGE_PROVIDER: z.enum(['nano-banana', 'mock']).default('nano-banana'),
  SCRIPT_PROVIDER: z.enum(['kie-ai', 'mock']).default('kie-ai'),
  KIE_AI_API_BASE_URL: optionalUrl,
  KIE_AI_API_KEY: z.string().optional(),
  KIE_AI_MODEL: z.string().optional(),
  KIE_AI_CALLBACK_URL: optionalUrl,
  VEO_PROVIDER: z.enum(['kie-ai', 'mock']).default('kie-ai'),
  VEO_PROJECT_ID: z.string().optional(),
  VEO_LOCATION: z.string().optional(),
  VEO_MODEL: z.string().default('veo-3'),
  TIKTOK_CLIENT_KEY: z.string().optional(),
  TIKTOK_CLIENT_SECRET: z.string().optional(),
  TIKTOK_REDIRECT_URI: z.string().optional(),
  TIKTOK_ACCESS_TOKEN: z.string().optional(),
  FFMPEG_PATH: optionalString
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Variáveis de ambiente inválidas', parsed.error.flatten().fieldErrors);
  throw new Error('Falha ao validar variáveis de ambiente. Verifique .env');
}

const nextPublicAnonKey =
  parsed.data.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  parsed.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
  'dev-anon-key';

export const env = {
  ...parsed.data,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: nextPublicAnonKey
};

