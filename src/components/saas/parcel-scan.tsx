'use client';
import {useState,type FormEvent} from 'react';
import Link from 'next/link';

type Result={barcode:string;description:string;weightGrams:number;shipment:{id:string;trackingNumber:string;status:string}};
export default function ParcelScan(){
  const [result,setResult]=useState<Result|null>(null);
  const [error,setError]=useState('');
  const [pending,setPending]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();if(pending)return;
    const code=String(new FormData(e.currentTarget).get('barcode')).trim().toUpperCase();
    setPending(true);setResult(null);setError('');
    try{
      const response=await fetch('/api/saas/parcels/scan?barcode='+encodeURIComponent(code),{cache:'no-store'});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error??'Erreur');
      setResult(data.data);
    }catch(error){setError(error instanceof Error?error.message:'Erreur réseau');}finally{setPending(false);}
  }
  return <section className="border rounded p-4 space-y-3">
    <form onSubmit={submit} className="space-y-2">
      <label className="block font-semibold">Scanner ou saisir le code du colis<input name="barcode" required maxLength={16} minLength={16} className="w-full border rounded p-2 bg-transparent font-mono"/></label>
      <button disabled={pending} className="rounded bg-teal-700 text-white p-2">Rechercher</button>
    </form>
    {result&&<p>{result.description} · {result.weightGrams} g · {result.shipment.status} · <Link prefetch={false} className="underline" href={'/saas/logistics/'+result.shipment.id}>{result.shipment.trackingNumber}</Link></p>}
    {error&&<p role="alert" className="text-red-600">{error}</p>}
  </section>;
}
