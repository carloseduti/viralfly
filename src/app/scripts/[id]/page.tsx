import { ActionButton } from '@/components/action-button';
import { StatusBadge } from '@/components/status-badge';
import { requireAuthenticatedUser } from '@/server/auth/require-authenticated-user';
import { ScriptService } from '@/server/modules/scripts/script.service';

const scriptService = new ScriptService();

export default async function ScriptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuthenticatedUser();
  const { id } = await params;
  const script = await scriptService.getScriptById(user.id, id);

  return (
    <div className="space-y-5">
      <section className="card flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="badge-soft">Roteiro comercial</p>
          <h1 className="mt-2 text-2xl font-semibold">{script.titulo}</h1>
          <p className="mt-1 text-sm text-slate-600">Estrutura fixa: Frame 1 Hook, Frame 2 Beneficio, Frame 3 CTA.</p>
        </div>
        <StatusBadge status={script.status} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.7fr_1.3fr]">
        <div className="card space-y-3">
          <h2 className="section-title">Referencia visual do produto</h2>
          <div className="media-frame aspect-[4/3] max-h-[300px]">
            {script.campaign.baseImagePublicUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={script.campaign.baseImagePublicUrl} alt={script.campaign.nomeProduto} className="h-full w-full object-cover object-center" />
            ) : (
              <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500">
                Imagem base ausente. Nao e possivel gerar frames sem a etapa Nano Banana.
              </div>
            )}
          </div>
          <div className="text-sm text-slate-700">
            <p>Produto: {script.campaign.nomeProduto}</p>
            <p>Tipo: {script.campaign.tipoProduto}</p>
            <p>Estilo: {script.visualStyle ?? script.campaign.estiloVisual}</p>
            <p>Tom: {script.campaignTone ?? script.campaign.campaignTone}</p>
          </div>
          <div className="card-soft text-xs text-slate-700">
            <p className="font-semibold">Roteiro mestre</p>
            <p className="mt-1">{script.marketingScript ?? 'Roteiro mestre nao registrado.'}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="card action-grid">
            <ActionButton
              endpoint={`/api/scripts/${script.id}/frames/generate`}
              label="Gerar os 3 frames"
              body={{}}
              className="btn w-full"
              successMessage="Frames em processamento"
            />
            <ActionButton
              endpoint={`/api/scripts/${script.id}/assemble`}
              label="Montar video final"
              body={{}}
              className="btn-secondary w-full"
              successMessage="Montagem iniciada"
            />
          </div>

          {script.frames.map((frame) => (
            <article key={frame.id} className="card space-y-3">
              <div className="title-block">
                <p className="font-semibold">
                  Frame {frame.ordem} - {frame.objetivo}
                </p>
                <StatusBadge status={frame.generatedFrame?.status ?? frame.status} />
              </div>
              <div className="grid gap-2 text-sm text-slate-700">
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
                <p className="text-xs text-slate-600">
                  A imagem base publicitaria gerada pelo Nano Banana e a referencia principal deste frame.
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
