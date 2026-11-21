'use client';
import {useState,type FormEvent} from 'react';

type Profile={legalName:string;address:string;email:string;phone:string;taxId:string};
export default function CommercialProfileForm({profile}:{profile:Profile}){
  const [pending,setPending]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(false);
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(pending)return;
    const data=new FormData(event.currentTarget);
    setPending(true);setSaved(false);setError('');
    try{
      const response=await fetch('/api/saas/commercial',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(['legalName','address','email','phone','taxId'].map(key=>[key,data.get(key)])))});
      if(!response.ok)throw new Error((await response.json()).error??'Erreur');
      setSaved(true);
    }catch(error){setError(error instanceof Error?error.message:'Erreur réseau');}finally{setPending(false);}
  }
  const field='w-full border rounded p-2 bg-transparent';
  return <form method="post" onSubmit={submit} onChange={()=>setSaved(false)} className="space-y-3 rounded border p-4">
    <label className="block">Raison sociale<input name="legalName" defaultValue={profile.legalName} maxLength={150} required className={field}/></label>
    <label className="block">Adresse<input name="address" defaultValue={profile.address} maxLength={200} className={field}/></label>
    <label className="block">E-mail commercial<input name="email" type="email" defaultValue={profile.email} maxLength={150} className={field}/></label>
    <label className="block">Téléphone<input name="phone" type="tel" defaultValue={profile.phone} maxLength={40} className={field}/></label>
    <label className="block">Identifiant fiscal déclaré<input name="taxId" defaultValue={profile.taxId} maxLength={80} className={field}/></label>
    <button disabled={pending} className="rounded bg-teal-700 text-white p-2">{pending?'Enregistrement…':'Enregistrer les coordonnées'}</button>
    {saved&&<p role="status" className="text-green-700">Coordonnées enregistrées.</p>}
    {error&&<p role="alert" className="text-red-600">{error}</p>}
  </form>;
}
