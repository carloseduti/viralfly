# ViralFly MVP

MVP full-stack em **Next.js + TypeScript + Supabase + BullMQ** para automação de criação e publicação de vídeos curtos para TikTok com IA.

## Regra central

Todo vídeo final segue a estrutura fixa e inegociável:

1. Frame 1 = `HOOK`
2. Frame 2 = `BENEFICIO`
3. Frame 3 = `CTA`

Regras implementadas:
- Sempre **exatamente 3 frames** por roteiro.
- Ordem obrigatória `1,2,3`.
- Objetivo por ordem obrigatório.
- Duração máxima por frame: **8 segundos**.
- Reprocessamento isolado por frame.
- Montagem do vídeo não regenera frame.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth + Postgres + Storage)
- Prisma ORM
- BullMQ + Redis
- ffmpeg (via serviço dedicado)
- Zod
- Vitest

## Arquitetura

Projeto único com separação de responsabilidades:

- `src/app`: páginas e route handlers
- `src/components`: UI e ações client
- `src/lib`: infraestrutura compartilhada (Prisma, Supabase, Redis, env)
- `src/server`: domínio, módulos de negócio, clients, filas, workers, ffmpeg
- `prisma`: schema e migrações
- `supabase`: setup de buckets/storage

## Estrutura de pastas

```txt
src/
  app/
    (auth)/login
    dashboard
    campaigns
    scripts
    videos
    publications
    api/
      campaigns
      scripts
      frames
      videos
      publications
      auth
  components/
  lib/
    supabase/
  server/
    modules/
      campaigns/
      scripts/
      frames/
      videos/
      publications/
    clients/
      veo/
      tiktok/
      storage/
    jobs/
    workers/
    ffmpeg/
    repositories/
    services/
    validators/
    mappers/
    domain/
    auth/
  types/
  utils/
prisma/
supabase/
```

## Modelos (Prisma)

- `User`
- `Campaign`
- `VideoScript`
- `ScriptFrame`
- `GeneratedFrame`
- `GeneratedVideo`
- `TikTokPublication`

Enums:
- `CampaignStatus`: `DRAFT`, `READY`, `ARCHIVED`
- `ScriptStatus`: `DRAFT`, `GENERATED`, `FAILED`
- `FrameObjective`: `HOOK`, `BENEFICIO`, `CTA`
- `FrameStatus`: `PENDING`, `PROCESSING`, `GENERATED`, `FAILED`
- `VideoAssemblyStatus`: `PENDING`, `PROCESSING`, `GENERATED`, `FAILED`
- `PublicationStatus`: `PENDING`, `READY_TO_PUBLISH`, `PROCESSING`, `PUBLISHED`, `FAILED`

## Endpoints

### Campaigns
- `POST /api/campaigns`
- `GET /api/campaigns`
- `GET /api/campaigns/[id]`

### Scripts
- `POST /api/campaigns/[id]/script/generate`
- `GET /api/scripts/[id]`

### Frames
- `POST /api/scripts/[id]/frames/generate`
- `POST /api/frames/[frameId]/regenerate`
- `GET /api/frames/[frameId]`

### Videos
- `POST /api/scripts/[id]/assemble`
- `GET /api/videos/[id]`

### Publications
- `POST /api/videos/[id]/prepare-publication`
- `POST /api/publications/[id]/publish`
- `GET /api/publications/[id]`

### Auth
- `POST /api/auth/login`
- `POST /api/auth/logout`

## Filas e workers

Filas BullMQ:
- `script-generation`
- `frame-generation`
- `video-assembly`
- `tiktok-publication`

Worker único com consumidores separados em `src/server/workers/index.ts`.

## Supabase

### Banco

1. Crie projeto Supabase.
2. Configure `DATABASE_URL` do Postgres do Supabase.
3. Execute migrações Prisma.

### Auth

1. Ative login por email/senha no Supabase Auth.
2. Configure `NEXT_PUBLIC_SUPABASE_URL` e keys no `.env`.

### Storage

Use `supabase/storage-buckets.sql` para criar buckets:
- `campaigns-assets`
- `generated-frames`
- `generated-videos`
- `thumbnails`

