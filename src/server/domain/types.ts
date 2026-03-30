import { FrameObjective } from '@prisma/client';

export type ScriptFrameDraft = {
  ordem: 1 | 2 | 3;
  objetivo: FrameObjective;
  fala: string;
  promptVideo: string;
  duracaoSegundos: number;
};

export type StructuredScriptDraft = {
  titulo: string;
  idioma: string;
  legendaFinal: string;
  marketingScript: string;
  visualStyle: string;
  campaignTone: string;
  sceneDirection: string;
  hashtags: string[];
  frames: [ScriptFrameDraft, ScriptFrameDraft, ScriptFrameDraft];
};

