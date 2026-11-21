'use client';
import {useState,type FormEvent} from 'react';
import {saveReceipt,retryableReceiptStatus} from '@/lib/mission-outbox';
export default function MissionAction({id,action,scope}:{id:string;action:'complete'|'cancel';scope?:string}){
  const [pending,setPending]=useState(false),[error,setError]=useState('');
  const [offline,setOffline]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();if(pending)return;
    const data=new FormData(e.currentTarget);
    if(action==='cancel'&&!window.confirm('Annuler cette mission ?'))return;
    setPending(true);setError('');
    const receipt={missionId:id,recipient:String(data.get('recipient')??'').trim(),note:String(data.get('note')??'').trim()||undefined};
    const body=action==='cancel'?{}:{recipient:receipt.recipient,note:receipt.note};
    function queue(){
      if(!scope||action!=='complete'||!offline)return false;
      saveReceipt(sessionStorage,scope,receipt);
      window.dispatchEvent(new Event('gl-receipt-queued'));
      setError('Confirmation conservée dans cet onglet. En attente de synchronisation.');
      return true;
    }
    try{
      if(action==='complete'&&!receipt.recipient)throw new Error('Nom obligatoire');
      let response:Response;
      try{response=await fetch('/api/saas/missions/'+encodeURIComponent(id)+'/'+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});}
      catch(networkError){if(queue())return;throw networkError;}
      if(!response.ok){if(retryableReceiptStatus(response.status)&&queue())return;throw new Error((await response.json()).error??'Erreur');}
      window.location.reload();
    }catch(error){setError(error instanceof Error?error.message:'Erreur réseau');}finally{setPending(false);}
  }
  return <form method="post" onSubmit={submit} className="space-y-2">
    {action==='complete'&&<><label className="block">Nom de la personne ayant remis ou reçu le colis<input name="recipient" required maxLength={150} className="w-full border rounded p-2 bg-transparent"/></label><label className="block">Observation (facultatif)<textarea name="note" maxLength={500} className="w-full border rounded p-2 bg-transparent"/></label></>}
    {scope&&action==='complete'&&<label className="block text-sm"><input type="checkbox" checked={offline} onChange={e=>setOffline(e.target.checked)}/> Conserver temporairement cette preuve dans cet onglet si le réseau est indisponible (appareil de confiance).</label>}
    <button disabled={pending} className="rounded border p-2">{action==='complete'?'Confirmer la remise':'Annuler la mission'}</button>
    {error&&<p role="alert" className="text-red-600">{error}</p>}
  </form>;
}
