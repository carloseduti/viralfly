import { ActionButton } from '@/components/action-button';
import { ScriptEditor } from '@/components/script-editor';
import { StatusBadge } from '@/components/status-badge';
import { getProductTypeLabel } from '@/domain/product-types';
import { requirePageAuthenticatedUser } from '@/server/auth/require-authenticated-user';
import { ScriptService } from '@/server/modules/scripts/script.service';

const scriptService = new ScriptService();

export default async function ScriptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePageAuthenticatedUser();
  const { id } = await params;
  const script = await scriptService.getScriptById(user.id, id);

  const referenceImage = script.campaign.baseImagePublicUrl ?? script.campaign.imagePublicUrl;

  return (
    <div className="space-y-5">
      <section className="card flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="badge-soft">Roteiro comercial</p>
          <h1 className="mt-2 text-2xl font-semibold">{script.titulo}</h1>
          <p className="mt-1 text-sm text-on-surface-variant">Edite fala e prompt visual antes de regenerar frames/video.</p>
        </div>
        <StatusBadge status={script.status} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.7fr_1.3fr]">
        <div className="card space-y-3">
          <h2 className="section-title">Referencia visual do produto</h2>
          <div className="media-frame aspect-[4/3] max-h-[300px]">
            {referenceImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={referenceImage} alt={script.campaign.nomeProduto} className="h-full w-full object-cover object-center" />
            ) : (
              <div className="flex h-full items-center justify-center px-4 text-center text-sm text-on-surface-variant">
                Imagem de referencia ausente. Atualize o produto para continuar a pipeline.
              </div>
            )}
          </div>
          <div className="text-sm text-on-surface-variant">
            <p>Produto: {script.campaign.nomeProduto}</p>
            <p>Tipo: {getProductTypeLabel(script.campaign.tipoProduto)}</p>
            <p>Estilo: {script.visualStyle ?? script.campaign.estiloVisual}</p>
            <p>Tom: {script.campaignTone ?? script.campaign.campaignTone}</p>
          </div>
          <div className="card-soft text-xs text-on-surface-variant">
            <p className="font-semibold">Roteiro mestre atual</p>
            <p className="mt-1">{script.marketingScript ?? 'Roteiro mestre nao registrado.'}</p>
          </div>

          <div className="action-grid">
            <ActionButton
              endpoint={`/api/scripts/${script.id}/frames/generate`}
              label="Regenerar frames"
              body={{ forceRegenerate: true }}
              className="btn w-full"
              successMessage="Frames em processamento"
            />
            <ActionButton
              endpoint={`/api/scripts/${script.id}/assemble`}
              label="Remontar video"
              body={{ forceRemount: true }}
              className="btn-secondary w-full"
              successMessage="Montagem iniciada"
            />
          </div>
        </div>

        <div className="space-y-3">
          <ScriptEditor
            script={{
              id: script.id,
              marketingScript: script.marketingScript,
              frames: script.frames,
              generatedVideo: script.generatedVideo
            }}
          />

          {script.frames.map((frame) => (
            <article key={frame.id} className="card space-y-3">
              <div className="title-block">
                <p className="font-semibold">
                  Frame {frame.ordem} - {frame.objetivo}
                </p>
                <StatusBadge status={frame.generatedFrame?.status ?? frame.status} />
              </div>
              <div className="grid gap-2 text-sm text-on-surface-variant">
                <p>
                  <strong>Fala:</strong> {frame.fala}
                </p>
                <p>
                  <strong>Prompt visual:</strong> <span className="break-words">{frame.promptVideo}</span>
                </p>
                <p>
                  <strong>Duracao:</strong> {frame.duracaoSegundos}s
                </p>
                <p>
                  <strong>Task ID:</strong> <span className="break-all">{frame.generatedFrame?.externalJobId ?? 'nao iniciado'}</span>
                </p>
              </div>
              <div className="action-grid">
                <ActionButton
                  endpoint={`/api/frames/${frame.id}?sync=1`}
                  method="GET"
                  label={`Atualizar status frame ${frame.ordem}`}
                  className="btn-secondary w-full"
                  successMessage={`Status do frame ${frame.ordem} atualizado`}
                />
                <ActionButton
                  endpoint={`/api/frames/${frame.id}/regenerate`}
                  label={`Regenerar frame ${frame.ordem}`}
                  body={{ force: true }}
                  className="btn-secondary w-full"
                  successMessage={`Frame ${frame.ordem} em regeneracao`}
                />
                {frame.generatedFrame?.publicUrl ? (
                  <a href={frame.generatedFrame.publicUrl} target="_blank" rel="noreferrer" className="btn-secondary w-full">
                    Abrir frame gerado
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
