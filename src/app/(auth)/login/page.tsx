import { AuthForm } from '@/components/auth-form';
import { authDebug } from '@/server/auth/auth-observability';

export default function LoginPage() {
  authDebug('login-page:render');
  return <AuthForm />;
}
