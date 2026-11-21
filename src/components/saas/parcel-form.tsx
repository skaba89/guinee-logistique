'use client';
import {useState,type FormEvent} from 'react';

export default function ParcelForm({id,version}:{id:string;version:number}) {
  const [error,setError]=useState('');
  const [pending,setPending]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();if(pending)return;
    const data=new FormData(e.currentTarget);setPending(true);setError('');
    try{
      const response=await fetch('/api/saas/shipments/'+encodeURIComponent(id)+'/parcels',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({description:data.get('description'),weightGrams:Number(data.get('weightGrams')),version})});
      if(!response.ok)throw new Error((await response.json()).error ?? 'Erreur');
      window.location.reload();
    }catch(error){setError(error instanceof Error?error.message:'Erreur réseau');}finally{setPending(false);}
  }
  return <form method="post" onSubmit={submit} className="border rounded p-4 space-y-3">
    <h3 className="font-semibold">Ajouter un colis</h3>
    <label className="block">Description<input name="description" required maxLength={200} className="w-full border rounded p-2 bg-transparent"/></label>
    <label className="block">Poids (grammes)<input name="weightGrams" type="number" min={1} max={100000000} step={1} required className="w-full border rounded p-2 bg-transparent"/></label>
    <button disabled={pending} className="rounded bg-teal-700 text-white p-2">Ajouter</button>
    {error&&<p role="alert" className="text-red-600">{error}</p>}
  </form>;
}
