import {NextRequest} from 'next/server';
import {reconcilePayment,reconciliationInput} from '@/lib/saas-billing';
import {logisticsRequest} from '@/lib/saas-logistics-http';
export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  return logisticsRequest(request,true,(identity,body)=>reconcilePayment(identity,id,reconciliationInput.parse(body)),201);
}
