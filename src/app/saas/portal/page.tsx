import Link from 'next/link';
import { redirect } from 'next/navigation';
import { pageSession } from '@/lib/saas-page';
import { portalShipments } from '@/lib/saas-logistics';
import Unavailable from '@/components/saas/unavailable';

export default async function Portal(){
  const session=await pageSession();
  if(session.status==='anonymous')redirect('/saas/login');
  if(session.status==='unavailable')return <Unavailable/>;
  if(session.identity.role!=='client')return <p role="alert">Accès refusé</p>;
  let shipments;
  try{shipments=await portalShipments(session.identity);}catch{return <Unavailable/>;}
  return <section className="space-y-5">
    <Link href="/saas" prefetch={false} className="underline text-teal-600">Retour à mon espace</Link>
    <h1 className="text-2xl font-bold">Mes expéditions</h1>
    <p>Derniers statuts enregistrés. Actualisez la page pour consulter les mises à jour.</p>
    {shipments.length===0 && <p>Aucune expédition accessible.</p>}
    {shipments.map(shipment=><article key={shipment.trackingNumber} className="rounded border p-4 space-y-3">
      <h2 className="font-semibold">{shipment.trackingNumber}</h2>
      <p>{shipment.origin} → {shipment.destination} · {shipment.status}</p>
      <h3 className="font-semibold">Colis</h3>
      <ul>{shipment.parcels.map(parcel=><li key={parcel.barcode}>{parcel.barcode} · {parcel.description} · {parcel.weightGrams} g</li>)}</ul>
      <h3 className="font-semibold">Historique</h3>
      <ol>{shipment.events.map((event,index)=><li key={index}>{event.status} · {event.createdAt.toISOString()}</li>)}</ol>
    </article>)}
  </section>;
}
