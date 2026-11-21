import { NextRequest } from 'next/server';
import { z } from 'zod';
import { scanParcel } from '@/lib/saas-logistics';
import { logisticsRequest } from '@/lib/saas-logistics-http';

export function GET(request: NextRequest) {
  return logisticsRequest(request,false,identity=>scanParcel(identity,z.string().regex(/^[0-9A-F]{16}$/).parse(request.nextUrl.searchParams.get('barcode'))));
}
