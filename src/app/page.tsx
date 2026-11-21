import { redirect } from 'next/navigation';
import DemoApp from '@/components/cargo/demo-app';
import { saasRequested } from '@/lib/saas-auth-http';

export const dynamic = 'force-dynamic';

export default function Home() {
  if (saasRequested()) redirect('/saas');
  return <DemoApp />;
}
