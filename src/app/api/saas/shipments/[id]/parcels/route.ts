import { NextRequest } from 'next/server';
import { createParcel, parcelInput } from '@/lib/saas-logistics';
import { logisticsRequest } from '@/lib/saas-logistics-http';

export async function POST(request: NextRequest,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  return logisticsRequest(request,true,(identity,body)=>createParcel(identity,id,parcelInput.parse(body)),201);
}
