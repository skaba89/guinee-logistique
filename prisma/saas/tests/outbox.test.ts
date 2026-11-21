/// <reference types="bun-types" />
import {test,expect} from 'bun:test';
import {receiptScope,readOutbox,saveReceipt,removeReceipt,clearOutbox,retryableReceiptStatus} from '../../../src/lib/mission-outbox';

test('outbox is scoped, bounded, deduplicated, conflict-safe and erasable',()=>{
  const map=new Map<string,string>();
  const storage={getItem:(key:string)=>map.get(key)??null,setItem:(key:string,value:string)=>{map.set(key,value);},removeItem:(key:string)=>{map.delete(key);}};
  const a=receiptScope('account','org-a'),b=receiptScope('account','org-b');
  const receipt={missionId:'mission-1',recipient:'Receiver'};
  saveReceipt(storage,a,receipt);
  saveReceipt(storage,a,receipt);
  expect(readOutbox(storage,a)).toEqual([receipt]);
  expect(readOutbox(storage,b)).toEqual([]);
  expect(()=>saveReceipt(storage,a,{...receipt,recipient:'Different'})).toThrow();
  expect(()=>saveReceipt(storage,b,receipt)).toThrow();
  removeReceipt(storage,b,receipt.missionId);
  expect(readOutbox(storage,a)).toEqual([receipt]);
  for(let i=2;i<=100;i++)saveReceipt(storage,a,{missionId:'mission-'+i,recipient:'Receiver'});
  expect(()=>saveReceipt(storage,a,{missionId:'mission-101',recipient:'Receiver'})).toThrow();
  removeReceipt(storage,a,receipt.missionId);
  expect(readOutbox(storage,a).length).toBe(99);
  clearOutbox(storage);
  expect(readOutbox(storage,a)).toEqual([]);
  expect(retryableReceiptStatus(503)).toBe(true);
  expect(retryableReceiptStatus(429)).toBe(true);
  expect(retryableReceiptStatus(409)).toBe(false);
  expect(retryableReceiptStatus(403)).toBe(false);
});
