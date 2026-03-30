import type { Metadata } from 'next';
import Link from 'next/link';
import { Space_Grotesk, Source_Sans_3 } from 'next/font/google';

import '@/app/globals.css';
import { LogoutButton } from '@/components/logout-button';
import { ToastCenter } from '@/components/toast-center';
import { getOptionalAuthenticatedUser } from '@/server/auth/require-authenticated-user';

const headingFont = Space_Grotesk({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['500', '600', '700']
});

const bodyFont = Source_Sans_3({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: 'ViralFly Admin',
  description: 'Geracao de anuncios em video com 3 frames usando imagem do produto como referencia principal.'
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getOptionalAuthenticatedUser();

  return (
    <html lang="pt-BR">
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>
        <div className="page-shell">
          <header className="topbar">
            <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3 sm:gap-4 sm:py-4">
              <div>
                <p className="brand-title">ViralFly</p>
                <p className="brand-subtitle">1 video final = 3 frames (HOOK, BENEFICIO, CTA)</p>
              </div>
              {user ? (
                <nav className="flex w-full flex-wrap items-center gap-2 text-sm sm:w-auto sm:justify-end">
                  <Link className="btn-ghost" href="/dashboard">
                    Dashboard
                  </Link>
                  <Link className="btn-ghost" href="/campaigns">
                    Produtos
                  </Link>
                  <LogoutButton />
                </nav>
              ) : null}
            </div>
          </header>
          <main className="container-page py-6">{children}</main>
        </div>
        <ToastCenter />
      </body>
    </html>
  );
}
