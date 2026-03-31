'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { showToast } from '@/utils/toast';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation('auth');
  const { t: tc } = useTranslation('common');

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
        message: data?.error?.message ?? t('loginError')
      });
      setLoading(false);
      return;
    }

    showToast({
      type: 'success',
      message: t('loginSuccess')
    });
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="login-mesh-bg flex min-h-screen flex-col">
      <main className="flex flex-grow items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div
            className="rounded-[2rem] border border-outline-variant/15 p-8 shadow-2xl md:p-12"
            style={{
              background: 'rgba(28, 37, 62, 0.6)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)'
            }}
          >
            <div className="mb-10 text-center">
              <h1 className="mb-2 font-heading text-3xl font-bold tracking-tight text-on-surface">
                {t('welcomeBack')}
              </h1>
              <p className="text-sm text-on-surface-variant">
                {t('subtitle')}
              </p>
            </div>

            <div className="mb-8 grid grid-cols-2 gap-4">
              <button
                type="button"
                className="group flex items-center justify-center gap-3 rounded-xl border border-outline-variant/20 bg-surface-container-high px-4 py-3 transition-all duration-300 hover:border-primary/50 hover:bg-surface-bright"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-sm font-semibold text-on-surface">{t('google')}</span>
              </button>
              <button
                type="button"
                className="group flex items-center justify-center gap-3 rounded-xl border border-outline-variant/20 bg-surface-container-high px-4 py-3 transition-all duration-300 hover:border-primary/50 hover:bg-surface-bright"
              >
                <svg className="h-5 w-5 fill-on-surface" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05 1.72-3.21 1.72-1.12 0-1.48-.68-2.81-.68-1.33 0-1.74.67-2.81.68-1.14 0-2.31-.86-3.32-1.85-2.07-2.01-3.61-5.69-3.61-8.9 0-3.22 1.68-5.11 3.29-5.11 1.11 0 2.04.68 2.82.68.79 0 1.83-.73 3.12-.73 1.05 0 2.22.51 3.01 1.32-2.12 1.34-1.76 4.31.42 5.29-1.01 2.37-2.45 4.83-4.14 6.58zM12.03 7.25c-.21-2.22 1.58-4.32 3.65-4.53.29 2.45-2.13 4.6-3.65 4.53z" />
                </svg>
                <span className="text-sm font-semibold text-on-surface">{t('apple')}</span>
              </button>
            </div>

            <div className="relative mb-8 flex items-center">
              <div className="flex-grow border-t border-outline-variant/15" />
              <span className="mx-4 flex-shrink-0 text-xs font-semibold uppercase tracking-widest text-outline">
                {t('orEmail')}
              </span>
              <div className="flex-grow border-t border-outline-variant/15" />
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="login-email" className="ml-1 block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  {t('emailAddress')}
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={t('emailPlaceholder')}
                  className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3.5 text-on-surface placeholder:text-outline transition-all focus:border-primary-dim focus:outline-none focus:ring-1 focus:ring-primary-dim/30"
                />
              </div>

              <div className="space-y-2">
                <div className="ml-1 flex items-center justify-between">
                  <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    {t('password')}
                  </label>
                  <button type="button" className="text-xs font-semibold text-primary transition-colors hover:text-secondary-fixed">
                    {t('forgotPassword')}
                  </button>
                </div>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={t('passwordPlaceholder')}
                  className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3.5 text-on-surface placeholder:text-outline transition-all focus:border-primary-dim focus:outline-none focus:ring-1 focus:ring-primary-dim/30"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-xl bg-gradient-to-r from-primary to-primary-container py-4 font-bold text-on-primary shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[0.98] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? t('signingIn') : t('signIn')}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs text-on-surface-variant">
                {t('termsText')}{' '}
                <a href="#" className="text-on-surface underline underline-offset-4 transition-colors hover:text-primary">
                  {t('terms')}
                </a>{' '}
                {t('and')}{' '}
                <a href="#" className="text-on-surface underline underline-offset-4 transition-colors hover:text-primary">
                  {t('privacyPolicy')}
                </a>.
              </p>
            </div>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 opacity-40">
            <div className="h-px w-12 bg-outline-variant/30" />
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-outline" style={{ fontSize: '24px' }}>security</span>
              <span className="material-symbols-outlined text-outline" style={{ fontSize: '24px' }}>verified_user</span>
              <span className="material-symbols-outlined text-outline" style={{ fontSize: '24px' }}>lock</span>
            </div>
            <div className="h-px w-12 bg-outline-variant/30" />
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-[#41475b]/15 bg-[#070d1f]">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-12 py-10 md:flex-row">
          <div className="flex flex-col gap-2">
            <span className="text-xl font-bold text-slate-200">{tc('brand')}</span>
            <p className="text-sm text-slate-500">
              {tc('footer.copyright')} {t('tagline')}.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a href="#" className="text-sm text-slate-500 transition-colors hover:text-white">{tc('footer.privacy')}</a>
            <a href="#" className="text-sm text-slate-500 transition-colors hover:text-white">{tc('footer.terms')}</a>
            <a href="#" className="text-sm text-slate-500 transition-colors hover:text-white">{tc('footer.security')}</a>
            <a href="#" className="text-sm text-slate-500 transition-colors hover:text-white">{tc('footer.status')}</a>
            <a href="#" className="text-sm text-slate-500 transition-colors hover:text-white">{tc('footer.apiDocs')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
