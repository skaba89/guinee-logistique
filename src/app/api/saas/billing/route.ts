import {NextRequest} from 'next/server';
import {billingOverview,createQuote,quoteInput} from '@/lib/saas-billing';
import {logisticsRequest} from '@/lib/saas-logistics-http';
export function GET(request:NextRequest){return logisticsRequest(request,false,identity=>billingOverview(identity));}
export function POST(request:NextRequest){return logisticsRequest(request,true,(identity,body)=>createQuote(identity,quoteInput.parse(body)),201);}
