import Link from 'next/link';
import {redirect} from 'next/navigation';
import {pageSession} from '@/lib/saas-page';
import {canManageFinance} from '@/lib/saas-logistics';
import {mobileOverview} from '@/lib/mobile-payments';
import MobileIntentForm from '@/components/saas/mobile-intent-form';
import Unavailable from '@/components/saas/unavailable';
const labels={pending:'En attente',matched:'Rapprochée manuellement',cancelled:'Annulée'};

export default async function MobilePayments(){
  const session=await pageSession();
  if(session.status==='anonymous')redirect('/saas/login');
  if(session.status==='unavailable')return <Unavailable/>;
  if(!canManageFinance(session.identity))return <p role="alert">Accès financier refusé</p>;
  let overview;
  try{overview=await mobileOverview(session.identity);}catch{return <Unavailable/>;}
  const invoices=overview.invoices.map(i=>({id:i.id,label:i.invoiceNumber+' · '+i.customerName,balance:i.total-i.paid-i.credited})).filter(i=>i.balance>0);
  return <section className="space-y-4">
    <Link href="/saas/billing" prefetch={false} className="underline">Retour à la gestion commerciale</Link>
    <h1 className="text-2xl font-bold">Suivi Mobile Money</h1>
    <p>Mode manuel exclusivement. Aucun transfert, SMS ou appel opérateur n’est déclenché. Les demandes ne réservent pas le solde. Après réception réelle, enregistrer puis rapprocher le règlement dans la gestion commerciale avant de l’associer ici.</p>
    <MobileIntentForm kind="create" invoices={invoices}/>
    <h2 className="font-semibold">100 dernières demandes</h2>
    {overview.intents.map(i=><article key={i.id} className="space-y-2 border rounded p-3">
      <h3 className="font-semibold">{i.reference} · {labels[i.status]}</h3>
      <p>{i.document.invoiceNumber} · {i.document.customerName} · {i.provider==='orange_money'?'Orange Money':'MTN Mobile Money'} · {i.amount.toLocaleString('fr-FR')} GNF</p>
      <p className="text-sm">{i.createdAt.toISOString()} · Auteur {i.actorId}{i.closedAt&&<> · Clôture {i.closedAt.toISOString()} · {i.closedById}</>}</p>
      {i.status==='pending'&&<MobileIntentForm kind="close" id={i.id} payments={overview.payments.filter(p=>p.documentId===i.documentId&&p.amount===i.amount&&p.method===i.provider)}/>}
    </article>)}
  </section>;
}
