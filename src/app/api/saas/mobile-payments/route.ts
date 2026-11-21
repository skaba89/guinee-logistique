import {NextRequest} from 'next/server';
import {createMobileIntent,mobileIntentInput,mobileOverview} from '@/lib/mobile-payments';
import {logisticsRequest} from '@/lib/saas-logistics-http';
export function GET(request:NextRequest){
  return logisticsRequest(request,false,identity=>mobileOverview(identity));
}
export function POST(request:NextRequest){
  return logisticsRequest(request,true,(identity,body)=>createMobileIntent(identity,mobileIntentInput.parse(body)),201);
}
