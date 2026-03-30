import { describe, expect, it } from 'vitest';
import { FrameObjective } from '@prisma/client';

import {
  ensureFramesGeneratedForAssembly,
  selectFramesForGeneration,
  validateThreeFrameStructure
} from '@/server/domain/three-frame-rules';

const baseFrames = [
  { id: 'f1', ordem: 1, objetivo: FrameObjective.HOOK, duracaoSegundos: 8 },
  { id: 'f2', ordem: 2, objetivo: FrameObjective.BENEFICIO, duracaoSegundos: 8 },
  { id: 'f3', ordem: 3, objetivo: FrameObjective.CTA, duracaoSegundos: 8 }
];

describe('three-frame rules', () => {
  it('deve aceitar roteiro com exatamente 3 frames na ordem 1,2,3 e objetivo correto', () => {
    expect(() => validateThreeFrameStructure(baseFrames)).not.toThrow();
  });

  it('deve falhar quando houver menos de 3 frames', () => {
    expect(() => validateThreeFrameStructure(baseFrames.slice(0, 2))).toThrow(
      'O roteiro deve conter exatamente 3 frames'
    );
  });

  it('deve falhar quando ordem for inválida', () => {
    const invalid = [...baseFrames];
    invalid[1] = { ...invalid[1], ordem: 3 };

    expect(() => validateThreeFrameStructure(invalid)).toThrow('A ordem dos frames deve ser 1, 2 e 3');
  });

  it('deve falhar quando objetivo não corresponder à ordem', () => {
    const invalid = [...baseFrames];
    invalid[0] = { ...invalid[0], objetivo: FrameObjective.CTA };

    expect(() => validateThreeFrameStructure(invalid)).toThrow('Objetivo inválido para o frame 1');
  });

  it('deve bloquear montagem sem os 3 frames gerados', () => {
    const invalid = baseFrames.map((frame, idx) => ({
      ...frame,
      generatedFrame: { status: idx === 1 ? 'FAILED' : 'GENERATED' }
    }));

    expect(() => ensureFramesGeneratedForAssembly(invalid)).toThrow('Frame 2 ainda não foi gerado');
  });

  it('deve permitir reprocessamento isolado de frame', () => {
    const selected = selectFramesForGeneration(baseFrames, 'f2');
    expect(selected).toHaveLength(1);
    expect(selected[0].id).toBe('f2');
  });
});
