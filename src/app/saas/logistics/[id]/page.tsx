import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { pageSession } from '@/lib/saas-page';
import { canReadLogistics, canWriteLogistics, getShipment, LogisticsError, listMissions, listCollectors } from '@/lib/saas-logistics';
import Unavailable from '@/components/saas/unavailable';
import ShipmentUpdateForm from '@/components/saas/shipment-update-form';
import ParcelForm from '@/components/saas/parcel-form';
import ParcelLabel from '@/components/saas/parcel-label';
import MissionForm from '@/components/saas/mission-form';
import MissionAction from '@/components/saas/mission-action';

export default async function ShipmentDetail({params}: {params:Promise<{id:string}>}) {
  const session = await pageSession();
  if (session.status === 'anonymous') redirect('/saas/login');
  if (session.status === 'unavailable') return <Unavailable />;
  if (!canReadLogistics(session.identity)) return <p role="alert">Accès refusé</p>;
  const {id}=await params;
  let shipment,missions,collectors;
  try {[shipment,missions,collectors]=await Promise.all([getShipment(session.identity,id),listMissions(session.identity,id),listCollectors(session.identity)]);}
  catch(error) {if(error instanceof LogisticsError && error.status===404) notFound();return <Unavailable />;}
  return <section className="space-y-4">
    <Link href="/saas/logistics" prefetch={false} className="underline text-teal-600">Retour aux expéditions</Link>
    <h1 className="text-xl font-bold">{shipment.trackingNumber}</h1>
    <p>{shipment.customer.name} · {shipment.origin} → {shipment.destination} · {shipment.status}</p>
    {canWriteLogistics(session.identity) && !missions.some(m=>m.status==='assigned') && <ShipmentUpdateForm id={id} version={shipment.version} status={shipment.status} origin={shipment.origin} destination={shipment.destination}/>}
    <h2 className="font-semibold">Missions de transport</h2>
    {canWriteLogistics(session.identity) && !missions.some(m=>m.status==='assigned') && (shipment.status==='confirmed'||shipment.status==='in_transit') && <MissionForm shipmentId={id} version={shipment.version} kind={shipment.status==='confirmed'?'pickup':'delivery'} collectors={collectors}/>}
    {missions.map(m=><article key={m.id} className="border rounded p-3 space-y-2"><p>{m.kind==='pickup'?'Ramassage':'Livraison'} · {m.assigneeId} · {m.status}</p><p>{m.address}</p>{m.completedAt&&<p>Remise : {m.recipient} · {m.completedAt.toISOString()} · {m.note}</p>}{canWriteLogistics(session.identity)&&m.status==='assigned'&&<MissionAction id={m.id} action="cancel"/>}</article>)}
    <h2 className="font-semibold">Colis</h2>
    {canWriteLogistics(session.identity) && shipment.status==='draft' && <ParcelForm id={id} version={shipment.version}/>}
    {shipment.parcels.length===0 && <p>Aucun colis enregistré.</p>}
    <ul className="grid gap-3 sm:grid-cols-2">{shipment.parcels.map(parcel=><li key={parcel.id} className="border rounded p-3"><p>{parcel.description} · {parcel.weightGrams} g</p><ParcelLabel code={parcel.barcode}/></li>)}</ul>
    <h2 className="font-semibold">Historique des statuts</h2>
    <ol className="space-y-2">{shipment.events.map(event=><li key={event.id} className="border rounded p-3">{event.status} — {event.createdAt.toISOString()}</li>)}</ol>
  </section>;
}
