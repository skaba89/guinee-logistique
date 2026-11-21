import Link from 'next/link';
import { redirect } from 'next/navigation';
import { pageSession } from '@/lib/saas-page';
import { hasRole } from '@/lib/saas-auth';
import { canReadLogistics } from '@/lib/saas-logistics';
import LogoutButton from '@/components/saas/logout-button';
import Unavailable from '@/components/saas/unavailable';

export default async function SaaSHome() {
  const session = await pageSession();
  if (session.status === 'anonymous') redirect('/saas/login');
  if (session.status === 'unavailable') return <Unavailable />;
  const { identity } = session;
  return <section className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-2xl font-bold">Bienvenue, {identity.displayName}</h1><LogoutButton />
    </div>
    <dl className="rounded-xl border p-5 space-y-2">
      <dt className="text-sm text-slate-500">Organisation</dt><dd>{identity.organizationId}</dd>
      <dt className="text-sm text-slate-500">Rôle</dt><dd>{identity.role}</dd>
    </dl>
    {hasRole(identity, ['admin']) && <Link prefetch={false} className="inline-block text-teal-600 underline" href="/saas/members">Membres de l’organisation</Link>}
    {canReadLogistics(identity) && <p><Link prefetch={false} className="text-teal-600 underline" href="/saas/logistics">Clients et expéditions</Link></p>}
    {identity.role==='client' && <p><Link prefetch={false} className="text-teal-600 underline" href="/saas/portal">Mes expéditions</Link></p>}
    <p className="text-sm text-slate-500">Les autres modules seront disponibles après leur migration vers les données réelles.</p>
  </section>;
}
