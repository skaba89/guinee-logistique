import { NextRequest } from 'next/server';
import { getShipment, updateShipment, shipmentUpdate } from '@/lib/saas-logistics';
import { logisticsRequest } from '@/lib/saas-logistics-http';

type Context = { params: Promise<{id:string}> };
export async function GET(request: NextRequest, {params}: Context) {
  const {id} = await params;
  return logisticsRequest(request, false, identity => getShipment(identity,id));
}
export async function PATCH(request: NextRequest, {params}: Context) {
  const {id} = await params;
  return logisticsRequest(request, true, (identity, body) => updateShipment(identity,id,shipmentUpdate.parse(body)));
}
