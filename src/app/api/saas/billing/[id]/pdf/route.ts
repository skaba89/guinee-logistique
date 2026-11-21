import {NextRequest} from 'next/server';
import {billingDocument} from '@/lib/saas-billing';
import {billingPdf} from '@/lib/billing-export';
import {logisticsRequest} from '@/lib/saas-logistics-http';
export async function GET(request:NextRequest,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  return logisticsRequest(request,false,async identity=>{
    const document=await billingDocument(identity,id);
    return new Response(billingPdf(document),{headers:{'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="document-'+document.id.replace(/[^a-zA-Z0-9_-]/g,'')+'.pdf"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  });
}
