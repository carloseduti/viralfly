import { Queue } from 'bullmq';

import { env } from '@/lib/env';
import { redisConnection } from '@/lib/redis';
import { QUEUES } from '@/server/jobs/constants';

function createQueue(name: string, attempts: number, backoff?: { type: 'exponential'; delay: number }) {
  if (env.DISABLE_QUEUES || !redisConnection) {
    return null;
  }

  return new Queue(name, {
    connection: redisConnection,
    defaultJobOptions: {
      removeOnComplete: true,
      attempts,
      ...(backoff ? { backoff } : {})
    }
  });
}

export const scriptGenerationQueue = createQueue(QUEUES.SCRIPT_GENERATION, 3);
export const frameGenerationQueue = createQueue(QUEUES.FRAME_GENERATION, 3, {
  type: 'exponential',
  delay: 800
});
export const videoAssemblyQueue = createQueue(QUEUES.VIDEO_ASSEMBLY, 2);
export const tiktokPublicationQueue = createQueue(QUEUES.TIKTOK_PUBLICATION, 2);
