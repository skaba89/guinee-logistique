import {randomUUID} from 'node:crypto';
import {z} from 'zod';
import {type Identity} from './saas-auth';
import {financeTransaction,LogisticsError} from './saas-logistics';
import {Prisma} from '../../generated/saas';

const max=2_000_000_000;
const money=z.number().int().positive().max(max);
export const quoteInput=z.object({customerId:z.string().min(1).max(128),description:z.string().trim().min(1).max(300),quantity:z.number().int().positive().max(100000),unitPrice:money}).strict().refine(v=>v.quantity*v.unitPrice<=max);
export const issueInput=z.object({version:z.number().int().min(0).max(2147483646)}).strict();
export const paymentInput=z.object({reference:z.string().trim().min(1).max(100),amount:money,method:z.enum(['cash','bank','orange_money','mtn_momo']),version:z.number().int().min(0).max(2147483646)}).strict();

export function createQuote(identity:Identity,input:z.infer<typeof quoteInput>){
  return financeTransaction(identity,async tx=>{
    const data=quoteInput.parse(input);
    const customer=await tx.customer.findUnique({where:{organizationId_id:{organizationId:identity.organizationId,id:data.customerId}}});
    if(!customer)throw new LogisticsError(404,'Client introuvable');
    return tx.billingDocument.create({data:{...data,organizationId:identity.organizationId,customerName:customer.name,quoteNumber:'DEV-'+randomUUID().toUpperCase(),total:data.quantity*data.unitPrice}});
  });
}
export function issueInvoice(identity:Identity,id:string,version:number){
  return financeTransaction(identity,async tx=>{
    const where={organizationId_id:{organizationId:identity.organizationId,id}};
    const existing=await tx.billingDocument.findUnique({where});
    if(!existing)throw new LogisticsError(404,'Document introuvable');
    if(existing.status==='invoice')return existing;
    const result=await tx.billingDocument.updateMany({where:{id,organizationId:identity.organizationId,status:'quote',version},data:{status:'invoice',invoiceNumber:'FAC-'+randomUUID().toUpperCase(),issuedAt:new Date(),version:{increment:1}}});
    if(result.count!==1)throw new LogisticsError(409,'Version obsolète');
    return tx.billingDocument.findUniqueOrThrow({where});
  });
}
export function recordPayment(identity:Identity,id:string,input:z.infer<typeof paymentInput>){
  return financeTransaction(identity,async tx=>{
    const data=paymentInput.parse(input);
    const document=await tx.billingDocument.findUnique({where:{organizationId_id:{organizationId:identity.organizationId,id}}});
    if(!document)throw new LogisticsError(404,'Document introuvable');
    const previous=await tx.billingPayment.findUnique({where:{organizationId_reference:{organizationId:identity.organizationId,reference:data.reference}}});
    if(previous){
      if(previous.documentId===id&&previous.amount===data.amount&&previous.method===data.method)return previous;
      throw new LogisticsError(409,'Référence de règlement déjà utilisée');
    }
    if(document.status!=='invoice'||document.version!==data.version||data.amount>document.total-document.paid)throw new LogisticsError(409,'Facture, solde ou version incompatible');
    const locked=await tx.billingDocument.updateMany({where:{id,organizationId:identity.organizationId,status:'invoice',version:data.version,paid:document.paid},data:{paid:{increment:data.amount},version:{increment:1}}});
    if(locked.count!==1)throw new LogisticsError(409,'Version obsolète');
    return tx.billingPayment.create({data:{organizationId:identity.organizationId,documentId:id,reference:data.reference,amount:data.amount,method:data.method,actorId:identity.accountId}});
  }).catch(error=>{
    if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2002')throw new LogisticsError(409,'Référence de règlement déjà utilisée');
    throw error;
  });
}
export function billingOverview(identity:Identity){
  return financeTransaction(identity,async tx=>{
    const where={organizationId:identity.organizationId};
    const documents=await tx.billingDocument.findMany({where,orderBy:[{createdAt:'desc'},{id:'asc'}],take:100,include:{payments:{orderBy:{createdAt:'desc'},take:100}}});
    // Integer SQL aggregation avoids floating-point rounding and covers all invoices, not just the visible page.
    const [totals]=await tx.$queryRaw<{invoiced:string;paid:string;outstanding:string}[]>`SELECT COALESCE(sum("total"),0)::text AS invoiced, COALESCE(sum("paid"),0)::text AS paid, COALESCE(sum("total"::bigint-"paid"),0)::text AS outstanding FROM "BillingDocument" WHERE "organizationId"=${identity.organizationId} AND "status"='invoice'`;
    return {documents,totals};
  });
}
