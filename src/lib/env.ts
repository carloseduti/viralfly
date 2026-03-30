import { z } from 'zod';

const optionalUrl = z.preprocess((value) => (value === '' ? undefined : value), z.string().url().optional());
const optionalString = z.preprocess((value) => (value === '' ? undefined : value), z.string().optional());
const optionalBoolean = z.preprocess((value) => {
  if (value === '' || value === undefined || value === null) {
    return undefined;
  }
  if (value === true || value === 'true') {
    return true;
  }
  if (value === false || value === 'false') {
    return false;
  }
  return value;
}, z.boolean().optional());
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
const defaultDisableQueues = isVercel;

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
  FFMPEG_PATH: optionalString,
  AUTH_DEBUG: optionalBoolean.default(false)
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

const databaseUrlValidationError = validateDatabaseUrl(env.DATABASE_URL, env.NEXT_PUBLIC_SUPABASE_URL);

if (isVercel) {
  const fieldErrors: Record<string, string[]> = {};

  if (/127\.0\.0\.1|localhost/.test(env.DATABASE_URL)) {
    fieldErrors.DATABASE_URL = ['DATABASE_URL invalida para Vercel. Configure a URL real do Postgres/Supabase.'];
  }

  if (/127\.0\.0\.1|localhost/.test(env.NEXT_PUBLIC_SUPABASE_URL)) {
    fieldErrors.NEXT_PUBLIC_SUPABASE_URL = ['NEXT_PUBLIC_SUPABASE_URL invalida para Vercel. Use a URL real do projeto Supabase.'];
  }

  if (env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'dev-anon-key') {
    fieldErrors.NEXT_PUBLIC_SUPABASE_ANON_KEY = [
      'NEXT_PUBLIC_SUPABASE_ANON_KEY nao configurada na Vercel.'
    ];
  }

  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    fieldErrors.SUPABASE_SERVICE_ROLE_KEY = ['SUPABASE_SERVICE_ROLE_KEY nao configurada na Vercel.'];
  }

  if (databaseUrlValidationError) {
    fieldErrors.DATABASE_URL = [...(fieldErrors.DATABASE_URL ?? []), databaseUrlValidationError];
  }

  if (Object.keys(fieldErrors).length > 0) {
    console.error('Variaveis obrigatorias ausentes/invalidas para Vercel', fieldErrors);
    throw new Error('Configuracao invalida de ambiente para Vercel.');
  }
}

function validateDatabaseUrl(databaseUrl: string, supabaseUrl: string) {
  let parsed: URL;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    return 'DATABASE_URL invalida: formato de URL nao reconhecido.';
  }

  const host = parsed.hostname.toLowerCase();
  const username = decodeURIComponent(parsed.username || '');

  const schemeIndex = databaseUrl.indexOf('://');
  const lastAtIndex = databaseUrl.lastIndexOf('@');
  if (schemeIndex > -1 && lastAtIndex > schemeIndex + 3) {
    const authSection = databaseUrl.slice(schemeIndex + 3, lastAtIndex);
    if (authSection.includes('@')) {
      return 'DATABASE_URL invalida: senha parece conter "@" sem URL encoding. Use encode de caracteres especiais (%40, %24, %2F etc).';
    }
  }

  if (host.endsWith('.pooler.supabase.com') && !username.includes('.')) {
    return 'DATABASE_URL invalida para Supabase pooler: usuario deve incluir project ref (ex: postgres.<project-ref>).';
  }

  if (/^db\.[a-z0-9]+\.supabase\.co$/.test(host) && username.includes('.')) {
    return 'DATABASE_URL invalida para host db.<project-ref>.supabase.co: usuario deve ser apenas postgres (sem sufixo do project ref).';
  }

  const publicRef = extractSupabaseProjectRefFromPublicUrl(supabaseUrl);
  const databaseRef = extractSupabaseProjectRefFromDatabase(host, username);
  if (publicRef && databaseRef && publicRef !== databaseRef) {
    return `DATABASE_URL nao corresponde ao mesmo projeto Supabase do NEXT_PUBLIC_SUPABASE_URL (esperado ref "${publicRef}", recebido "${databaseRef}").`;
  }

  return null;
}

function extractSupabaseProjectRefFromPublicUrl(supabaseUrl: string) {
  try {
    const hostname = new URL(supabaseUrl).hostname.toLowerCase();
    const match = hostname.match(/^([a-z0-9]+)\.supabase\.co$/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

function extractSupabaseProjectRefFromDatabase(hostname: string, username: string) {
  const dbHostMatch = hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/);
  if (dbHostMatch?.[1]) {
    return dbHostMatch[1];
  }

  if (hostname.endsWith('.pooler.supabase.com')) {
    const usernameParts = username.split('.');
    if (usernameParts.length >= 2) {
      return usernameParts.slice(1).join('.');
    }
  }

  return null;
}

