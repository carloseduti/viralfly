'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { showToast } from '@/utils/toast';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      showToast({
        type: 'error',
        message: data?.error?.message ?? 'Nao foi possivel fazer login'
      });
      setLoading(false);
      return;
    }

    showToast({
      type: 'success',
      message: 'Login realizado'
    });
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-5 md:grid-cols-[1.1fr_0.9fr]">
      <section className="card bg-[linear-gradient(135deg,#e6f7f8,#f9f7f1)]">
        <p className="badge-soft">Automacao de anuncios</p>
        <h1 className="mt-3 text-3xl font-semibold">Entre no painel de criacao</h1>
        <p className="mt-3 text-sm text-slate-700">
          Cadastre produtos com imagem real e gere videos comerciais em 3 frames prontos para publicacao.
        </p>
      </section>

      <form onSubmit={onSubmit} className="card space-y-4">
        <h2 className="text-xl font-semibold">Login administrativo</h2>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Senha</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn w-full" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
