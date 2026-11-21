import Link from 'next/link';
import {redirect} from 'next/navigation';
import {pageSession} from '@/lib/saas-page';
import {canManageFinance} from '@/lib/saas-logistics';
import {financialJournal} from '@/lib/saas-billing';
import Unavailable from '@/components/saas/unavailable';

export default async function Journal(){
  const session=await pageSession();
  if(session.status==='anonymous')redirect('/saas/login');
  if(session.status==='unavailable')return <Unavailable/>;
  if(!canManageFinance(session.identity))return <p role="alert">Accès financier refusé</p>;
  let events;
  try{events=await financialJournal(session.identity);}catch{return <Unavailable/>;}
  return <section className="space-y-4">
    <Link href="/saas/billing" prefetch={false} className="underline">Retour à la gestion commerciale</Link>
    <h1 className="text-2xl font-bold">Journal financier</h1>
    <p>100 dernières opérations. Les montants représentent les événements, pas des écritures comptables à additionner. Les auteurs historiques inconnus ne sont pas reconstitués.</p>
    {events.length===0&&<p>Aucune opération.</p>}
    <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr>{['Date (UTC)','Opération','Référence','Montant GNF','Auteur'].map(label=><th key={label} className="text-left p-2">{label}</th>)}</tr></thead>
      <tbody>{events.map(event=><tr key={event.kind+event.id} className="border-t"><td className="p-2">{event.createdAt.toISOString()}</td><td className="p-2">{event.kind}</td><td className="p-2 break-all">{event.reference}</td><td className="p-2">{event.amount.toLocaleString('fr-FR')}</td><td className="p-2">{event.actorId??'Non renseigné (historique)'}</td></tr>)}</tbody>
    </table></div>
  </section>;
}
