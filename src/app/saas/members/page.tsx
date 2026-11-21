import Link from 'next/link';
import { redirect } from 'next/navigation';
import { pageSession } from '@/lib/saas-page';
import { organizationMembers, hasRole } from '@/lib/saas-auth';
import Unavailable from '@/components/saas/unavailable';

export default async function Members() {
  const session = await pageSession();
  if (session.status === 'anonymous') redirect('/saas/login');
  if (session.status === 'unavailable') return <Unavailable />;
  if (!hasRole(session.identity, ['admin'])) return <Denied />;
  let members;
  try { members = await organizationMembers(session.token); }
  catch { return <Unavailable />; }
  if (!members) return <Denied />;
  return <section className="space-y-5">
    <Link prefetch={false} href="/saas" className="text-teal-600 underline">Retour à mon espace</Link>
    <h1 className="text-2xl font-bold">Membres de l’organisation</h1>
    <p className="text-sm text-slate-500">Annuaire en lecture seule.</p>
    <div className="overflow-x-auto rounded-xl border"><table className="w-full text-left text-sm">
      <thead><tr className="border-b"><th className="p-3">Nom</th><th className="p-3">E-mail</th><th className="p-3">Rôle</th><th className="p-3">Statut</th></tr></thead>
      <tbody>{members.map(member => <tr key={member.accountId} className="border-b last:border-0"><td className="p-3">{member.account.displayName}</td><td className="p-3">{member.account.email}</td><td className="p-3">{member.role}</td><td className="p-3">{member.active ? 'Actif' : 'Inactif'}</td></tr>)}</tbody>
    </table></div>
  </section>;
}

function Denied() {
  return <section role="alert"><h1 className="text-xl font-semibold">Accès refusé</h1><Link prefetch={false} href="/saas" className="text-teal-600 underline">Retour à mon espace</Link></section>;
}
