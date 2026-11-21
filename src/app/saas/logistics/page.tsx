import Link from 'next/link';
import { redirect } from 'next/navigation';
import { pageSession } from '@/lib/saas-page';
import { canReadLogistics, canWriteLogistics, listCustomers, listShipments } from '@/lib/saas-logistics';
import Unavailable from '@/components/saas/unavailable';
import LogisticsForms from '@/components/saas/logistics-forms';
import ParcelScan from '@/components/saas/parcel-scan';

export default async function Logistics() {
  const session = await pageSession();
  if (session.status === 'anonymous') redirect('/saas/login');
  if (session.status === 'unavailable') return <Unavailable />;
  if (!canReadLogistics(session.identity)) return <p role="alert">Accès refusé</p>;
  let customers, shipments;
  try { [customers, shipments] = await Promise.all([listCustomers(session.identity), listShipments(session.identity)]); }
  catch { return <Unavailable />; }
  return <section className="space-y-6">
    <Link href="/saas" prefetch={false} className="text-teal-600 underline">Retour à mon espace</Link>
    <h1 className="text-2xl font-bold">Clients et expéditions</h1>
    <ParcelScan />
    {canWriteLogistics(session.identity) && <LogisticsForms customers={customers.map(({id,name})=>({id,name}))} />}
    <h2 className="text-xl font-semibold">Clients (100 derniers)</h2>
    {customers.length === 0 ? <p>Aucun client enregistré.</p> : <ul className="space-y-2">{customers.map(c=><li key={c.id} className="rounded border p-3">{c.name} — {c.email ?? c.phone ?? 'Sans contact'}</li>)}</ul>}
    <h2 className="text-xl font-semibold">Expéditions (100 dernières)</h2>
    {shipments.length === 0 ? <p>Aucune expédition enregistrée.</p> : <ul className="space-y-2">{shipments.map(s=><li key={s.id} className="rounded border p-3"><Link prefetch={false} href={'/saas/logistics/'+s.id} className="text-teal-600 underline">{s.trackingNumber}</Link><p>{s.customer.name} · {s.origin} → {s.destination} · {s.status}</p></li>)}</ul>}
  </section>;
}
