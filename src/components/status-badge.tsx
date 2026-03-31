import { CampaignStatus, FrameStatus, PublicationStatus, ScriptStatus, VideoAssemblyStatus } from '@prisma/client';

const statusClasses: Record<string, string> = {
  DRAFT: 'status-draft',
  READY: 'status-ready',
  ARCHIVED: 'status-draft',
  GENERATED: 'status-success',
  SUCCESS: 'status-success',
  PENDING: 'status-pending',
  PROCESSING: 'status-processing',
  RUNNING: 'status-running',
  FAILED: 'status-failed',
  SKIPPED: 'status-skipped',
  READY_TO_PUBLISH: 'status-ready',
  PUBLISHED: 'status-success'
};

type AnyStatus = CampaignStatus | ScriptStatus | FrameStatus | VideoAssemblyStatus | PublicationStatus;

export function StatusBadge({ status }: { status: AnyStatus | string }) {
  const classes = statusClasses[status] ?? 'status-draft';

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${classes}`}>
      {status}
    </span>
  );
}
