'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { showToast } from '@/utils/toast';

type ActionButtonProps = {
  endpoint: string;
  label: string;
  method?: 'POST' | 'GET' | 'PATCH';
  body?: Record<string, unknown>;
  redirectTo?: string;
  className?: string;
  successMessage?: string;
  errorMessage?: string;
};

export function ActionButton({
  endpoint,
  label,
  method = 'POST',
  body = {},
  redirectTo,
  className = 'btn',
  successMessage,
  errorMessage
}: ActionButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      className={className}
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const response = await fetch(endpoint, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: method === 'GET' ? undefined : JSON.stringify(body)
          });

          if (!response.ok) {
            const payload = await response.json().catch(() => null);
            showToast({
              type: 'error',
              message: payload?.error?.message ?? errorMessage ?? 'Falha ao executar acao'
            });
            return;
          }

          showToast({
            type: 'success',
            message: successMessage ?? 'Acao executada com sucesso'
          });

          if (redirectTo) {
            router.push(redirectTo as never);
          }
          router.refresh();
        });
      }}
      type="button"
    >
      {isPending ? 'Processando...' : label}
    </button>
  );
}
