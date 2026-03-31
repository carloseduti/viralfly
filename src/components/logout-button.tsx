'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export function LogoutButton() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { t } = useTranslation('common');

  return (
    <button
      type="button"
      className="sidebar-link w-full"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await fetch('/api/auth/logout', {
            method: 'POST'
          });
          router.push('/login');
          router.refresh();
        });
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>
        logout
      </span>
      {pending ? t('actions.loading') : t('nav.logOut')}
    </button>
  );
}
