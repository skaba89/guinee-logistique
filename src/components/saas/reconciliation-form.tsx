'use client';
import {useState,type FormEvent} from 'react';

export default function ReconciliationForm({id,amount}:{id:string;amount:number}){
  const [pending,setPending]=useState(false),[error,setError]=useState('');
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(pending)return;
    const data=new FormData(event.currentTarget);
    if(!window.confirm('Confirmer que le justificatif correspond au règlement ?'))return;
    setPending(true);setError('');
    try{
      const response=await fetch('/api/saas/billing/payments/'+encodeURIComponent(id)+'/reconcile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({statementReference:data.get('reference'),amount:Number(data.get('amount'))})});
      if(!response.ok)throw new Error((await response.json()).error??'Erreur');
      window.location.reload();
    }catch(error){setError(error instanceof Error?error.message:'Erreur réseau');}finally{setPending(false);}
  }
  return <form method="post" onSubmit={submit} className="space-y-2 rounded border p-2">
    <p className="text-sm">Rapprochement manuel : comparer le reçu ou relevé externe au règlement de {amount.toLocaleString('fr-FR')} GNF.</p>
    <label className="block">Référence unique du justificatif<input name="reference" required maxLength={150} className="w-full rounded border p-2 bg-transparent"/></label>
    <label className="block">Montant figurant sur le justificatif (GNF)<input name="amount" type="number" required min={1} max={2000000000} step={1} className="w-full rounded border p-2 bg-transparent"/></label>
    <button disabled={pending} className="rounded bg-teal-700 text-white p-2">{pending?'Enregistrement…':'Confirmer le rapprochement'}</button>
    {error&&<p role="alert" className="text-red-600">{error}</p>}
  </form>;
}
