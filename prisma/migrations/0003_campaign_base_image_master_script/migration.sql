ALTER TABLE "Campaign"
  ADD COLUMN "campaignTone" TEXT NOT NULL DEFAULT 'Persuasivo direto',
  ADD COLUMN "sceneDirection" TEXT NOT NULL DEFAULT 'Narrativa comercial unica do inicio ao fim',
  ADD COLUMN "baseImageStatus" "FrameStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "baseImageStoragePath" TEXT,
  ADD COLUMN "baseImagePublicUrl" TEXT,
  ADD COLUMN "baseImageProvider" TEXT,
  ADD COLUMN "baseImageExternalJobId" TEXT,
  ADD COLUMN "baseImageError" TEXT;

ALTER TABLE "VideoScript"
  ADD COLUMN "marketingScript" TEXT,
  ADD COLUMN "visualStyle" TEXT,
  ADD COLUMN "campaignTone" TEXT,
  ADD COLUMN "sceneDirection" TEXT;
