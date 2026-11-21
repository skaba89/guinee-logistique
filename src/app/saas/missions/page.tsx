import Link from 'next/link';
import {redirect} from 'next/navigation';
import {pageSession} from '@/lib/saas-page';
import {listMissions} from '@/lib/saas-logistics';
import MissionAction from '@/components/saas/mission-action';
import Unavailable from '@/components/saas/unavailable';
export default async function Missions(){
  const session=await pageSession();
  if(session.status==='anonymous')redirect('/saas/login');
  if(session.status==='unavailable')return <Unavailable/>;
  if(session.identity.role!=='ramasseur')return <p role="alert">Accès refusé</p>;
  let missions;
  try{missions=await listMissions(session.identity);}catch{return <Unavailable/>;}
  return <section className="space-y-4"><Link href="/saas" prefetch={false} className="underline">Retour à mon espace</Link><h1 className="text-2xl font-bold">Mes missions</h1>
    {missions.length===0&&<p>Aucune mission affectée.</p>}
    {missions.map(m=><article key={m.id} className="rounded border p-4 space-y-2"><h2 className="font-semibold">{m.kind==='pickup'?'Ramassage':'Livraison'} · {m.shipment.trackingNumber}</h2><p>{m.address} · {m.status}</p>
      {m.status==='assigned'&&<MissionAction id={m.id} action="complete"/>}
      {m.completedAt&&<p>Remise déclarée par le ramasseur : {m.recipient} · {m.completedAt.toISOString()}</p>}
    </article>)}
  </section>;
}
