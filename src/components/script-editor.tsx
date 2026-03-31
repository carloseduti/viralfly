'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { showToast } from '@/utils/toast';

type ScriptEditorFrame = {
  id: string;
  ordem: number;
  objetivo: string;
  fala: string;
  promptVideo: string;
  status: string;
  generatedFrame: {
    status: string;
    publicUrl: string | null;
  } | null;
};

type ScriptEditorData = {
  id: string;
  marketingScript: string | null;
  frames: ScriptEditorFrame[];
  generatedVideo: {
    statusMontagem: string;
    publication: { status: string } | null;
  } | null;
};

type ScriptEditorProps = {
  script: ScriptEditorData;
};

export function ScriptEditor({ script }: ScriptEditorProps) {
  const router = useRouter();
  const [marketingScript, setMarketingScript] = useState(script.marketingScript ?? '');
  const [frames, setFrames] = useState(
    script.frames.map((frame) => ({
      id: frame.id,
      ordem: frame.ordem,
      objetivo: frame.objetivo,
      fala: frame.fala,
      promptVideo: frame.promptVideo
    }))
  );
  const [loading, setLoading] = useState(false);

  const hasGeneratedArtifacts = useMemo(() => {
    const frameGenerated = script.frames.some((frame) => frame.generatedFrame?.status === 'GENERATED');
    const videoGenerated = script.generatedVideo?.statusMontagem === 'GENERATED';
    return frameGenerated || videoGenerated;
  }, [script.frames, script.generatedVideo?.statusMontagem]);

  function updateFrameValue(index: number, field: 'fala' | 'promptVideo', value: string) {
    setFrames((current) => current.map((frame, frameIndex) => (frameIndex === index ? { ...frame, [field]: value } : frame)));
  }

  async function handleSave() {
    setLoading(true);

    try {
      const response = await fetch(`/api/scripts/${script.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marketingScript,
          frames: frames.map((frame) => ({
            id: frame.id,
            fala: frame.fala,
            promptVideo: frame.promptVideo
          }))
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        showToast({ type: 'error', message: payload?.error?.message ?? 'Falha ao salvar roteiro' });
        return;
      }

      showToast({ type: 'success', message: 'Roteiro salvo. Frames e video precisam ser regenerados.' });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card space-y-4">
      <div className="title-block">
        <h2 className="section-title">Editar roteiro</h2>
        <button type="button" className="btn" disabled={loading} onClick={handleSave}>
          {loading ? 'Salvando...' : 'Salvar alteracoes'}
        </button>
      </div>

      {hasGeneratedArtifacts ? (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-300">
          Este roteiro ja possui frames/video gerados. Ao salvar, as etapas posteriores serao invalidadas e exigirao regeneracao.
        </div>
      ) : null}

      <label className="block text-sm font-medium">
        Fala mestre / script comercial
        <textarea
          className="input mt-1 min-h-24"
          value={marketingScript}
          onChange={(event) => setMarketingScript(event.currentTarget.value)}
          placeholder="Descreva a narrativa comercial completa do video"
        />
      </label>

      <div className="space-y-3">
        {frames.map((frame, index) => (
          <article key={frame.id} className="card-soft space-y-3">
            <p className="text-sm font-semibold">
              Frame {frame.ordem} - {frame.objetivo}
            </p>

            <label className="block text-sm font-medium">
              Fala do frame
              <textarea
                className="input mt-1 min-h-20"
                value={frame.fala}
                onChange={(event) => updateFrameValue(index, 'fala', event.currentTarget.value)}
              />
            </label>

            <label className="block text-sm font-medium">
              Prompt visual
              <textarea
                className="input mt-1 min-h-24"
                value={frame.promptVideo}
                onChange={(event) => updateFrameValue(index, 'promptVideo', event.currentTarget.value)}
              />
            </label>
          </article>
        ))}
      </div>
    </section>
  );
}
