import {NextRequest} from 'next/server';
import {cancelMission} from '@/lib/saas-logistics';
import {logisticsRequest} from '@/lib/saas-logistics-http';
import {z} from 'zod';
export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  return logisticsRequest(request,true,(identity,body)=>{z.object({}).strict().parse(body);return cancelMission(identity,id);});
}
