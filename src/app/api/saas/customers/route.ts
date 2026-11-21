import { NextRequest } from 'next/server';
import { listCustomers, createCustomer, customerInput } from '@/lib/saas-logistics';
import { logisticsRequest } from '@/lib/saas-logistics-http';

export function GET(request: NextRequest) {
  return logisticsRequest(request, false, identity => listCustomers(identity));
}
export function POST(request: NextRequest) {
  return logisticsRequest(request, true, (identity, body) => createCustomer(identity, customerInput.parse(body)), 201);
}
