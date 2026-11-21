'use client';
import {useState,type FormEvent} from 'react';

type Props={kind:'create';invoices:{id:string;label:string;balance:number}[]}|{kind:'close';id:string;payments:{id:string;reference:string}[]};
const field='w-full rounded border p-2 bg-transparent';
export default function MobileIntentForm(props:Props){
  const [pending,setPending]=useState(false),[error,setError]=useState(''),[invoiceId,setInvoiceId]=useState('');
  const max=props.kind==='create'?props.invoices.find(i=>i.id===invoiceId)?.balance:undefined;
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(pending)return;
    const data=new FormData(event.currentTarget);
    const action=(event.nativeEvent as SubmitEvent).submitter?.getAttribute('value');
    const body=props.kind==='create'?{documentId:invoiceId,reference:data.get('reference'),provider:data.get('provider'),amount:Number(data.get('amount'))}:action==='cancel'?{action:'cancel'}:{action:'match',paymentId:data.get('paymentId')};
    if(props.kind==='close'&&!window.confirm(action==='cancel'?'Annuler cette demande sans modifier les règlements ?':'Associer définitivement ce règlement rapproché ?'))return;
    setPending(true);setError('');
    try{
      const response=await fetch('/api/saas/mobile-payments'+(props.kind==='close'?'/'+encodeURIComponent(props.id):''),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      if(!response.ok)throw new Error((await response.json()).error??'Erreur');
      window.location.reload();
    }catch(error){setError(error instanceof Error?error.message:'Erreur réseau');}finally{setPending(false);}
  }
  return <form method="post" onSubmit={submit} className="space-y-2 border rounded p-3">
    {props.kind==='create'?<>
      <label className="block">Facture<select required value={invoiceId} onChange={e=>setInvoiceId(e.target.value)} className={field}><option value="">Choisir</option>{props.invoices.map(i=><option key={i.id} value={i.id}>{i.label} · {i.balance.toLocaleString('fr-FR')} GNF</option>)}</select></label>
      <label className="block">Référence interne unique<input name="reference" required maxLength={100} className={field}/></label>
      <label className="block">Opérateur<select name="provider" className={field}><option value="orange_money">Orange Money</option><option value="mtn_momo">MTN Mobile Money</option></select></label>
      <label className="block">Montant attendu (GNF)<input name="amount" type="number" min={1} max={max??2000000000} required className={field}/></label>
      <button disabled={pending||!invoiceId} className="rounded bg-teal-700 text-white p-2">Créer la demande interne</button>
    </>:<>
      <label className="block">Règlement rapproché compatible<select name="paymentId" required className={field} defaultValue=""><option value="">Choisir</option>{props.payments.map(p=><option key={p.id} value={p.id}>{p.reference}</option>)}</select></label>
      <div className="flex gap-2"><button value="match" disabled={pending||props.payments.length===0} className="rounded bg-teal-700 text-white p-2">Associer</button><button value="cancel" formNoValidate disabled={pending} className="rounded border p-2">Annuler la demande</button></div>
    </>}
    {error&&<p role="alert" className="text-red-600">{error}</p>}
  </form>;
}
