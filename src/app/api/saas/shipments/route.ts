import { NextRequest } from 'next/server';
import { listShipments, createShipment, shipmentInput } from '@/lib/saas-logistics';
import { logisticsRequest } from '@/lib/saas-logistics-http';

export function GET(request: NextRequest) {
  return logisticsRequest(request, false, identity => listShipments(identity));
}
export function POST(request: NextRequest) {
  return logisticsRequest(request, true, (identity, body) => createShipment(identity, shipmentInput.parse(body)), 201);
}
