'use client';

import { useEffect } from 'react';

export default function AuthSegmentError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[auth-segment-error]', {
      message: error.message,
      digest: error.digest
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="mx-auto max-w-md rounded-xl border border-error/30 bg-error/10 p-5 text-error">
        <h2 className="text-lg font-semibold">Erro ao carregar o login</h2>
        <p className="mt-2 text-sm text-on-surface-variant">Nao foi possivel carregar a pagina de autenticacao.</p>
        <p className="mt-2 text-xs text-outline">Digest: {error.digest ?? 'indisponivel'}</p>
        <button type="button" className="btn mt-4" onClick={reset}>
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
