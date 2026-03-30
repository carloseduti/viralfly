import Redis from 'ioredis';

import { env } from '@/lib/env';

export const redisConnection = env.DISABLE_QUEUES
  ? null
  : new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null
    });
