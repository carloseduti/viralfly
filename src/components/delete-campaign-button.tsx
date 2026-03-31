'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { showToast } from '@/utils/toast';

type DeleteCampaignButtonProps = {
  campaignId: string;
  campaignName: string;
  scriptsCount: number;
  framesCount: number;
  videosCount: number;
  publicationsCount: number;
  redirectTo?: string;
  className?: string;
};

export function DeleteCampaignButton({
  campaignId,
  campaignName,
  scriptsCount,
  framesCount,
  videosCount,
  publicationsCount,
  redirectTo,
  className = 'btn-danger'
}: DeleteCampaignButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation('product');

  async function handleDelete() {
    const hasPipelineData = scriptsCount + framesCount + videosCount + publicationsCount > 0;
    const message = hasPipelineData
      ? [
          t('delete.confirm', { name: campaignName }),
          '',
          `- ${scriptsCount} script(s)`,
          `- ${framesCount} frame(s)`,
          `- ${videosCount} video(s)`,
          `- ${publicationsCount} publication(s)`,
          '',
          t('delete.warning')
        ].join('\n')
      : t('delete.confirm', { name: campaignName });

    const confirmed = window.confirm(message);
    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, { method: 'DELETE' });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        showToast({
          type: 'error',
          message: payload?.error?.message ?? 'Failed to delete'
        });
        setLoading(false);
        return;
      }

      showToast({ type: 'success', message: 'Deleted successfully' });

      if (redirectTo) {
        router.push(redirectTo as never);
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" className={className} onClick={handleDelete} disabled={loading}>
      <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>delete</span>
      {loading ? '...' : t('delete.button')}
    </button>
  );
}
