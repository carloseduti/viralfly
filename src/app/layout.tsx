import type { Metadata } from 'next';
import { Manrope, Inter } from 'next/font/google';

import '@/app/globals.css';
import { AuthenticatedLayout } from '@/components/authenticated-layout';
import { ToastCenter } from '@/components/toast-center';
import { I18nProvider } from '@/i18n/provider';
import { authDebug } from '@/server/auth/auth-observability';
import { getOptionalAuthenticatedUser } from '@/server/auth/require-authenticated-user';

const headingFont = Manrope({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800']
});

const bodyFont = Inter({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: 'Viralfly AI',
  description: 'AI-powered video automation platform. Transform product images into viral TikTok ads.'
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  authDebug('root-layout:render:start');
  const user = await getOptionalAuthenticatedUser();
  authDebug('root-layout:render:auth-resolved', { hasUser: Boolean(user?.id) });

  const isAuthenticated = Boolean(user?.id);

  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>
        <I18nProvider>
          {isAuthenticated ? (
            <AuthenticatedLayout>{children}</AuthenticatedLayout>
          ) : (
            <div className="page-shell-public">{children}</div>
          )}
          <ToastCenter />
        </I18nProvider>
      </body>
    </html>
  );
}
