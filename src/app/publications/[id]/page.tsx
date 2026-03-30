import { ActionButton } from '@/components/action-button';
import { StatusBadge } from '@/components/status-badge';
import { requirePageAuthenticatedUser } from '@/server/auth/require-authenticated-user';
import { PublicationService } from '@/server/modules/publications/publication.service';

const publicationService = new PublicationService();

export default async function PublicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePageAuthenticatedUser();
  const { id } = await params;
  const publication = await publicationService.getPublicationById(user.id, id);

  return (
    <div className="space-y-5">
      <section className="card flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="badge-soft">Publicacao automatizada</p>
          <h1 className="mt-2 text-2xl font-semibold">Envio para TikTok</h1>
          <p className="mt-1 text-sm text-slate-600">{'Fluxo: initialize -> upload media -> status final.'}</p>
        </div>
        <StatusBadge status={publication.status} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="card space-y-2 text-sm text-slate-700">
          <p>
            <strong>Legenda:</strong> {publication.legendaPublicacao}
          </p>
          <p>
            <strong>Hashtags:</strong> {publication.hashtagsPublicacao.join(' ')}
          </p>
          <p>
            <strong>Modo:</strong> {publication.modoVisibilidade}
          </p>
          <p>
            <strong>Provider Post ID:</strong> {publication.providerPostId ?? 'ainda nao enviado'}
          </p>
          <p>
            <strong>Creator ID:</strong> {publication.creatorTikTokId ?? 'nao disponivel'}
          </p>
          {publication.erro ? (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-rose-700">
              <strong>Erro:</strong> {publication.erro}
            </p>
          ) : null}
        </div>

        <div className="card space-y-3">
          <h2 className="section-title">Acao de publicacao</h2>
          <ActionButton
            endpoint={`/api/publications/${publication.id}/publish`}
            label="Publicar no TikTok"
            body={{ publishNow: true }}
            className="btn w-full"
            successMessage="Publicacao enviada para processamento"
          />
        </div>
      </section>
    </div>
  );
}


