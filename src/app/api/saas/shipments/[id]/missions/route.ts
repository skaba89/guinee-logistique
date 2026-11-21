import {NextRequest} from 'next/server';
import {assignMission,listMissions,missionInput} from '@/lib/saas-logistics';
import {logisticsRequest} from '@/lib/saas-logistics-http';
type Context={params:Promise<{id:string}>};
export async function GET(request:NextRequest,{params}:Context){
  const {id}=await params;
  return logisticsRequest(request,false,identity=>listMissions(identity,id));
}
export async function POST(request:NextRequest,{params}:Context){
  const {id}=await params;
  return logisticsRequest(request,true,(identity,body)=>assignMission(identity,id,missionInput.parse(body)),201);
}
