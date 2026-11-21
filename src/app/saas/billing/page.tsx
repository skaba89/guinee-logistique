import Link from 'next/link';
import {redirect} from 'next/navigation';
import {pageSession} from '@/lib/saas-page';
import {canManageFinance,listCustomers} from '@/lib/saas-logistics';
import {billingOverview} from '@/lib/saas-billing';
import BillingForm from '@/components/saas/billing-form';
import ReconciliationForm from '@/components/saas/reconciliation-form';
import Unavailable from '@/components/saas/unavailable';
const gnf=(value:number|string)=>BigInt(value).toLocaleString('fr-FR')+' GNF';
export default async function Billing(){
  const session=await pageSession();
  if(session.status==='anonymous')redirect('/saas/login');
  if(session.status==='unavailable')return <Unavailable/>;
  if(!canManageFinance(session.identity))return <p role="alert">Accès financier refusé</p>;
  let overview,customers;
  try{[overview,customers]=await Promise.all([billingOverview(session.identity),listCustomers(session.identity)]);}catch{return <Unavailable/>;}
  return <section className="space-y-5">
    <Link href="/saas" prefetch={false} className="underline">Retour à mon espace</Link>
    <h1 className="text-2xl font-bold">Gestion commerciale</h1>
    <a href="/api/saas/billing/export" download className="underline text-teal-600">Exporter les factures CSV</a>
    <Link href="/saas/billing/journal" prefetch={false} className="block underline text-teal-600">Journal financier</Link>
    <p className="text-sm">Documents internes en GNF. Les références ne constituent pas une numérotation fiscale validée.</p>
    <dl className="grid gap-3 sm:grid-cols-4">{([['Facturé',overview.totals.invoiced],['Encaissé',overview.totals.paid],['Avoirs',overview.totals.credited],['Reste à recevoir',overview.totals.outstanding]]).map(([label,value])=><div key={label} className="rounded border p-3"><dt>{label}</dt><dd className="font-bold">{gnf(value)}</dd></div>)}</dl>
    <BillingForm kind="quote" customers={customers.map(({id,name})=>({id,name}))}/>
    <h2 className="font-semibold">Devis et factures (100 derniers)</h2>
    {overview.documents.map(doc=><article key={doc.id} className="space-y-3 border rounded p-4">
      <h3 className="font-semibold break-all">{doc.invoiceNumber??doc.quoteNumber}</h3>
      <p>{doc.customerName}</p>
      <ul>{doc.lines.map(line=><li key={line.id}>{line.description} · {line.quantity} × {gnf(line.unitPrice)} · Taxe {gnf(line.tax)} · {gnf(line.total)}</li>)}</ul>
      <p>Sous-total : {gnf(doc.subtotal)} · Taxes : {gnf(doc.taxTotal)}</p>
      <a href={'/api/saas/billing/'+doc.id+'/pdf'} download className="underline text-teal-600">Télécharger le PDF</a>
      <p>Total : {gnf(doc.total)}{doc.status==='invoice'&&<> · Encaissé : {gnf(doc.paid)} · Avoirs : {gnf(doc.credited)} · Solde : {gnf(doc.total-doc.paid-doc.credited)}</>}</p>
      {doc.status==='quote'?<BillingForm kind="issue" id={doc.id} version={doc.version} balance={doc.total}/>:doc.paid+doc.credited<doc.total?<><BillingForm kind="payment" id={doc.id} version={doc.version} balance={doc.total-doc.paid-doc.credited}/><BillingForm kind="credit" id={doc.id} version={doc.version} balance={doc.total-doc.paid-doc.credited}/></>:<p className="text-green-700">Soldée</p>}
      {doc.payments.length>0&&<ul className="space-y-2">{doc.payments.map(p=><li key={p.id}>{p.reference} · {gnf(p.amount)} · {p.method} · {p.createdAt.toISOString()}
        {p.reconciliation?<p className="text-green-700">Rapproché manuellement · {p.reconciliation.statementReference} · {p.reconciliation.createdAt.toISOString()} · Auteur {p.reconciliation.actorId}</p>:<ReconciliationForm id={p.id} amount={p.amount}/>}
      </li>)}</ul>}
      {doc.credits.length>0&&<ul>{doc.credits.map(c=><li key={c.id}>Avoir {c.reference} · {gnf(c.amount)} · {c.reason} · {c.createdAt.toISOString()} · Auteur {c.actorId}</li>)}</ul>}
    </article>)}
  </section>;
}
