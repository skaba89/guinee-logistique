// Only the active tab stores unsent receipts; never cache authenticated pages.
export const OUTBOX_KEY='gl.saas.receipts.v1';
export type Receipt={missionId:string;recipient:string;note?:string};
export type Outbox={scope:string;items:Receipt[]};
export function receiptScope(accountId:string,organizationId:string){return JSON.stringify([organizationId,accountId]);}
export function readOutbox(storage:Pick<Storage,'getItem'>,scope:string):Receipt[]{
  try{
    const data=JSON.parse(storage.getItem(OUTBOX_KEY)??'null') as Outbox|null;
    if(!data||data.scope!==scope||!Array.isArray(data.items))return [];
    return data.items.filter(item=>typeof item?.missionId==='string'&&typeof item.recipient==='string'&&(item.note===undefined||typeof item.note==='string')).slice(0,100);
  }catch{return [];}
}
export function saveReceipt(storage:Pick<Storage,'getItem'|'setItem'>,scope:string,receipt:Receipt){
  const raw=storage.getItem(OUTBOX_KEY);
  if(raw&&(JSON.parse(raw) as Outbox).scope!==scope)throw new Error('Une autre session possède des confirmations locales. Reconnectez-vous avec ce compte ou déconnectez-vous pour les effacer.');
  const items=readOutbox(storage,scope);
  const previous=items.find(item=>item.missionId===receipt.missionId);
  if(previous&&(previous.recipient!==receipt.recipient||previous.note!==receipt.note))throw new Error('Une confirmation différente est déjà en attente pour cette mission.');
  if(previous)return;
  if(items.length>=100)throw new Error('File pleine : synchronisez les confirmations.');
  storage.setItem(OUTBOX_KEY,JSON.stringify({scope,items:[...items,receipt]}));
}
export function removeReceipt(storage:Pick<Storage,'getItem'|'setItem'|'removeItem'>,scope:string,id:string){
  const items=readOutbox(storage,scope).filter(item=>item.missionId!==id);
  if(!items.length){
    // Never remove the queue of another account.
    if(readOutbox(storage,scope).length)storage.removeItem(OUTBOX_KEY);
  }else storage.setItem(OUTBOX_KEY,JSON.stringify({scope,items}));
}
export function clearOutbox(storage:Pick<Storage,'removeItem'>){storage.removeItem(OUTBOX_KEY);}
export function retryableReceiptStatus(status:number){return status===408||status===429||status>=500;}