Paths usados:
- `userId/campaignId/scriptId/frame-1.mp4`
- `userId/campaignId/scriptId/final-video.mp4`

## Redis

Suba Redis local ou remoto e configure:
- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_PASSWORD` (opcional)

Modo sem Redis (desenvolvimento):
- Defina `DISABLE_QUEUES=true`.
- Nesse modo, as etapas de script/frame/montagem/publicação rodam de forma síncrona na API.
- Não é necessário subir worker.

## Como rodar

1. Copie `.env.example` para `.env` e preencha os valores.
2. Instale dependências.
3. Gere Prisma client e aplique migration.
4. Rode app web e worker (ou sem worker no modo `DISABLE_QUEUES=true`).

Comandos:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
npm run worker
```

Sem Redis:

```bash
DISABLE_QUEUES=true npm run dev
```

## Testes

```bash
npm run test
```

## Deploy na Vercel

Configuracao recomendada para este projeto:

1. Conecte o repositÃ³rio na Vercel (framework `Next.js`).
2. Defina as variÃ¡veis de ambiente do `.env.example`.
   ObrigatÃ³rias para subir a aplicaÃ§Ã£o:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ou `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`)
   Regras importantes para `DATABASE_URL` no Supabase:
   - Se usar `db.<project-ref>.supabase.co:5432`, usuario deve ser `postgres`.
   - Se usar `*.pooler.supabase.com:6543`, usuario deve ser `postgres.<project-ref>`.
   - Senha com caracteres especiais (`@`, `/`, `$`) deve estar em URL encoding.
3. Em Vercel, configure `DISABLE_QUEUES=true` (workers BullMQ nao rodam como processo dedicado em serverless).
4. Configure callbacks com o dominio publicado:
   - `NANO_BANANA_CALLBACK_URL=https://SEU_APP.vercel.app/api/integrations/nano-banana/callback`
   - `KIE_AI_CALLBACK_URL=https://SEU_APP.vercel.app/api/integrations/kie-ai/callback`
5. Mantenha `FFMPEG_PATH` vazio para usar `ffmpeg-static` automaticamente.

Observacoes:
- O arquivo `vercel.json` ja define `maxDuration` para as APIs.
- O build da Vercel executa `prisma generate` e `next build` (sem rodar migracao automaticamente).
- Prisma Client e gerado no `postinstall`.
- Execute migracoes separadamente no banco alvo com `npm run migrate:deploy` em ambiente com acesso ao Postgres.

Coberturas principais:
- estrutura obrigatória de 3 frames
- ordem 1,2,3
- objetivo por ordem
- bloqueio de montagem sem 3 frames gerados
- reprocessamento isolado de frame
- preparação de publicação
- proteção de rotas privadas

## O que está mockado no MVP

- Client Veo 3 (`src/server/clients/veo`)
- Client TikTok (`src/server/clients/tiktok`)

Ambos preservam fluxo real:
- Veo: submit -> status polling -> download
- TikTok: query creator -> initialize post -> upload media -> get post status

## O que já está pronto para provider real

- Interfaces e DTOs dedicados para Veo e TikTok
- Serviços de domínio desacoplados dos clients
- Persistência de `externalJobId`, `providerPostId`, status e erro
- Orquestração por BullMQ

## Fluxo ponta a ponta

1. Usuário autenticado cria campanha.
2. API enfileira geração de roteiro (ou processa na hora com `DISABLE_QUEUES=true`).
3. Worker cria `VideoScript` + `ScriptFrame` (ou API no modo síncrono).
4. Usuário solicita geração de frames.
5. Worker gera cada frame de forma independente com Veo (mock) e salva no Storage.
6. Usuário solicita montagem.
7. Worker valida 3 frames gerados, concatena com ffmpeg, salva vídeo final + thumb.
8. Usuário prepara publicação.
9. Usuário publica.
10. Worker executa fluxo TikTok (mock) e atualiza status final.

## Próximos passos

- Conectar client real do Veo.
- Conectar OAuth completo do TikTok e refresh token.
- Implementar polling assíncrono contínuo de jobs externos.
- Adicionar observabilidade (logs estruturados, tracing e métricas).
- Adicionar teste A/B de frame 3 (CTA) mantendo os frames 1 e 2.
