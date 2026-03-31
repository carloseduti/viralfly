'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { DEFAULT_PRODUCT_TYPE, PRODUCT_TYPE_OPTIONS } from '@/domain/product-types';
import { showToast } from '@/utils/toast';

type CampaignFormInitialValues = {
  id?: string;
  nomeProduto?: string;
  tipoProduto?: string;
  gerarImagemBaseNanoBanana?: boolean;
  gerarRoteiroComIa?: boolean;
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
  const [nanoBananaEnabled, setNanoBananaEnabled] = useState(initialValues?.gerarImagemBaseNanoBanana ?? true);
  const [scriptAiEnabled, setScriptAiEnabled] = useState(initialValues?.gerarRoteiroComIa ?? true);
  const router = useRouter();
  const { t } = useTranslation('product');

  const isEdit = mode === 'edit';
  const title = isEdit ? t('form.editTitle') : t('form.createTitle');

  const subtitle = useMemo(
    () => (isEdit ? t('form.editSubtitle') : t('form.createSubtitle')),
    [isEdit, t]
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const imageFile = formData.get('image');

    if (!isEdit && !(imageFile instanceof File && imageFile.size > 0)) {
      showToast({ type: 'error', message: t('form.imageError') });
      setLoading(false);
      return;
    }

    const endpoint = isEdit ? `/api/campaigns/${initialValues?.id}` : '/api/campaigns';
    const method = isEdit ? 'PATCH' : 'POST';

    const response = await fetch(endpoint, { method, body: formData });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      showToast({ type: 'error', message: data?.error?.message ?? t('form.saveError') });
      setLoading(false);
      return;
    }

    const data = await response.json();
    if (!isEdit) {
      await fetch(`/api/campaigns/${data.data.id}/pipeline/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoStart: true })
      }).catch(() => null);
    }

    showToast({
      type: 'success',
      message: isEdit ? t('form.editSuccess') : t('form.createSuccess')
    });
    router.push(`/campaigns/${data.data.id}`);
    router.refresh();
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
  }

  return (
    <form className="mx-auto max-w-5xl space-y-6" onSubmit={onSubmit}>
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-on-surface">{title}</h1>
        <p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Left Column - Form Fields */}
        <div className="space-y-6">
          {/* Product Information */}
          <div className="card space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-on-surface">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '1.125rem' }}>info</span>
              {t('form.productName')}
            </h2>

            <label className="block text-sm font-medium text-on-surface-variant">
              {t('form.productName')}
              <input className="input mt-1.5" name="nomeProduto" defaultValue={initialValues?.nomeProduto} required />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-on-surface-variant">
                {t('form.price')}
                <input className="input mt-1.5" name="valor" placeholder="R$ 0,00" />
              </label>

              <label className="block text-sm font-medium text-on-surface-variant">
                {t('form.productType')}
                <select
                  className="input mt-1.5"
                  name="tipoProduto"
                  defaultValue={initialValues?.tipoProduto ?? DEFAULT_PRODUCT_TYPE}
                  required
                >
                  {PRODUCT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block text-sm font-medium text-on-surface-variant">
              {t('form.description')}
              <textarea
                className="input mt-1.5 min-h-24"
                name="descricaoProduto"
                defaultValue={initialValues?.descricaoProduto}
                placeholder={t('form.descriptionPlaceholder')}
              />
            </label>
          </div>

          {/* Campaign Configuration */}
          <div className="card space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-on-surface">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '1.125rem' }}>tune</span>
              {t('form.campaignTone')}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-on-surface-variant">
                {t('form.cta')}
                <input className="input mt-1.5" name="ctaPreferido" defaultValue={initialValues?.ctaPreferido ?? 'Compre agora'} />
              </label>

              <label className="block text-sm font-medium text-on-surface-variant">
                {t('form.language')}
                <input className="input mt-1.5" name="idioma" defaultValue={initialValues?.idioma ?? 'pt-BR'} />
              </label>
            </div>

            <label className="block text-sm font-medium text-on-surface-variant">
              {t('form.campaignTone')}
              <input className="input mt-1.5" name="campaignTone" defaultValue={initialValues?.campaignTone ?? 'Persuasivo direto'} />
            </label>
          </div>

          {/* Creative Direction */}
          <div className="card space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-on-surface">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '1.125rem' }}>palette</span>
              {t('form.visualStyle')}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-on-surface-variant">
                {t('form.visualStyle')}
                <input className="input mt-1.5" name="estiloVisual" defaultValue={initialValues?.estiloVisual ?? 'UGC comercial'} />
              </label>

              <label className="block text-sm font-medium text-on-surface-variant">
                {t('form.sceneDirection')}
                <input
                  className="input mt-1.5"
                  name="sceneDirection"
                  defaultValue={initialValues?.sceneDirection ?? 'Narrativa comercial unica do inicio ao fim'}
                />
              </label>
            </div>
          </div>

          {/* AI Automation */}
          <div className="card space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-on-surface">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '1.125rem' }}>auto_awesome</span>
              {t('form.automation')}
            </h2>

            <label className="flex items-center justify-between gap-3">
              <span className="text-sm text-on-surface-variant">{t('form.generateNanoBanana')}</span>
              <button
                type="button"
                className="toggle-switch"
                data-active={nanoBananaEnabled}
                onClick={() => setNanoBananaEnabled(!nanoBananaEnabled)}
              >
                <span className="toggle-switch-dot" />
              </button>
              <input type="hidden" name="gerarImagemBaseNanoBanana" value={nanoBananaEnabled ? 'on' : ''} />
            </label>

            <label className="flex items-center justify-between gap-3">
              <span className="text-sm text-on-surface-variant">{t('form.generateScript')}</span>
              <button
                type="button"
                className="toggle-switch"
                data-active={scriptAiEnabled}
                onClick={() => setScriptAiEnabled(!scriptAiEnabled)}
              >
                <span className="toggle-switch-dot" />
              </button>
              <input type="hidden" name="gerarRoteiroComIa" value={scriptAiEnabled ? 'on' : ''} />
            </label>
          </div>

          {/* Pro Tip */}
          <div className="glass-card flex items-start gap-3">
            <span className="material-symbols-outlined text-tertiary" style={{ fontSize: '1.25rem' }}>lightbulb</span>
            <div>
              <p className="text-sm font-semibold text-on-surface">{t('form.proTip')}</p>
              <p className="mt-1 text-sm text-on-surface-variant">{t('form.proTipText')}</p>
            </div>
          </div>
        </div>

        {/* Right Column - Image Upload */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-on-surface">{t('form.imageUpload')}</h2>
            <p className="text-xs text-on-surface-variant">{t('form.imageRequired')}</p>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-outline-variant/30 bg-surface-container-lowest p-8 text-center transition hover:border-primary/30">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '2.5rem' }}>
                cloud_upload
              </span>
              <p className="mt-2 text-sm font-medium text-on-surface-variant">{t('form.imageUploadHint')}</p>
              <p className="mt-1 text-xs text-outline">{t('form.imageFormats')}</p>
              <input
                className="hidden"
                type="file"
                name="image"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageChange}
              />
            </label>

            <div className="media-frame aspect-[4/5] w-full">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Preview" className="h-full max-h-[300px] w-full object-cover object-center" />
              ) : (
                <div className="flex h-full items-center justify-center px-4 text-center text-sm text-on-surface-variant">
                  {t('form.noImage')}
                </div>
              )}
            </div>

            {initialValues?.baseImagePublicUrl ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-on-surface-variant">{t('form.baseImage')}</p>
                <div className="media-frame aspect-[4/5] w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={initialValues.baseImagePublicUrl}
                    alt="Base image"
                    className="h-full max-h-[300px] w-full object-cover object-center"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button type="button" className="btn-secondary" onClick={() => router.back()}>
          {t('form.cancel')}
        </button>
        <button className="btn" type="submit" disabled={loading}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>arrow_forward</span>
          {loading ? t('form.saving') : isEdit ? t('form.saveChanges') : t('form.save')}
        </button>
      </div>
    </form>
  );
}
