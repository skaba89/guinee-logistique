'use client';
import {useState,type FormEvent} from 'react';
type Props={shipmentId:string;version:number;kind:'pickup'|'delivery';collectors:{accountId:string}[]};
export default function MissionForm({shipmentId,version,kind,collectors}:Props){
  const [pending,setPending]=useState(false),[error,setError]=useState('');
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();if(pending)return;
    const form=new FormData(e.currentTarget);setPending(true);setError('');
    try{
      const response=await fetch('/api/saas/shipments/'+encodeURIComponent(shipmentId)+'/missions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({assigneeId:form.get('assigneeId'),address:form.get('address'),version,kind})});
      if(!response.ok)throw new Error((await response.json()).error??'Erreur');
      window.location.reload();
    }catch(error){setError(error instanceof Error?error.message:'Erreur réseau');}finally{setPending(false);}
  }
  return <form method="post" onSubmit={submit} className="border rounded p-4 space-y-3">
    <h3 className="font-semibold">Affecter une mission de {kind==='pickup'?'ramassage':'livraison'}</h3>
    <label className="block">Ramasseur<select className="w-full border rounded p-2 bg-transparent" name="assigneeId" required defaultValue=""><option value="" disabled>Choisir un compte</option>{collectors.map(c=><option key={c.accountId} value={c.accountId}>{c.accountId}</option>)}</select></label>
    <label className="block">Adresse<input name="address" maxLength={300} required className="w-full border rounded p-2 bg-transparent"/></label>
    <button disabled={pending||!collectors.length} className="rounded p-2 bg-teal-700 text-white">Affecter</button>
    {error&&<p role="alert" className="text-red-600">{error}</p>}
  </form>;
}
