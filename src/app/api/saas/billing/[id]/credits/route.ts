import {NextRequest} from 'next/server';
import {recordCredit,creditInput} from '@/lib/saas-billing';
import {logisticsRequest} from '@/lib/saas-logistics-http';
export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  return logisticsRequest(request,true,(identity,body)=>recordCredit(identity,id,creditInput.parse(body)),201);
}
