import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import commonPtBR from './locales/pt-BR/common.json';
import authPtBR from './locales/pt-BR/auth.json';
import dashboardPtBR from './locales/pt-BR/dashboard.json';
import productPtBR from './locales/pt-BR/product.json';
import pipelinePtBR from './locales/pt-BR/pipeline.json';
import landingPtBR from './locales/pt-BR/landing.json';

import commonEnUS from './locales/en-US/common.json';
import authEnUS from './locales/en-US/auth.json';
import dashboardEnUS from './locales/en-US/dashboard.json';
import productEnUS from './locales/en-US/product.json';
import pipelineEnUS from './locales/en-US/pipeline.json';
import landingEnUS from './locales/en-US/landing.json';

export const defaultNS = 'common';
export const supportedLanguages = ['pt-BR', 'en-US'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const languageLabels: Record<SupportedLanguage, string> = {
  'pt-BR': 'Portugues (BR)',
  'en-US': 'English (US)'
};

const resources = {
  'pt-BR': {
    common: commonPtBR,
    auth: authPtBR,
    dashboard: dashboardPtBR,
    product: productPtBR,
    pipeline: pipelinePtBR,
    landing: landingPtBR
  },
  'en-US': {
    common: commonEnUS,
    auth: authEnUS,
    dashboard: dashboardEnUS,
    product: productEnUS,
    pipeline: pipelineEnUS,
    landing: landingEnUS
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt-BR',
    defaultNS,
    ns: ['common', 'auth', 'dashboard', 'product', 'pipeline', 'landing'],
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'viralfly-language',
      caches: ['localStorage']
    }
  });

export default i18n;
