import { redirect } from 'next/navigation';
import { pageSession } from '@/lib/saas-page';
import LoginForm from '@/components/saas/login-form';
import Unavailable from '@/components/saas/unavailable';

export default async function Login() {
  const session = await pageSession();
  if (session.status === 'authenticated') redirect('/saas');
  if (session.status === 'unavailable') return <Unavailable />;
  return <LoginForm />;
}
