ALTER TABLE "Campaign"
  ADD COLUMN "tipoProduto" TEXT NOT NULL DEFAULT 'geral',
  ADD COLUMN "imageStoragePath" TEXT,
  ADD COLUMN "imagePublicUrl" TEXT,
  ADD COLUMN "imageFileName" TEXT,
  ADD COLUMN "imageMimeType" TEXT;

UPDATE "Campaign"
SET "tipoProduto" = COALESCE(NULLIF("nicho", ''), 'geral')
WHERE "tipoProduto" = 'geral';
