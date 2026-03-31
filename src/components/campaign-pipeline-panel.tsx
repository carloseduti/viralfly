'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { StatusBadge } from '@/components/status-badge';
import { showToast } from '@/utils/toast';

type CampaignDetailData = {
  id: string;
  scripts: Array<{
    id: string;
    status: string;
    frames: Array<{
      id: string;
      ordem: number;
      objetivo: string;
      status: string;
      generatedFrame: { status: string; publicUrl: string | null } | null;
    }>;
    generatedVideo: {
      id: string;
      statusMontagem: string;
      publication: { id: string; status: string } | null;
    } | null;
  }>;
  baseImageStatus: string;
  gerarImagemBaseNanoBanana: boolean;
  gerarRoteiroComIa: boolean;
};

type PipelineStepUiStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'SKIPPED';

type PipelineStep = {
  key: 'base-image' | 'script' | 'frames' | 'video' | 'publication';
  label: string;
  hint: string;
  status: PipelineStepUiStatus;
  icon: string;
};

type CampaignPipelinePanelProps = {
  campaignId: string;
  initialCampaign: CampaignDetailData;
};

const statusIcons: Record<PipelineStepUiStatus, string> = {
  SUCCESS: 'check_circle',
  RUNNING: 'progress_activity',
  PENDING: 'hourglass_empty',
  FAILED: 'error',
  SKIPPED: 'block'
};

