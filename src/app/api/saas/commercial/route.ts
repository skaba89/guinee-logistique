import {NextRequest} from 'next/server';
import {commercialProfile,commercialInput,updateCommercialProfile} from '@/lib/commercial-profile';
import {logisticsRequest} from '@/lib/saas-logistics-http';
export function GET(request:NextRequest){
  return logisticsRequest(request,false,identity=>commercialProfile(identity));
}
export function POST(request:NextRequest){
  return logisticsRequest(request,true,(identity,body)=>updateCommercialProfile(identity,commercialInput.parse(body)));
}
