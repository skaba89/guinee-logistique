import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { pageSession } from '@/lib/saas-page';
import { canReadLogistics, canWriteLogistics, getShipment, LogisticsError } from '@/lib/saas-logistics';
import Unavailable from '@/components/saas/unavailable';
import ShipmentUpdateForm from '@/components/saas/shipment-update-form';

export default async function ShipmentDetail({params}: {params:Promise<{id:string}>}) {
  const session = await pageSession();
  if (session.status === 'anonymous') redirect('/saas/login');
  if (session.status === 'unavailable') return <Unavailable />;
  if (!canReadLogistics(session.identity)) return <p role="alert">Accès refusé</p>;
  const {id}=await params;
  let shipment;
  try {shipment=await getShipment(session.identity,id);}
  catch(error) {if(error instanceof LogisticsError && error.status===404) notFound();return <Unavailable />;}
  return <section className="space-y-4">
    <Link href="/saas/logistics" prefetch={false} className="underline text-teal-600">Retour aux expéditions</Link>
    <h1 className="text-xl font-bold">{shipment.trackingNumber}</h1>
    <p>{shipment.customer.name} · {shipment.origin} → {shipment.destination} · {shipment.status}</p>
    {canWriteLogistics(session.identity) && <ShipmentUpdateForm id={id} version={shipment.version} status={shipment.status} origin={shipment.origin} destination={shipment.destination}/>}
    <h2 className="font-semibold">Historique des statuts</h2>
    <ol className="space-y-2">{shipment.events.map(event=><li key={event.id} className="border rounded p-3">{event.status} — {event.createdAt.toISOString()}</li>)}</ol>
  </section>;
}
