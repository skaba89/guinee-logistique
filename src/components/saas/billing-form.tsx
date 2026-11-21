'use client';
import {useState,type FormEvent} from 'react';
type Props={kind:'quote';customers:{id:string;name:string}[]}|{kind:'issue'|'payment';id:string;version:number;balance:number};
const field='w-full border rounded p-2 bg-transparent';
export default function BillingForm(props:Props){
  const [pending,setPending]=useState(false),[error,setError]=useState('');
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();if(pending)return;
    const data=new FormData(e.currentTarget);
    let path='/api/saas/billing',body:object;
    if(props.kind==='quote')body={customerId:data.get('customerId'),description:data.get('description'),quantity:Number(data.get('quantity')),unitPrice:Number(data.get('unitPrice'))};
    else{
      path+='/'+encodeURIComponent(props.id)+(props.kind==='issue'?'/issue':'/payments');
      body=props.kind==='issue'?{version:props.version}:{reference:data.get('reference'),amount:Number(data.get('amount')),method:data.get('method'),version:props.version};
      if(!window.confirm(props.kind==='issue'?'Émettre ce document interne ?':'Enregistrer ce règlement déjà reçu ?'))return;
    }
    setPending(true);setError('');
    try{
      const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      if(!response.ok)throw new Error((await response.json()).error??'Erreur');
      window.location.reload();
    }catch(error){setError(error instanceof Error?error.message:'Erreur réseau');}finally{setPending(false);}
  }
  return <form method="post" onSubmit={submit} className="space-y-2 border rounded p-3">
    {props.kind==='quote'&&<>
      <h2 className="font-semibold">Nouveau devis</h2>
      <label className="block">Client<select name="customerId" required defaultValue="" className={field}><option value="" disabled>Choisir</option>{props.customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label className="block">Prestation<input name="description" required maxLength={300} className={field}/></label>
      <label className="block">Quantité<input name="quantity" type="number" min={1} max={100000} defaultValue={1} required className={field}/></label>
      <label className="block">Prix unitaire (GNF)<input name="unitPrice" type="number" min={1} max={2000000000} step={1} required className={field}/></label>
    </>}
    {props.kind==='payment'&&<>
      <label className="block">Référence unique du règlement<input name="reference" maxLength={100} required className={field}/></label>
      <label className="block">Montant reçu (GNF)<input name="amount" required type="number" step={1} min={1} max={props.balance} className={field}/></label>
      <label className="block">Mode<select name="method" className={field}><option value="cash">Espèces</option><option value="bank">Virement</option><option value="orange_money">Orange Money (manuel)</option><option value="mtn_momo">Mobile Money MTN (manuel)</option></select></label>
    </>}
    <button disabled={pending||(props.kind==='quote'&&!props.customers.length)} className="rounded bg-teal-700 text-white p-2">{pending?'Enregistrement…':props.kind==='quote'?'Créer le devis':props.kind==='issue'?'Convertir en facture interne':'Enregistrer le règlement'}</button>
    {error&&<p role="alert" className="text-red-600">{error}</p>}
  </form>;
}
