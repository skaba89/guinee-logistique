'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {readOutbox,removeReceipt,receiptScope,retryableReceiptStatus,type Receipt} from '@/lib/mission-outbox';

export default function ReceiptOutbox({scope}:{scope:string}){
  const [items,setItems]=useState<Receipt[]>([]);
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  const running=useRef(false);
  const refresh=useCallback(()=>{setItems(readOutbox(sessionStorage,scope));},[scope]);
  useEffect(()=>{
    let active=true;
    queueMicrotask(()=>{if(active)refresh();});
    window.addEventListener('gl-receipt-queued',refresh);
    return ()=>{active=false;window.removeEventListener('gl-receipt-queued',refresh);};
  },[refresh]);
  const sync=useCallback(async()=>{
    if(running.current)return;
    const queued=readOutbox(sessionStorage,scope);
    if(!queued.length)return;
    running.current=true;setBusy(true);setMessage('');
    let sent=0;
    try{
      const me=await fetch('/api/saas/auth/me',{cache:'no-store'});
      if(!me.ok)throw new Error('Reconnectez-vous avant de synchroniser.');
      const identity=await me.json();
      if(identity.role!=='ramasseur'||receiptScope(identity.accountId,identity.organizationId)!==scope)throw new Error('Compte différent : aucune confirmation envoyée.');
      for(const item of queued){
        const response=await fetch('/api/saas/missions/'+encodeURIComponent(item.missionId)+'/complete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({recipient:item.recipient,note:item.note})});
        if(response.ok){removeReceipt(sessionStorage,scope,item.missionId);sent++;continue;}
        if(response.status===401||response.status===403||retryableReceiptStatus(response.status))throw new Error('Synchronisation interrompue. Réessayez après reconnexion.');
        setMessage('Une mission est en conflit ou n’est plus disponible. Vérifiez-la avant de supprimer la confirmation locale.');
      }
      if(sent===queued.length)window.location.reload();
    }catch(error){setMessage(error instanceof Error?error.message:'Réseau indisponible');}
    finally{running.current=false;setBusy(false);refresh();}
  },[scope,refresh]);
  useEffect(()=>{
    const online=()=>{void sync();};
    window.addEventListener('online',online);
    return ()=>window.removeEventListener('online',online);
  },[sync]);
  if(!items.length&&!message)return null;
  return <aside className="rounded border border-amber-500 p-4 space-y-3" aria-live="polite">
    <h2 className="font-semibold">Confirmations locales en attente ({items.length})</h2>
    <p className="text-sm">Non validées par le serveur. Conservez cet onglet et synchronisez avant de vous déconnecter.</p>
    <button disabled={busy||!items.length} onClick={()=>void sync()} className="rounded bg-teal-700 text-white p-2">{busy?'Synchronisation…':'Synchroniser maintenant'}</button>
    {items.map(item=><div key={item.missionId} className="flex flex-wrap gap-2 items-center"><span className="text-sm">Mission {item.missionId}</span><button disabled={busy} className="underline" onClick={()=>{if(window.confirm('Supprimer cette confirmation locale non synchronisée ?')){removeReceipt(sessionStorage,scope,item.missionId);refresh();}}}>Supprimer</button></div>)}
    {message&&<p role="alert" className="text-sm">{message}</p>}
  </aside>;
}
