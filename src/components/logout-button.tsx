'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      className="btn-secondary"
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
      {pending ? 'Saindo...' : 'Sair'}
    </button>
  );
}
