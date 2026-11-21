import {NextRequest} from 'next/server';
import {operationalFeed} from '@/lib/saas-logistics';
import {logisticsRequest} from '@/lib/saas-logistics-http';
export function GET(request:NextRequest){
  return logisticsRequest(request,false,identity=>operationalFeed(identity));
}
