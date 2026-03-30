export const QUEUES = {
  SCRIPT_GENERATION: 'script-generation',
  FRAME_GENERATION: 'frame-generation',
  VIDEO_ASSEMBLY: 'video-assembly',
  TIKTOK_PUBLICATION: 'tiktok-publication'
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];

export type ScriptGenerationJob = {
  campaignId: string;
  userId: string;
  titulo?: string;
};

export type FrameGenerationJob = {
  scriptId: string;
  userId: string;
  frameId?: string;
  forceRegenerate?: boolean;
};

export type VideoAssemblyJob = {
  scriptId: string;
  userId: string;
};

export type TikTokPublicationJob = {
  publicationId: string;
  userId: string;
};
