export type TikTokCreatorInfo = {
  creatorId: string;
  nickname: string;
};

export type TikTokInitializePostRequest = {
  caption: string;
  visibility: 'PRIVATE' | 'PUBLIC' | 'FOLLOWERS';
};

export type TikTokInitializePostResponse = {
  uploadUrl: string;
  publishId: string;
};

export type TikTokUploadResponse = {
  uploadToken: string;
};

export type TikTokPostStatusResponse = {
  publishId: string;
  status: 'PROCESSING' | 'PUBLISHED' | 'FAILED';
  error?: string;
};
