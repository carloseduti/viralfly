'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { getProductTypeLabel } from '@/domain/product-types';
import { StatusBadge } from '@/components/status-badge';

type DashboardMetrics = {
  totalOutput: number;
  campaignCount: number;
  scriptCount: number;
  frameCount: number;
  videoCount: number;
  publicationCount: number;
};

type CampaignSummary = {
  id: string;
  nomeProduto: string;
  tipoProduto: string;
  status: string;
  createdAt: string;
};

type DashboardContentProps = {
  metrics: DashboardMetrics;
  latestCampaigns: CampaignSummary[];
};

export function DashboardContent({ metrics, latestCampaigns }: DashboardContentProps) {
  const { t } = useTranslation('dashboard');
  const { i18n } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <div className="glass-card gradient-border">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <span className="badge-soft">{t('operationPanel')}</span>
            <h1 className="mt-3 font-heading text-3xl font-bold text-on-surface">{t('heroTitle')}</h1>
            <p className="mt-2 text-sm text-on-surface-variant">{t('heroDescription')}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/campaigns/new" className="btn">
                <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>add</span>
                {t('createProduct')}
              </Link>
              <Link href="/campaigns" className="btn-secondary">
                {t('viewAllProducts')}
              </Link>
            </div>
          </div>

          {/* Lifetime Output */}
          <div className="card flex flex-col items-center justify-center text-center">
            <p className="text-sm text-on-surface-variant">{t('lifetimeOutput')}</p>
            <p className="mt-2 font-heading text-5xl font-bold text-on-surface">
              {metrics.totalOutput.toLocaleString(i18n.language)}
            </p>
            <p className="mt-1 text-sm text-tertiary">{t('thisMonth', { percent: 24 })}</p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label={t('metrics.products')} value={metrics.campaignCount} icon="inventory_2" />
        <MetricCard label={t('metrics.scripts')} value={metrics.scriptCount} icon="description" />
        <MetricCard label={t('metrics.frames')} value={metrics.frameCount} icon="movie" />
        <MetricCard label={t('metrics.videos')} value={metrics.videoCount} icon="videocam" />
        <MetricCard label={t('metrics.publications')} value={metrics.publicationCount} icon="publish" />
      </div>

      {/* Resource Allocation + Quick Commands */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-4">
          <h2 className="section-title">{t('resourceAllocation')}</h2>
          <ResourceBar label={t('gpu')} value={84} max={100} suffix="%" />
          <ResourceBar label={t('cloudStorage')} value={2.4} max={5} suffix="TB" />
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-on-surface-variant">{t('automationCredits')}</span>
            <span className="ml-auto text-sm font-semibold text-primary">{t('remaining', { count: 420 })}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: '65%' }} />
          </div>
          <p className="text-xs text-on-surface-variant">{t('used', { percent: 65 })}</p>
        </div>

        <div className="card space-y-4">
          <h2 className="section-title">{t('quickCommands')}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <Link href="/campaigns/new" className="btn-secondary justify-center">
              <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>add</span>
              {t('createProduct')}
            </Link>
            <Link href="/campaigns" className="btn-secondary justify-center">
              <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>inventory_2</span>
              {t('viewAllProducts')}
            </Link>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="text-center">
              <p className="font-heading text-xl font-bold text-tertiary">98.4%</p>
              <p className="text-xs text-on-surface-variant">{t('efficiency')}</p>
            </div>
            <div className="text-center">
              <p className="font-heading text-xl font-bold text-primary">1,204</p>
              <p className="text-xs text-on-surface-variant">{t('videosRendered')}</p>
            </div>
            <div className="text-center">
              <p className="font-heading text-xl font-bold text-secondary">12.4m</p>
              <p className="text-xs text-on-surface-variant">{t('totalReach')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title">{t('recentProducts')}</h2>
          <Link href="/campaigns" className="text-sm font-semibold text-primary transition hover:text-primary-container">
            {t('viewAll')}
          </Link>
        </div>
        {latestCampaigns.length === 0 ? (
          <div className="card-soft text-sm text-on-surface-variant">{t('noProducts')}</div>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {latestCampaigns.map((campaign) => (
              <Link key={campaign.id} href={`/campaigns/${campaign.id}`} className="pipeline-item group">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest">
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '1.125rem' }}>
                      inventory_2
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="block truncate text-sm font-medium text-on-surface group-hover:text-primary">
                      {campaign.nomeProduto}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {getProductTypeLabel(campaign.tipoProduto)}
                    </span>
                  </div>
                </div>
                <StatusBadge status={campaign.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="card flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest">
        <span className="material-symbols-outlined text-primary" style={{ fontSize: '1.25rem' }}>
          {icon}
        </span>
      </div>
      <div>
        <p className="text-xs text-on-surface-variant">{label}</p>
        <p className="font-heading text-xl font-bold text-on-surface">{value}</p>
      </div>
    </div>
  );
}

function ResourceBar({ label, value, max, suffix }: { label: string; value: number; max: number; suffix: string }) {
  const percent = Math.round((value / max) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-on-surface-variant">{label}</span>
        <span className="font-medium text-on-surface">
          {value}{suffix} / {max}{suffix}
        </span>
      </div>
      <div className="progress-bar mt-1.5">
        <div
          className={`progress-bar-fill ${percent > 80 ? 'progress-bar-error' : ''}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
