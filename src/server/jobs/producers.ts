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

  try {
    return await scriptGenerationQueue.add('generate-script', payload, {
      jobId: `script:${payload.campaignId}`
    });
  } catch (error) {
    if (isDuplicateJobError(error)) {
      return null;
    }
    throw error;
  }
}

export async function enqueueFrameGenerationJob(payload: FrameGenerationJob) {
  if (env.DISABLE_QUEUES || !frameGenerationQueue) {
    return null;
  }

  const suffix = payload.frameId ?? 'all';
  try {
    return await frameGenerationQueue.add('generate-frame', payload, {
      jobId: `frames:${payload.scriptId}:${suffix}`
    });
  } catch (error) {
    if (isDuplicateJobError(error)) {
      return null;
    }
    throw error;
  }
}

export async function enqueueVideoAssemblyJob(payload: VideoAssemblyJob) {
  if (env.DISABLE_QUEUES || !videoAssemblyQueue) {
    return null;
  }

  try {
    return await videoAssemblyQueue.add('assemble-video', payload, {
      jobId: `video:${payload.scriptId}`
    });
  } catch (error) {
    if (isDuplicateJobError(error)) {
      return null;
    }
    throw error;
  }
}

export async function enqueueTikTokPublicationJob(payload: TikTokPublicationJob) {
  if (env.DISABLE_QUEUES || !tiktokPublicationQueue) {
    return null;
  }

  try {
    return await tiktokPublicationQueue.add('publish-tiktok', payload, {
      jobId: `publication:${payload.publicationId}`
    });
  } catch (error) {
    if (isDuplicateJobError(error)) {
      return null;
    }
    throw error;
  }
}

function isDuplicateJobError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return /job.+already/i.test(error.message);
}
