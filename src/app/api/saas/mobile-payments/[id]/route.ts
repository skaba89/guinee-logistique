import {NextRequest} from 'next/server';
import {closeMobileIntent,mobileCloseInput} from '@/lib/mobile-payments';
import {logisticsRequest} from '@/lib/saas-logistics-http';
export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  return logisticsRequest(request,true,(identity,body)=>closeMobileIntent(identity,id,mobileCloseInput.parse(body)));
}
