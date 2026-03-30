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
    <div className="mx-auto max-w-md rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-900">
      <h2 className="text-lg font-semibold">Erro ao carregar o login</h2>
      <p className="mt-2 text-sm">Nao foi possivel carregar a pagina de autenticacao.</p>
      <p className="mt-2 text-xs">Digest: {error.digest ?? 'indisponivel'}</p>
      <button type="button" className="btn mt-4" onClick={reset}>
        Tentar novamente
      </button>
    </div>
  );
}
