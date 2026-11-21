import {NextRequest} from 'next/server';
import {billingExport} from '@/lib/saas-billing';
import {billingCsv} from '@/lib/billing-export';
import {logisticsRequest} from '@/lib/saas-logistics-http';
export function GET(request:NextRequest){
  return logisticsRequest(request,false,async identity=>new Response(billingCsv(await billingExport(identity)),{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="factures-gnf.csv"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}}));
}
