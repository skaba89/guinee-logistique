import {NextRequest} from 'next/server';
import {completeMission,receiptInput} from '@/lib/saas-logistics';
import {logisticsRequest} from '@/lib/saas-logistics-http';
export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  return logisticsRequest(request,true,(identity,body)=>completeMission(identity,id,receiptInput.parse(body)));
}
