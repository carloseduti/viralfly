import { env } from '@/lib/env';
import type {
  FrameGenerationJob,
  ScriptGenerationJob,
  TikTokPublicationJob,
  VideoAssemblyJob
} from '@/server/jobs/constants';
import {
  frameGenerationQueue,
  scriptGenerationQueue,
  tiktokPublicationQueue,
  videoAssemblyQueue
} from '@/server/jobs/queues';

export async function enqueueScriptGenerationJob(payload: ScriptGenerationJob) {
  if (env.DISABLE_QUEUES || !scriptGenerationQueue) {
    return null;
  }

  return scriptGenerationQueue.add('generate-script', payload, {
    jobId: `script:${payload.campaignId}`
  });
}

export async function enqueueFrameGenerationJob(payload: FrameGenerationJob) {
  if (env.DISABLE_QUEUES || !frameGenerationQueue) {
    return null;
  }

  const suffix = payload.frameId ?? 'all';
  return frameGenerationQueue.add('generate-frame', payload, {
    jobId: `frames:${payload.scriptId}:${suffix}`
  });
}

export async function enqueueVideoAssemblyJob(payload: VideoAssemblyJob) {
  if (env.DISABLE_QUEUES || !videoAssemblyQueue) {
    return null;
  }

  return videoAssemblyQueue.add('assemble-video', payload, {
    jobId: `video:${payload.scriptId}`
  });
}

export async function enqueueTikTokPublicationJob(payload: TikTokPublicationJob) {
  if (env.DISABLE_QUEUES || !tiktokPublicationQueue) {
    return null;
  }

  return tiktokPublicationQueue.add('publish-tiktok', payload, {
    jobId: `publication:${payload.publicationId}`
  });
}
