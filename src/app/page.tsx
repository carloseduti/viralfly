import { redirect } from 'next/navigation';

import { getOptionalAuthenticatedUser } from '@/server/auth/require-authenticated-user';

export default async function HomePage() {
  const user = await getOptionalAuthenticatedUser();

  redirect(user ? '/dashboard' : '/login');
}
