'use client';

import { useTranslation } from 'react-i18next';

type TopbarProps = {
  onMenuToggle?: () => void;
};

export function Topbar({ onMenuToggle }: TopbarProps) {
  const { t } = useTranslation('common');

  return (
    <header className="topbar-dark">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button type="button" className="btn-ghost p-2 lg:hidden" onClick={onMenuToggle} aria-label="Toggle menu">
            <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>
              menu
            </span>
          </button>
          <div className="relative hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: '1.125rem' }}>
              search
            </span>
            <input
              type="text"
              placeholder={t('search')}
              className="input w-64 pl-9 lg:w-80"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" className="btn-ghost p-2" aria-label={t('notifications')}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>
              notifications
            </span>
          </button>
          <button type="button" className="btn-ghost p-2" aria-label={t('nav.helpCenter')}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>
              help
            </span>
          </button>
          <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary-action text-xs font-bold text-white">
            U
          </div>
        </div>
      </div>
    </header>
  );
}