export function CampaignPipelinePanel({ campaignId, initialCampaign }: CampaignPipelinePanelProps) {
  const [campaign, setCampaign] = useState<CampaignDetailData>(initialCampaign);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<Array<{ time: string; message: string; type: 'success' | 'error' | 'info' }>>([]);
  const router = useRouter();
  const { t } = useTranslation('pipeline');

  const script = campaign.scripts[0] ?? null;
  const video = script?.generatedVideo ?? null;
  const publication = video?.publication ?? null;

  const pipelineSteps = useMemo(() => buildPipelineSteps(campaign, t), [campaign, t]);
  const failedStep = pipelineSteps.find((step) => step.status === 'FAILED') ?? null;
  const isRunning = pipelineSteps.some((step) => step.status === 'RUNNING');

  const completedCount = pipelineSteps.filter((s) => s.status === 'SUCCESS' || s.status === 'SKIPPED').length;
  const progressPercent = Math.round((completedCount / pipelineSteps.length) * 100);

  useEffect(() => {
    const interval = setInterval(() => {
      void refreshCampaign();
    }, isRunning ? 2500 : 5000);

    return () => clearInterval(interval);
  }, [isRunning]);

  async function refreshCampaign() {
    const response = await fetch(`/api/campaigns/${campaignId}`, { cache: 'no-store' });
    if (!response.ok) return;

    const payload = await response.json().catch(() => null);
    if (payload?.data) {
      setCampaign(payload.data as CampaignDetailData);
    }
  }

  async function runAction(actionId: string, endpoint: string, body: Record<string, unknown> = {}) {
    setLoadingAction(actionId);
    const timestamp = new Date().toLocaleTimeString();

    try {
      setConsoleLogs((prev) => [...prev, { time: timestamp, message: `Executing: ${actionId}...`, type: 'info' }]);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const errorMsg = payload?.error?.message ?? t('actionError');
        showToast({ type: 'error', message: errorMsg });
        setConsoleLogs((prev) => [...prev, { time: timestamp, message: `FAILED: ${errorMsg}`, type: 'error' }]);
        return;
      }

      showToast({ type: 'success', message: t('pipelineUpdated') });
      setConsoleLogs((prev) => [...prev, { time: timestamp, message: `SUCCESS: ${actionId} completed`, type: 'success' }]);
      await refreshCampaign();
      router.refresh();
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <>
      {/* Pipeline Visualization */}
      <section className="card space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="section-title">{t('title')}</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-on-surface-variant">{t('globalProgress')}</span>
            <span className="font-heading text-lg font-bold text-primary">{progressPercent}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar">
          <div
            className={`progress-bar-fill ${progressPercent === 100 ? 'progress-bar-success' : ''}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Pipeline Steps */}
        <div className="pipeline-flow">
          {pipelineSteps.map((step, index) => (
            <article key={step.key} className={`pipeline-step-card pipeline-step-${step.status.toLowerCase()}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined ${
                      step.status === 'SUCCESS' ? 'text-tertiary' :
                      step.status === 'RUNNING' ? 'text-primary' :
                      step.status === 'FAILED' ? 'text-error' :
                      'text-on-surface-variant'
                    }`}
                    style={{ fontSize: '1.25rem' }}
                  >
                    {statusIcons[step.status]}
                  </span>
                  <p className="text-sm font-semibold text-on-surface">{step.label}</p>
                </div>
                <StatusBadge status={step.status} />
              </div>
              <p className="mt-2 text-xs text-on-surface-variant">{step.hint}</p>

              {step.status === 'RUNNING' ? (
                <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  <span className="pipeline-spinner" aria-hidden="true" />
                  {t('inProgress')}
                </div>
              ) : null}

              {step.status === 'FAILED' ? (
                <button
                  type="button"
                  className="btn-secondary mt-3 w-full py-1.5 text-xs"
                  disabled={loadingAction !== null}
                  onClick={() => runAction('retry', `/api/campaigns/${campaignId}/pipeline/retry`, { step: step.key })}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>refresh</span>
                  {t('rerun')}
                </button>
              ) : null}

              {index < pipelineSteps.length - 1 ? <span className="pipeline-connector" aria-hidden="true" /> : null}
            </article>
          ))}
        </div>
      </section>

      {/* Actions */}
      <section className="card space-y-4">
        <h2 className="section-title">{t('actions')}</h2>
        <div className="action-grid">
          <button
            type="button"
            className="btn w-full"
            disabled={loadingAction !== null}
            onClick={() => runAction('start', `/api/campaigns/${campaignId}/pipeline/start`, {})}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>play_arrow</span>
            {loadingAction === 'start' ? t('starting') : t('startResume')}
          </button>

          {failedStep ? (
            <button
              type="button"
              className="btn-secondary w-full"
              disabled={loadingAction !== null}
              onClick={() => runAction('retry', `/api/campaigns/${campaignId}/pipeline/retry`, { step: failedStep.key })}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>refresh</span>
              {loadingAction === 'retry' ? t('retrying') : t('retryStep', { step: failedStep.label })}
            </button>
          ) : null}

          {script ? (
            <button
              type="button"
              className="btn-secondary w-full"
              disabled={loadingAction !== null}
              onClick={() => runAction('frames', `/api/scripts/${script.id}/frames/generate`, { forceRegenerate: true })}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>movie</span>
              {loadingAction === 'frames' ? t('regenerating') : t('regenerateFrames')}
            </button>
          ) : null}

          {script ? (
            <button
              type="button"
              className="btn-secondary w-full"
              disabled={loadingAction !== null}
              onClick={() => runAction('video', `/api/scripts/${script.id}/assemble`, { forceRemount: true })}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>videocam</span>
              {loadingAction === 'video' ? t('mounting') : t('remountVideo')}
            </button>
          ) : null}

          {video ? (
            <button
              type="button"
              className="btn-secondary w-full"
              disabled={loadingAction !== null}
              onClick={() => runAction('publication', `/api/videos/${video.id}/prepare-publication`, { modoVisibilidade: 'PRIVATE' })}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>publish</span>
              {loadingAction === 'publication' ? t('preparing') : t('preparePublication')}
            </button>
          ) : null}

          {script ? (
            <Link href={`/scripts/${script.id}`} className="btn-secondary w-full justify-center text-center">
              <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>edit_note</span>
              {t('editScript')}
            </Link>
          ) : null}
        </div>

        <p className="text-xs text-on-surface-variant">{t('progressNote')}</p>

        {publication ? (
          <p className="text-xs text-on-surface-variant">{t('currentPublication', { status: publication.status })}</p>
        ) : null}
      </section>

      {/* System Console */}
      {consoleLogs.length > 0 ? (
        <section className="card space-y-3">
          <h2 className="section-title">{t('systemConsole')}</h2>
          <div className="system-console max-h-48 overflow-y-auto">
            {consoleLogs.map((log, i) => (
              <div key={i} className="console-line">
                <span className="console-timestamp">[{log.time}]</span>{' '}
                <span className={`console-${log.type}`}>{log.message}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

function mapStepStatus(value: string | null | undefined): PipelineStepUiStatus {
  if (!value) return 'PENDING';
  if (value === 'PROCESSING' || value === 'DRAFT') return 'RUNNING';
  if (value === 'GENERATED' || value === 'READY_TO_PUBLISH' || value === 'PUBLISHED' || value === 'READY') return 'SUCCESS';
  if (value === 'FAILED') return 'FAILED';
  return 'PENDING';
}

function buildPipelineSteps(campaign: CampaignDetailData, t: (key: string, options?: Record<string, unknown>) => string): PipelineStep[] {
  const script = campaign.scripts[0] ?? null;
  const video = script?.generatedVideo ?? null;
  const publication = video?.publication ?? null;

  const baseImageStep: PipelineStep = campaign.gerarImagemBaseNanoBanana
    ? {
        key: 'base-image',
        label: t('steps.baseImage'),
        hint: t('steps.baseImageHint'),
        status: mapStepStatus(campaign.baseImageStatus),
        icon: 'auto_awesome'
      }
    : {
        key: 'base-image',
        label: t('steps.baseImage'),
        hint: t('steps.baseImageSkipped'),
        status: 'SKIPPED',
        icon: 'auto_awesome'
      };

  let scriptStep: PipelineStep;
  if (campaign.gerarRoteiroComIa) {
    scriptStep = {
      key: 'script',
      label: t('steps.script'),
      hint: t('steps.scriptHint'),
      status: script ? mapStepStatus(script.status) : 'PENDING',
      icon: 'description'
    };
  } else {
    scriptStep = {
      key: 'script',
      label: t('steps.script'),
      hint: script ? t('steps.scriptManual') : t('steps.scriptSkipped'),
      status: 'SKIPPED',
      icon: 'description'
    };
  }

  const frameStatuses = script?.frames.map((frame) => frame.generatedFrame?.status ?? frame.status) ?? [];
  const framesStepStatus: PipelineStepUiStatus = (() => {
    if (!script) return 'PENDING';
    if (!frameStatuses.length) return 'PENDING';
    if (frameStatuses.some((status) => status === 'FAILED')) return 'FAILED';
    if (frameStatuses.every((status) => status === 'GENERATED')) return 'SUCCESS';
    if (frameStatuses.some((status) => status === 'PROCESSING')) return 'RUNNING';
    return 'PENDING';
  })();

  const steps: PipelineStep[] = [
    baseImageStep,
    scriptStep,
    {
      key: 'frames',
      label: t('steps.frames', { number: '1-3', objective: 'Hook → CTA' }),
      hint: script ? t('steps.framesHint', { count: script.frames.length }) : t('steps.framesWaiting'),
      status: framesStepStatus,
      icon: 'movie'
    },
    {
      key: 'video',
      label: t('steps.video'),
      hint: t('steps.videoHint'),
      status: video ? mapStepStatus(video.statusMontagem) : 'PENDING',
      icon: 'videocam'
    },
    {
      key: 'publication',
      label: t('steps.publication'),
      hint: t('steps.publicationHint'),
      status: publication ? mapStepStatus(publication.status) : 'PENDING',
      icon: 'publish'
    }
  ];

  return steps;
}
