import { FrameObjective } from '@prisma/client';

import { ORDER_TO_OBJECTIVE, REQUIRED_FRAME_COUNT } from '@/server/domain/constants';
import { AppError } from '@/utils/errors';

export type FrameShape = {
  id?: string;
  ordem: number;
  objetivo: FrameObjective | string;
  duracaoSegundos: number;
  generatedFrame?: { status: string } | null;
};

export function validateThreeFrameStructure(frames: FrameShape[]) {
  if (frames.length !== REQUIRED_FRAME_COUNT) {
    throw new AppError('O roteiro deve conter exatamente 3 frames', 422);
  }

  const sorted = [...frames].sort((a, b) => a.ordem - b.ordem);

  sorted.forEach((frame, idx) => {
    const expectedOrder = idx + 1;
    const expectedObjective = ORDER_TO_OBJECTIVE[expectedOrder];

    if (frame.ordem !== expectedOrder) {
      throw new AppError('A ordem dos frames deve ser 1, 2 e 3', 422);
    }

    if (frame.objetivo !== expectedObjective) {
      throw new AppError(`Objetivo inválido para o frame ${expectedOrder}`, 422);
    }

    if (frame.duracaoSegundos < 1 || frame.duracaoSegundos > 8) {
      throw new AppError(`Frame ${expectedOrder} deve ter duracao entre 1 e 8 segundos`, 422);
    }
  });
}

export function ensureFramesGeneratedForAssembly(frames: FrameShape[]) {
  if (frames.length !== REQUIRED_FRAME_COUNT) {
    throw new AppError('Nao e possivel montar o video sem os 3 frames gerados', 422);
  }

  for (const frame of frames) {
    if (!frame.generatedFrame || frame.generatedFrame.status !== 'GENERATED') {
      throw new AppError(`Frame ${frame.ordem} ainda não foi gerado`, 422);
    }
  }
}

export function selectFramesForGeneration<T extends { id: string }>(frames: T[], frameId?: string) {
  if (!frameId) {
    return frames;
  }

  return frames.filter((frame) => frame.id === frameId);
}
