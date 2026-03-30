import { Worker } from 'bullmq';

import { env } from '@/lib/env';
import { redisConnection } from '@/lib/redis';
import {
  QUEUES,
  type FrameGenerationJob,
  type ScriptGenerationJob,
  type TikTokPublicationJob,
  type VideoAssemblyJob
} from '@/server/jobs/constants';
import { FrameGenerationService } from '@/server/modules/frames/frame-generation.service';
import { PublicationService } from '@/server/modules/publications/publication.service';
import { ScriptService } from '@/server/modules/scripts/script.service';
import { VideoAssemblyService } from '@/server/modules/videos/video-assembly.service';

if (env.DISABLE_QUEUES) {
  console.log('DISABLE_QUEUES=true: workers desabilitados (modo síncrono via API).');
  process.exit(0);
}

if (!redisConnection) {
  throw new Error('Conexão Redis indisponível para iniciar workers.');
}

const scriptService = new ScriptService();
const frameService = new FrameGenerationService();
const videoService = new VideoAssemblyService();
const publicationService = new PublicationService();

function attachLogging(worker: Worker) {
  worker.on('completed', (job) => {
    console.log(`[worker:${worker.name}] job concluído`, job.id);
  });

  worker.on('failed', (job, err) => {
    console.error(`[worker:${worker.name}] job falhou`, job?.id, err.message);
  });
}

const scriptWorker = new Worker<ScriptGenerationJob>(
  QUEUES.SCRIPT_GENERATION,
  async (job) => {
    await scriptService.handleScriptGenerationJob(job.data);
  },
  { connection: redisConnection }
);

const frameWorker = new Worker<FrameGenerationJob>(
  QUEUES.FRAME_GENERATION,
  async (job) => {
    await frameService.handleFrameGenerationJob(job.data);
  },
  { connection: redisConnection, concurrency: 3 }
);

const videoWorker = new Worker<VideoAssemblyJob>(
  QUEUES.VIDEO_ASSEMBLY,
  async (job) => {
    await videoService.handleAssemblyJob(job.data);
  },
  { connection: redisConnection }
);

const publicationWorker = new Worker<TikTokPublicationJob>(
  QUEUES.TIKTOK_PUBLICATION,
  async (job) => {
    await publicationService.handlePublicationJob(job.data);
  },
  { connection: redisConnection }
);

attachLogging(scriptWorker);
attachLogging(frameWorker);
attachLogging(videoWorker);
attachLogging(publicationWorker);

console.log('Workers iniciados: script-generation, frame-generation, video-assembly, tiktok-publication');
