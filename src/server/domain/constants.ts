import { FrameObjective } from '@prisma/client';

export const REQUIRED_FRAME_COUNT = 3;
export const MAX_FRAME_DURATION_SECONDS = 8;

export const ORDER_TO_OBJECTIVE: Record<number, FrameObjective> = {
  1: FrameObjective.HOOK,
  2: FrameObjective.BENEFICIO,
  3: FrameObjective.CTA
};

