'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { getProductTypeLabel } from '@/domain/product-types';
import { StatusBadge } from '@/components/status-badge';

type CampaignRow = {
  id: string;
  nomeProduto: string;
  tipoProduto: string;
  status: string;
  baseImageStatus: string;
  imagePublicUrl: string | null;
  createdAt: string;
};

type ProductsContentProps = {
  campaigns: CampaignRow[];
};

export function ProductsContent({ campaigns }: ProductsContentProps) {
  const { t } = useTranslation('product');
  const { i18n } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-on-surface">{t('title')}</h1>
          <p className="mt-1 text-sm text-on-surface-variant">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className="btn-secondary">
            <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>filter_list</span>
            {t('table.actions')}
          </button>
          <Link href="/campaigns/new" className="btn">
            <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>add</span>
            {t('newProduct')}
          </Link>
        </div>
      </div>

      {/* Table Card */}
      <div className="card p-0 overflow-hidden">
        {campaigns.length === 0 ? (
          <div className="p-8 text-center text-sm text-on-surface-variant">{t('noProducts')}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('table.name')}</th>
                    <th>{t('table.category')}</th>
                    <th>{t('table.status')}</th>
                    <th>{t('table.created')}</th>
                    <th>{t('table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id}>
                      <td>
                        <Link href={`/campaigns/${campaign.id}`} className="flex items-center gap-3 group">
                          <div className="media-frame h-10 w-10 shrink-0">
                            {campaign.imagePublicUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={campaign.imagePublicUrl} alt={campaign.nomeProduto} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '1rem' }}>
                                  image
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-on-surface group-hover:text-primary transition">
                              {campaign.nomeProduto}
                            </p>
                            <p className="text-xs text-on-surface-variant">
                              PRD-{campaign.id.slice(0, 5).toUpperCase()}
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td>
                        <span className="badge-soft">{getProductTypeLabel(campaign.tipoProduto)}</span>
                      </td>
                      <td>
                        <StatusBadge status={campaign.status} />
                      </td>
                      <td className="text-sm text-on-surface-variant">
                        {new Date(campaign.createdAt).toLocaleDateString(i18n.language)}
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/campaigns/${campaign.id}`}
                            className="btn-ghost p-1.5"
                            title="Pipeline"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>
                              account_tree
                            </span>
                          </Link>
                          <Link
                            href={`/campaigns/${campaign.id}/edit`}
                            className="btn-ghost p-1.5"
                            title={t('table.actions')}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>
                              more_vert
                            </span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-outline-variant/15 px-4 py-3">
              <p className="text-sm text-on-surface-variant">
                {t('pagination.showing', { from: 1, to: campaigns.length, total: campaigns.length })}
              </p>
              <div className="flex items-center gap-1">
                <button type="button" className="btn-ghost p-1.5" disabled>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>chevron_left</span>
                </button>
                <button type="button" className="btn-ghost bg-primary-action/10 px-3 py-1 text-xs text-primary">
                  1
                </button>
                <button type="button" className="btn-ghost p-1.5" disabled>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>chevron_right</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
