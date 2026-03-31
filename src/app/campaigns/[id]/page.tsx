import Link from 'next/link';

import { CampaignPipelinePanel } from '@/components/campaign-pipeline-panel';
import { DeleteCampaignButton } from '@/components/delete-campaign-button';
import { StatusBadge } from '@/components/status-badge';
import { getProductTypeLabel } from '@/domain/product-types';
import { requirePageAuthenticatedUser } from '@/server/auth/require-authenticated-user';
import { CampaignService } from '@/server/modules/campaigns/campaign.service';

const campaignService = new CampaignService();

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePageAuthenticatedUser();
  const { id } = await params;
  const campaign = await campaignService.getCampaignById(user.id, id);

  const script = campaign.scripts[0] ?? null;
  const video = script?.generatedVideo ?? null;

  const scriptsCount = campaign.scripts.length;
  const framesCount = campaign.scripts.reduce((sum, item) => sum + item.frames.length, 0);
  const videosCount = campaign.scripts.reduce((sum, item) => sum + (item.generatedVideo ? 1 : 0), 0);
  const publicationsCount = campaign.scripts.reduce((sum, item) => sum + (item.generatedVideo?.publication ? 1 : 0), 0);

  return (
    <div className="space-y-6">
      <section className="card">
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Imagem original</p>
              <div className="media-frame aspect-[4/3] max-h-[300px] w-full">
                {campaign.imagePublicUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={campaign.imagePublicUrl} alt={campaign.nomeProduto} className="h-full w-full object-cover object-center" />
                ) : (
                  <div className="flex h-full items-center justify-center px-4 text-center text-sm text-on-surface-variant">
                    Sem imagem de referencia cadastrada.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Imagem base Nano Banana</p>
              <div className="media-frame aspect-[4/3] max-h-[300px] w-full">
                {campaign.baseImagePublicUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={campaign.baseImagePublicUrl} alt={`${campaign.nomeProduto} base`} className="h-full w-full object-cover object-center" />
                ) : (
                  <div className="flex h-full items-center justify-center px-4 text-center text-sm text-on-surface-variant">
                    Imagem base ainda nao gerada.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 xl:self-start">
            <div className="title-block">
              <div>
                <span className="badge-soft">Produto</span>
                <h1 className="mt-2 font-heading text-2xl font-bold text-on-surface">{campaign.nomeProduto}</h1>
                <p className="text-sm text-on-surface-variant">{getProductTypeLabel(campaign.tipoProduto)}</p>
              </div>
              <StatusBadge status={campaign.status} />
            </div>

            <div className="card-soft text-sm text-on-surface-variant">
              <p className="font-medium text-on-surface">Descricao comercial</p>
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
                <InfoItem
                  label="Gerar imagem Nano Banana"
                  value={campaign.gerarImagemBaseNanoBanana ? 'Sim' : 'Nao (step pulado)'}
                />
                <InfoItem label="Gerar roteiro com IA" value={campaign.gerarRoteiroComIa ? 'Sim' : 'Nao (manual/template)'} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href={`/campaigns/${campaign.id}/edit` as never} className="btn-secondary w-full sm:w-auto">
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>edit</span>
                Editar produto
              </Link>
              {script ? (
                <Link href={`/scripts/${script.id}`} className="btn-secondary w-full sm:w-auto">
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>description</span>
                  Ver roteiro
                </Link>
              ) : null}
              {video ? (
                <Link href={`/videos/${video.id}`} className="btn-secondary w-full sm:w-auto">
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>videocam</span>
                  Ver video
                </Link>
              ) : null}
            </div>

            <DeleteCampaignButton
              campaignId={campaign.id}
              campaignName={campaign.nomeProduto}
              scriptsCount={scriptsCount}
              framesCount={framesCount}
              videosCount={videosCount}
              publicationsCount={publicationsCount}
              redirectTo="/campaigns"
              className="btn-danger w-full"
            />
          </div>
        </div>
      </section>

      <CampaignPipelinePanel campaignId={campaign.id} initialCampaign={campaign} />

      <section className="card space-y-3">
        <h2 className="section-title">Objeto mestre do video</h2>
        <pre className="system-console">
          {JSON.stringify(campaign.videoMaster, null, 2)}
        </pre>
      </section>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-outline-variant/15 bg-surface-container-low px-2.5 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-outline">{label}</p>
      <p className="mt-1 break-all text-sm text-on-surface">{value}</p>
    </div>
  );
}
