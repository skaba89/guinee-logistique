'use client';
import {useState,type FormEvent} from 'react';
export default function MissionAction({id,action}:{id:string;action:'complete'|'cancel'}){
  const [pending,setPending]=useState(false),[error,setError]=useState('');
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();if(pending)return;
    const data=new FormData(e.currentTarget);
    if(action==='cancel'&&!window.confirm('Annuler cette mission ?'))return;
    setPending(true);setError('');
    try{
      const body=action==='cancel'?{}:{recipient:data.get('recipient'),note:data.get('note')||undefined};
      const response=await fetch('/api/saas/missions/'+encodeURIComponent(id)+'/'+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      if(!response.ok)throw new Error((await response.json()).error??'Erreur');
      window.location.reload();
    }catch(error){setError(error instanceof Error?error.message:'Erreur réseau');}finally{setPending(false);}
  }
  return <form method="post" onSubmit={submit} className="space-y-2">
    {action==='complete'&&<><label className="block">Nom de la personne ayant remis ou reçu le colis<input name="recipient" required maxLength={150} className="w-full border rounded p-2 bg-transparent"/></label><label className="block">Observation (facultatif)<textarea name="note" maxLength={500} className="w-full border rounded p-2 bg-transparent"/></label></>}
    <button disabled={pending} className="rounded border p-2">{action==='complete'?'Confirmer la remise':'Annuler la mission'}</button>
    {error&&<p role="alert" className="text-red-600">{error}</p>}
  </form>;
}
