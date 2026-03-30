'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { showToast } from '@/utils/toast';

type CampaignFormInitialValues = {
  id?: string;
  nomeProduto?: string;
  tipoProduto?: string;
  descricaoProduto?: string;
  idioma?: string;
  ctaPreferido?: string;
  estiloVisual?: string;
  campaignTone?: string;
  sceneDirection?: string;
  imagePublicUrl?: string | null;
  baseImagePublicUrl?: string | null;
};

type CampaignFormProps = {
  mode?: 'create' | 'edit';
  initialValues?: CampaignFormInitialValues;
};

export function CampaignForm({ mode = 'create', initialValues }: CampaignFormProps) {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialValues?.imagePublicUrl ?? null);
  const router = useRouter();

  const isEdit = mode === 'edit';
  const title = isEdit ? 'Editar produto' : 'Novo produto';

  const subtitle = useMemo(
    () =>
      isEdit
        ? 'Atualize dados e imagem de referencia sem quebrar o pipeline atual.'
        : 'Cadastre nome, tipo e imagem para gerar anuncios dinamicos mantendo a identidade visual do produto.',
    [isEdit]
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const imageFile = formData.get('image');

    if (!isEdit && !(imageFile instanceof File && imageFile.size > 0)) {
      showToast({
        type: 'error',
        message: 'Imagem do produto e obrigatoria para gerar os frames'
      });
      setLoading(false);
      return;
    }

    const endpoint = isEdit ? `/api/campaigns/${initialValues?.id}` : '/api/campaigns';
    const method = isEdit ? 'PATCH' : 'POST';

    const response = await fetch(endpoint, {
      method,
      body: formData
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      showToast({
        type: 'error',
        message: data?.error?.message ?? 'Falha ao salvar produto'
      });
      setLoading(false);
      return;
    }

    const data = await response.json();
    showToast({
      type: 'success',
      message: isEdit ? 'Produto atualizado com sucesso' : 'Produto criado com sucesso'
    });
    router.push(`/campaigns/${data.data.id}`);
    router.refresh();
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }

  return (
    <form className="card mx-auto max-w-5xl space-y-5" onSubmit={onSubmit}>
      <div className="space-y-1">
        <p className="badge-soft">Cadastro de produto</p>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-slate-600">{subtitle}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-3">
          <label className="block text-sm font-medium">
            Nome do produto
            <input className="input mt-1" name="nomeProduto" defaultValue={initialValues?.nomeProduto} required />
          </label>

          <label className="block text-sm font-medium">
            Tipo do produto
            <input className="input mt-1" name="tipoProduto" defaultValue={initialValues?.tipoProduto} required />
          </label>

          <label className="block text-sm font-medium">
            Descricao comercial
            <textarea
              className="input mt-1 min-h-24"
              name="descricaoProduto"
              defaultValue={initialValues?.descricaoProduto}
              placeholder="Descreva o beneficio principal para usar no roteiro."
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              CTA preferido
              <input className="input mt-1" name="ctaPreferido" defaultValue={initialValues?.ctaPreferido ?? 'Compre agora'} />
            </label>

            <label className="block text-sm font-medium">
              Estilo visual
              <input className="input mt-1" name="estiloVisual" defaultValue={initialValues?.estiloVisual ?? 'UGC comercial'} />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Tom da campanha
              <input className="input mt-1" name="campaignTone" defaultValue={initialValues?.campaignTone ?? 'Persuasivo direto'} />
            </label>

            <label className="block text-sm font-medium">
              Direcao das cenas
              <input
                className="input mt-1"
                name="sceneDirection"
                defaultValue={initialValues?.sceneDirection ?? 'Narrativa comercial unica do inicio ao fim'}
              />
            </label>
          </div>

          <label className="block text-sm font-medium">
            Idioma
            <input className="input mt-1" name="idioma" defaultValue={initialValues?.idioma ?? 'pt-BR'} />
          </label>
        </section>

        <section className="card-soft space-y-3 lg:sticky lg:top-24 lg:self-start">
          <p className="text-sm font-semibold">Imagem de referencia do produto</p>
          <p className="text-xs text-slate-600">Obrigatoria para gerar a imagem base publicitaria antes do roteiro e dos frames.</p>

          <label className="block text-sm font-medium">
            Upload da imagem
            <input className="input mt-1" type="file" name="image" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} />
          </label>

          <div className="media-frame aspect-[4/5] w-full">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Preview do produto" className="h-full max-h-[300px] w-full object-cover object-center" />
            ) : (
              <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500">
                Nenhuma imagem enviada ainda.
              </div>
            )}
          </div>

          {initialValues?.baseImagePublicUrl ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-600">Imagem base publicitaria atual</p>
              <div className="media-frame aspect-[4/5] w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={initialValues.baseImagePublicUrl}
                  alt="Imagem base publicitaria"
                  className="h-full max-h-[300px] w-full object-cover object-center"
                />
              </div>
            </div>
          ) : null}
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <button className="btn w-full sm:w-auto" type="submit" disabled={loading}>
          {loading ? 'Salvando...' : isEdit ? 'Salvar alteracoes' : 'Criar produto'}
        </button>
      </div>
    </form>
  );
}
