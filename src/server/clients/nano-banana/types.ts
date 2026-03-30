export type NanoBananaGenerationRequest = {
  prompt: string;
  referenceImageUrl: string;
  model: string;
  callBackUrl?: string;
  visualStyle: string;
  campaignTone: string;
  sceneDirection: string;
};

export type NanoBananaSubmitResponse = {
  externalJobId: string;
  status: 'QUEUED';
  outputImageUrl?: string;
};

export type NanoBananaStatusResponse = {
  externalJobId: string;
  status: 'PROCESSING' | 'SUCCEEDED' | 'FAILED';
  outputImageUrl?: string;
  error?: string;
};
