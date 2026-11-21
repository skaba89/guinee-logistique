import Link from 'next/link';
import {redirect} from 'next/navigation';
import {pageSession} from '@/lib/saas-page';
import {operationalFeed} from '@/lib/saas-logistics';
import Unavailable from '@/components/saas/unavailable';
export default async function Activity(){
  const session=await pageSession();
  if(session.status==='anonymous')redirect('/saas/login');
  if(session.status==='unavailable')return <Unavailable/>;
  let events;
  try{events=await operationalFeed(session.identity);}catch{return <Unavailable/>;}
  return <section className="space-y-4">
    <Link href="/saas" prefetch={false} className="underline">Retour à mon espace</Link>
    <h1 className="text-2xl font-bold">Activité opérationnelle</h1>
    <p className="text-sm">Derniers événements enregistrés. Actualisez la page pour consulter les nouvelles activités.</p>
    {events.length===0&&<p>Aucun événement accessible.</p>}
    {events.map(event=><article key={event.id} className="rounded border p-3"><h2 className="font-semibold">{event.message}</h2><p className="break-all">{event.reference}</p><p className="text-sm">{event.date.toISOString()}</p></article>)}
  </section>;
}
