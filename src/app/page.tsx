import { redirect } from 'next/navigation';

import { LandingPage } from '@/components/landing-page';
import { authDebug } from '@/server/auth/auth-observability';
import { getOptionalAuthenticatedUser } from '@/server/auth/require-authenticated-user';

export default async function HomePage() {
  authDebug('home-page:render:start');
  const user = await getOptionalAuthenticatedUser();

  if (user) {
    authDebug('home-page:redirect-dashboard');
    redirect('/dashboard');
  }

  authDebug('home-page:render-landing');
  return <LandingPage />;
}
