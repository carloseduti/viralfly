import { redirect } from 'next/navigation';

import { authDebug } from '@/server/auth/auth-observability';
import { getOptionalAuthenticatedUser } from '@/server/auth/require-authenticated-user';

export default async function HomePage() {
  authDebug('home-page:render:start');
  const user = await getOptionalAuthenticatedUser();
  authDebug('home-page:redirect-decision', { redirectTo: user ? '/dashboard' : '/login' });

  redirect(user ? '/dashboard' : '/login');
}
