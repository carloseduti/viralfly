-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'READY', 'ARCHIVED');
CREATE TYPE "ScriptStatus" AS ENUM ('DRAFT', 'GENERATED', 'FAILED');
CREATE TYPE "FrameObjective" AS ENUM ('HOOK', 'BENEFICIO', 'CTA');
CREATE TYPE "FrameStatus" AS ENUM ('PENDING', 'PROCESSING', 'GENERATED', 'FAILED');
CREATE TYPE "VideoAssemblyStatus" AS ENUM ('PENDING', 'PROCESSING', 'GENERATED', 'FAILED');
CREATE TYPE "PublicationStatus" AS ENUM ('PENDING', 'READY_TO_PUBLISH', 'PROCESSING', 'PUBLISHED', 'FAILED');

CREATE TABLE "User" (
  "id" UUID NOT NULL,
  "email" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Campaign" (
  "id" TEXT NOT NULL,
  "userId" UUID NOT NULL,
  "nomeProduto" TEXT NOT NULL,
  "descricaoProduto" TEXT NOT NULL,
  "nicho" TEXT NOT NULL,
  "idioma" TEXT NOT NULL,
  "ctaPreferido" TEXT NOT NULL,
  "estiloVisual" TEXT NOT NULL,
  "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VideoScript" (
  "id" TEXT NOT NULL,
  "campaignId" TEXT NOT NULL,
  "titulo" TEXT NOT NULL,
  "idioma" TEXT NOT NULL,
  "legendaFinal" TEXT,
  "hashtags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "status" "ScriptStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VideoScript_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ScriptFrame" (
  "id" TEXT NOT NULL,
  "scriptId" TEXT NOT NULL,
  "ordem" INTEGER NOT NULL,
  "objetivo" "FrameObjective" NOT NULL,
  "fala" TEXT NOT NULL,
  "promptVideo" TEXT NOT NULL,
  "duracaoSegundos" INTEGER NOT NULL,
  "status" "FrameStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ScriptFrame_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GeneratedFrame" (
  "id" TEXT NOT NULL,
  "scriptFrameId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "externalJobId" TEXT,
  "promptEnviado" TEXT NOT NULL,
  "status" "FrameStatus" NOT NULL DEFAULT 'PENDING',
  "storagePath" TEXT,
  "publicUrl" TEXT,
  "duracaoGerada" INTEGER,
  "erro" TEXT,
  "tentativas" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GeneratedFrame_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GeneratedVideo" (
  "id" TEXT NOT NULL,
  "scriptId" TEXT NOT NULL,
  "statusMontagem" "VideoAssemblyStatus" NOT NULL DEFAULT 'PENDING',
  "storagePath" TEXT,
  "publicUrl" TEXT,
  "thumbnailPath" TEXT,
  "thumbnailUrl" TEXT,
  "duracaoTotal" INTEGER,
  "erro" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GeneratedVideo_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TikTokPublication" (
  "id" TEXT NOT NULL,
  "generatedVideoId" TEXT NOT NULL,
  "legendaPublicacao" TEXT NOT NULL,
  "hashtagsPublicacao" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "providerPostId" TEXT,
  "creatorTikTokId" TEXT,
  "status" "PublicationStatus" NOT NULL DEFAULT 'PENDING',
  "modoVisibilidade" TEXT NOT NULL DEFAULT 'PRIVATE',
  "erro" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TikTokPublication_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VideoScript" ADD CONSTRAINT "VideoScript_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ScriptFrame" ADD CONSTRAINT "ScriptFrame_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "VideoScript"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GeneratedFrame" ADD CONSTRAINT "GeneratedFrame_scriptFrameId_fkey" FOREIGN KEY ("scriptFrameId") REFERENCES "ScriptFrame"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GeneratedVideo" ADD CONSTRAINT "GeneratedVideo_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "VideoScript"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TikTokPublication" ADD CONSTRAINT "TikTokPublication_generatedVideoId_fkey" FOREIGN KEY ("generatedVideoId") REFERENCES "GeneratedVideo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "Campaign_userId_idx" ON "Campaign"("userId");
CREATE INDEX "VideoScript_campaignId_idx" ON "VideoScript"("campaignId");
CREATE UNIQUE INDEX "ScriptFrame_scriptId_ordem_key" ON "ScriptFrame"("scriptId", "ordem");
CREATE INDEX "ScriptFrame_scriptId_idx" ON "ScriptFrame"("scriptId");
CREATE UNIQUE INDEX "GeneratedFrame_scriptFrameId_key" ON "GeneratedFrame"("scriptFrameId");
CREATE UNIQUE INDEX "GeneratedVideo_scriptId_key" ON "GeneratedVideo"("scriptId");
CREATE UNIQUE INDEX "TikTokPublication_generatedVideoId_key" ON "TikTokPublication"("generatedVideoId");

ALTER TABLE "ScriptFrame"
  ADD CONSTRAINT "ScriptFrame_ordem_check" CHECK ("ordem" IN (1, 2, 3)),
  ADD CONSTRAINT "ScriptFrame_duracao_check" CHECK ("duracaoSegundos" > 0 AND "duracaoSegundos" <= 8),
  ADD CONSTRAINT "ScriptFrame_objetivo_ordem_check" CHECK (
    ("ordem" = 1 AND "objetivo" = 'HOOK') OR
    ("ordem" = 2 AND "objetivo" = 'BENEFICIO') OR
    ("ordem" = 3 AND "objetivo" = 'CTA')
  );

