export type VeoGenerationRequest = {
  prompt: string;
  durationSeconds: number;
  aspectRatio: '9:16';
  format: 'mp4';
  referenceImageUrl?: string;
};

export type VeoSubmitResponse = {
  externalJobId: string;
  status: 'QUEUED';
};

export type VeoStatusResponse = {
  externalJobId: string;
  status: 'PROCESSING' | 'SUCCEEDED' | 'FAILED';
  outputAssetUrl?: string;
  error?: string;
};
