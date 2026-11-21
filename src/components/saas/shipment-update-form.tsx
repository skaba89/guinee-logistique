'use client';
import { useState, type FormEvent } from 'react';

const next:Record<string,string[]>={draft:['confirmed','cancelled'],confirmed:['in_transit','cancelled'],in_transit:['delivered'],delivered:[],cancelled:[]};
export default function ShipmentUpdateForm({id,version,status,origin,destination}:{id:string;version:number;status:string;origin:string;destination:string}) {
  const [error,setError]=useState('');
  const [pending,setPending]=useState(false);
  if (!next[status]?.length) return null;
  async function submit(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();if(pending)return;
    const form=new FormData(e.currentTarget);
    const body:Record<string,unknown>={version};
    if(form.get('status'))body.status=form.get('status');
    if(status==='draft') {
      if(form.get('origin')!==origin)body.origin=form.get('origin');
      if(form.get('destination')!==destination)body.destination=form.get('destination');
    }
    if(Object.keys(body).length===1)return;
    setPending(true);setError('');
    try {
      const response=await fetch('/api/saas/shipments/'+encodeURIComponent(id),{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      if(!response.ok){const result=await response.json();throw new Error(result.error ?? 'Erreur');}
      window.location.reload();
    }catch(error){setError(error instanceof Error?error.message:'Erreur réseau');}finally{setPending(false);}
  }
  return <form method="post" onSubmit={submit} className="rounded border p-4 space-y-3">
    {status==='draft' && <><label className="block">Origine<input name="origin" defaultValue={origin} required maxLength={200} className="border rounded p-2 w-full bg-transparent"/></label><label className="block">Destination<input name="destination" defaultValue={destination} required maxLength={200} className="border rounded p-2 w-full bg-transparent"/></label></>}
    <label className="block">Nouveau statut<select name="status" className="border rounded p-2 w-full bg-transparent"><option value="">Ne pas modifier</option>{next[status].map(value=><option key={value} value={value}>{value}</option>)}</select></label>
    <button disabled={pending} className="rounded bg-teal-700 text-white p-2">Enregistrer</button>
    {error && <p role="alert" className="text-red-600">{error}</p>}
  </form>;
}
