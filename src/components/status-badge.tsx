import { CampaignStatus, FrameStatus, PublicationStatus, ScriptStatus, VideoAssemblyStatus } from '@prisma/client';

const colorByStatus = {
  DRAFT: 'bg-slate-200 text-slate-700',
  READY: 'bg-blue-100 text-blue-700',
  ARCHIVED: 'bg-slate-300 text-slate-700',
  GENERATED: 'bg-emerald-100 text-emerald-700',
  PENDING: 'bg-amber-100 text-amber-700',
  PROCESSING: 'bg-indigo-100 text-indigo-700',
  FAILED: 'bg-rose-100 text-rose-700',
  READY_TO_PUBLISH: 'bg-cyan-100 text-cyan-700',
  PUBLISHED: 'bg-emerald-100 text-emerald-700'
} as const;

type AnyStatus = CampaignStatus | ScriptStatus | FrameStatus | VideoAssemblyStatus | PublicationStatus;

export function StatusBadge({ status }: { status: AnyStatus | string }) {
  const classes = colorByStatus[status as keyof typeof colorByStatus] ?? 'bg-slate-100 text-slate-700';

  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${classes}`}>{status}</span>;
}
