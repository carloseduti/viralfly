import Link from 'next/link';

import { ActionButton } from '@/components/action-button';
import { StatusBadge } from '@/components/status-badge';
import { requirePageAuthenticatedUser } from '@/server/auth/require-authenticated-user';
import { VideoAssemblyService } from '@/server/modules/videos/video-assembly.service';

const videoService = new VideoAssemblyService();

export default async function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePageAuthenticatedUser();
  const { id } = await params;
  const video = await videoService.getVideoById(user.id, id);

  return (
    <div className="space-y-5">
      <section className="card flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="badge-soft">Video final</p>
          <h1 className="mt-2 text-2xl font-semibold">Preview do anuncio montado</h1>
          <p className="mt-1 text-sm text-slate-600">Montagem dos 3 frames com referencia visual fixa do produto.</p>
        </div>
        <StatusBadge status={video.statusMontagem} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="card space-y-3">
          <h2 className="section-title">Player</h2>
          <div className="media-frame aspect-[9/16] max-h-[620px] w-full bg-black">
            {video.publicUrl ? (
              <video key={video.publicUrl} className="h-full w-full" controls playsInline preload="metadata">
                <source src={video.publicUrl} type="video/mp4" />
              </video>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">Video ainda nao disponivel.</div>
            )}
          </div>
          <div className="action-grid">
            <ActionButton
              endpoint={`/api/videos/${video.id}/prepare-publication`}
              label="Preparar publicacao"
              body={{ modoVisibilidade: 'PRIVATE' }}
              className="btn w-full"
              successMessage="Publicacao preparada"
            />
            {video.publication ? (
              <Link className="btn-secondary w-full" href={`/publications/${video.publication.id}`}>
                Ver publicacao
              </Link>
            ) : null}
          </div>
        </div>

        <aside className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <div className="card">
            <h2 className="section-title">Produto de referencia</h2>
            <div className="media-frame mt-3 aspect-square">
              {video.script.campaign.baseImagePublicUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={video.script.campaign.baseImagePublicUrl} alt={video.script.campaign.nomeProduto} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-500">Sem imagem</div>
              )}
            </div>
            <p className="mt-3 text-sm font-medium">{video.script.campaign.nomeProduto}</p>
            <p className="text-xs text-slate-600">{video.script.campaign.tipoProduto}</p>
            <p className="text-xs text-slate-600">Tom: {video.script.campaignTone ?? video.script.campaign.campaignTone}</p>
          </div>

          <div className="card space-y-2 text-sm text-slate-700">
            <h2 className="section-title">Status tecnico</h2>
            <p>DuraÃ§Ã£o estimada: {video.duracaoTotal ?? 0}s</p>
            <p>Public URL: {video.publicUrl ?? 'indisponivel'}</p>
            <p>Thumbnail: {video.thumbnailUrl ?? 'indisponivel'}</p>
          </div>

          <div className="card space-y-2 sm:col-span-2 xl:col-span-1">
            <h2 className="section-title">Frames usados</h2>
            {video.script.frames.map((frame) => (
              <div key={frame.id} className="pipeline-item">
                <span>
                  Frame {frame.ordem} ({frame.objetivo})
                </span>
                <StatusBadge status={frame.generatedFrame?.status ?? frame.status} />
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}


