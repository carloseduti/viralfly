import Link from 'next/link';

import { ActionButton } from '@/components/action-button';
import { StatusBadge } from '@/components/status-badge';
import { requirePageAuthenticatedUser } from '@/server/auth/require-authenticated-user';
import { CampaignService } from '@/server/modules/campaigns/campaign.service';

const campaignService = new CampaignService();

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePageAuthenticatedUser();
  const { id } = await params;
  const campaign = await campaignService.getCampaignById(user.id, id);

  const script = campaign.scripts[0] ?? null;
  const video = script?.generatedVideo ?? null;
  const publication = video?.publication ?? null;

  const frameOne = script?.frames.find((item) => item.ordem === 1);
  const frameTwo = script?.frames.find((item) => item.ordem === 2);
  const frameThree = script?.frames.find((item) => item.ordem === 3);

  return (
    <div className="space-y-5">
      <section className="card">
        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Imagem original</p>
              <div className="media-frame aspect-[4/3] max-h-[300px] w-full">
                {campaign.imagePublicUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={campaign.imagePublicUrl} alt={campaign.nomeProduto} className="h-full w-full object-cover object-center" />
                ) : (
                  <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500">
                    Sem imagem de referencia cadastrada.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Imagem base Nano Banana</p>
              <div className="media-frame aspect-[4/3] max-h-[300px] w-full">
                {campaign.baseImagePublicUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={campaign.baseImagePublicUrl} alt={`${campaign.nomeProduto} base`} className="h-full w-full object-cover object-center" />
                ) : (
                  <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500">
                    Imagem base ainda nao gerada.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 xl:self-start">
            <div className="title-block">
              <div>
                <p className="badge-soft">Produto</p>
                <h1 className="mt-2 text-2xl font-semibold">{campaign.nomeProduto}</h1>
                <p className="text-sm text-slate-600">{campaign.tipoProduto}</p>
              </div>
              <StatusBadge status={campaign.status} />
            </div>

            <div className="card-soft text-sm text-slate-700">
              <p className="font-medium">Descricao comercial</p>
              <p className="mt-1">{campaign.descricaoProduto}</p>
              <div className="info-grid mt-3">
                <InfoItem label="Idioma" value={campaign.idioma} />
                <InfoItem label="CTA preferido" value={campaign.ctaPreferido} />
                <InfoItem label="Estilo visual" value={campaign.estiloVisual} />
                <InfoItem label="Tom comercial" value={campaign.campaignTone} />
                <InfoItem label="Direcao de cena" value={campaign.sceneDirection} />
                <InfoItem label="Imagem vinculada" value={campaign.imageFileName ?? 'nao informada'} />
                <InfoItem label="Status imagem base" value={campaign.baseImageStatus} />
                <InfoItem label="Task imagem base" value={campaign.baseImageExternalJobId ?? 'nao iniciada'} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href={`/campaigns/${campaign.id}/edit` as never} className="btn-secondary w-full sm:w-auto">
                Editar produto
              </Link>
              {script ? (
                <Link href={`/scripts/${script.id}`} className="btn-secondary w-full sm:w-auto">
                  Ver roteiro
                </Link>
              ) : null}
              {video ? (
                <Link href={`/videos/${video.id}`} className="btn-secondary w-full sm:w-auto">
                  Ver video
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="section-title">Pipeline de geracao</h2>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <PipelineItem label="Imagem base Nano Banana" status={campaign.baseImageStatus} />
          <PipelineItem label="Roteiro" status={script?.status ?? 'PENDING'} />
          <PipelineItem label="Frame 1 - Hook" status={frameOne?.generatedFrame?.status ?? frameOne?.status ?? 'PENDING'} />
          <PipelineItem label="Frame 2 - Beneficio" status={frameTwo?.generatedFrame?.status ?? frameTwo?.status ?? 'PENDING'} />
          <PipelineItem label="Frame 3 - CTA" status={frameThree?.generatedFrame?.status ?? frameThree?.status ?? 'PENDING'} />
          <PipelineItem label="Montagem final" status={video?.statusMontagem ?? 'PENDING'} />
          <PipelineItem label="Publicacao" status={publication?.status ?? 'PENDING'} />
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="section-title">Acoes</h2>
        <p className="text-xs text-slate-600">1. Upload da imagem do produto e feito no cadastro/edicao do produto.</p>
        <div className="action-grid">
          <ActionButton
            endpoint={`/api/campaigns/${campaign.id}/base-image/generate`}
            label="2. Gerar imagem base Nano Banana"
            body={{}}
            className="btn-secondary w-full"
            successMessage="Imagem base em processamento"
          />
          {campaign.baseImageExternalJobId ? (
            <ActionButton
              endpoint={`/api/campaigns/${campaign.id}/base-image/refresh`}
              label="Forcar atualizacao da imagem base"
              body={{}}
              className="btn-secondary w-full"
              successMessage="Status da imagem base atualizado"
            />
          ) : null}
          <ActionButton
            endpoint={`/api/campaigns/${campaign.id}/script/generate`}
            label="3. Gerar roteiro comercial"
            body={{}}
            className="btn w-full"
            successMessage="Roteiro em processamento"
          />
          {script ? (
            <ActionButton
              endpoint={`/api/scripts/${script.id}/frames/generate`}
              label="4. Gerar os 3 frames"
              body={{}}
              className="btn w-full"
              successMessage="Geracao de frames iniciada"
            />
          ) : null}
          {script ? (
            <ActionButton
              endpoint={`/api/scripts/${script.id}/assemble`}
              label="5. Montar video final"
              body={{}}
              className="btn w-full"
              successMessage="Montagem iniciada"
            />
          ) : null}
          {video ? (
            <ActionButton
              endpoint={`/api/videos/${video.id}/prepare-publication`}
              label="6. Preparar publicacao"
              body={{ modoVisibilidade: 'PRIVATE' }}
              className="btn-secondary w-full"
              successMessage="Publicacao preparada"
            />
          ) : null}
          {publication ? (
            <ActionButton
              endpoint={`/api/publications/${publication.id}/publish`}
              label="7. Publicar"
              body={{ publishNow: true }}
              className="btn w-full"
              successMessage="Publicacao enviada"
            />
          ) : null}
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="section-title">Objeto mestre do video</h2>
        <pre className="overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-100">
          {JSON.stringify(campaign.videoMaster, null, 2)}
        </pre>
      </section>
    </div>
  );
}

function PipelineItem({ label, status }: { label: string; status: string }) {
  return (
    <div className="pipeline-item">
      <span>{label}</span>
      <StatusBadge status={status} />
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200/80 bg-white/80 px-2.5 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 break-all text-sm text-slate-700">{value}</p>
    </div>
  );
}


