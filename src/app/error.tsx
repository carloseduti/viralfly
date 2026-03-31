'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app-error]', {
      message: error.message,
      digest: error.digest
    });
  }, [error]);

  return (
    <div className="mx-auto max-w-xl rounded-xl border border-error/30 bg-error/10 p-5 text-error">
      <h2 className="text-lg font-semibold">Erro ao carregar a aplicacao</h2>
      <p className="mt-2 text-sm text-on-surface-variant">
        Ocorreu uma falha no carregamento server-side. Se o problema persistir, verifique os logs da Vercel.
      </p>
      <p className="mt-2 text-xs text-outline">Digest: {error.digest ?? 'indisponivel'}</p>
      <button type="button" className="btn mt-4" onClick={reset}>
        Tentar novamente
      </button>
    </div>
  );
}
