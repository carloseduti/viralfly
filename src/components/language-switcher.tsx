'use client';

import { useTranslation } from 'react-i18next';
import { supportedLanguages, languageLabels, type SupportedLanguage } from '@/i18n/config';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common');

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const lng = event.target.value as SupportedLanguage;
    i18n.changeLanguage(lng);
  }

  return (
    <div className="sidebar-link cursor-default">
      <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>
        translate
      </span>
      <select
        value={i18n.language}
        onChange={handleChange}
        className="flex-1 bg-transparent text-sm text-on-surface-variant outline-none"
        aria-label={t('language.label')}
      >
        {supportedLanguages.map((lng) => (
          <option key={lng} value={lng} className="bg-surface-container text-on-surface">
            {languageLabels[lng]}
          </option>
        ))}
      </select>
    </div>
  );
}
