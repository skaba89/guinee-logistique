import {randomUUID} from 'node:crypto';
import {z} from 'zod';
import {type Identity} from './saas-auth';
import {financeTransaction,LogisticsError} from './saas-logistics';
import {Prisma} from '../../generated/saas';

const max=2_000_000_000;
const money=z.number().int().positive().max(max);
const legacyLine=z.object({description:z.string().trim().min(1).max(300),quantity:z.number().int().positive().max(100000),unitPrice:money}).strict();
const lineInput=legacyLine.extend({taxBps:z.number().int().min(0).max(10000).default(0)});
export const quoteInput=z.union([
  legacyLine.extend({customerId:z.string().min(1).max(128)}).refine(v=>v.quantity*v.unitPrice<=max),
  z.object({customerId:z.string().min(1).max(128),lines:z.array(lineInput).min(1).max(10)}).strict().refine(v=>v.lines.reduce((sum,l)=>sum+l.quantity*l.unitPrice+Math.round(l.quantity*l.unitPrice*l.taxBps/10000),0)<=max),
]);
export const issueInput=z.object({version:z.number().int().min(0).max(2147483646)}).strict();
export const paymentInput=z.object({reference:z.string().trim().min(1).max(100),amount:money,method:z.enum(['cash','bank','orange_money','mtn_momo']),version:z.number().int().min(0).max(2147483646)}).strict();
export const creditInput=z.object({reference:z.string().trim().min(1).max(100),amount:money,reason:z.string().trim().min(1).max(300),version:z.number().int().min(0).max(2147483646)}).strict();

export function createQuote(identity:Identity,input:z.infer<typeof quoteInput>){
  return financeTransaction(identity,async tx=>{
    const data=quoteInput.parse(input);
    const customer=await tx.customer.findUnique({where:{organizationId_id:{organizationId:identity.organizationId,id:data.customerId}}});
    if(!customer)throw new LogisticsError(404,'Client introuvable');
    const lines=('lines' in data?data.lines:[{description:data.description,quantity:data.quantity,unitPrice:data.unitPrice,taxBps:0}]).map((line,index)=>{
      const subtotal=line.quantity*line.unitPrice,tax=Math.floor((subtotal*line.taxBps+5000)/10000);
      return {...line,position:index+1,subtotal,tax,total:subtotal+tax};
    });
    const subtotal=lines.reduce((sum,l)=>sum+l.subtotal,0),taxTotal=lines.reduce((sum,l)=>sum+l.tax,0);
    const first=lines[0];
    const document=await tx.billingDocument.create({data:{customerId:customer.id,description:first.description,quantity:first.quantity,unitPrice:first.unitPrice,organizationId:identity.organizationId,customerName:customer.name,quoteNumber:'DEV-'+randomUUID().toUpperCase(),subtotal,taxTotal,total:subtotal+taxTotal}});
    await tx.billingLine.createMany({data:lines.map(line=>({...line,organizationId:identity.organizationId,documentId:document.id}))});
    return document;
  });
}
export function issueInvoice(identity:Identity,id:string,version:number){
  return financeTransaction(identity,async tx=>{
    const where={organizationId_id:{organizationId:identity.organizationId,id}};
    const existing=await tx.billingDocument.findUnique({where});
    if(!existing)throw new LogisticsError(404,'Document introuvable');
    if(existing.status==='invoice')return existing;
    const issuedAt=new Date(),year=issuedAt.getUTCFullYear();
    const [counter]=await tx.$queryRaw<{value:number}[]>`INSERT INTO "BillingCounter" ("organizationId","year","value") VALUES (${identity.organizationId},${year},1) ON CONFLICT ("organizationId","year") DO UPDATE SET "value"="BillingCounter"."value"+1 RETURNING "value"`;
    const invoiceNumber='FAC-'+identity.organizationId+'-'+year+'-'+String(counter.value).padStart(6,'0');
    const result=await tx.billingDocument.updateMany({where:{id,organizationId:identity.organizationId,status:'quote',version},data:{status:'invoice',invoiceNumber,issuedAt,version:{increment:1}}});
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
    if(document.status!=='invoice'||document.version!==data.version||data.amount>document.total-document.paid-document.credited)throw new LogisticsError(409,'Facture, solde ou version incompatible');
    const locked=await tx.billingDocument.updateMany({where:{id,organizationId:identity.organizationId,status:'invoice',version:data.version,paid:document.paid},data:{paid:{increment:data.amount},version:{increment:1}}});
    if(locked.count!==1)throw new LogisticsError(409,'Version obsolète');
    return tx.billingPayment.create({data:{organizationId:identity.organizationId,documentId:id,reference:data.reference,amount:data.amount,method:data.method,actorId:identity.accountId}});
  }).catch(error=>{
    if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2002')throw new LogisticsError(409,'Référence de règlement déjà utilisée');
    throw error;
  });
}
export function recordCredit(identity:Identity,id:string,input:z.infer<typeof creditInput>){
  return financeTransaction(identity,async tx=>{
    const data=creditInput.parse(input);
    const organizationId=identity.organizationId;
    const document=await tx.billingDocument.findUnique({where:{organizationId_id:{organizationId,id}}});
    if(!document)throw new LogisticsError(404,'Document introuvable');
    const previous=await tx.billingCredit.findUnique({where:{organizationId_reference:{organizationId,reference:data.reference}}});
    if(previous){
      if(previous.documentId===id&&previous.amount===data.amount&&previous.reason===data.reason)return previous;
      throw new LogisticsError(409,'Référence d’avoir déjà utilisée');
    }
    if(document.status!=='invoice'||document.version!==data.version||data.amount>document.total-document.paid-document.credited)throw new LogisticsError(409,'Facture, solde ou version incompatible');
    const locked=await tx.billingDocument.updateMany({where:{id,organizationId,status:'invoice',version:data.version},data:{credited:{increment:data.amount},version:{increment:1}}});
    if(locked.count!==1)throw new LogisticsError(409,'Version obsolète');
    return tx.billingCredit.create({data:{organizationId,documentId:id,reference:data.reference,amount:data.amount,reason:data.reason,actorId:identity.accountId}});
  }).catch(error=>{
    if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2002')throw new LogisticsError(409,'Référence d’avoir déjà utilisée');
    throw error;
  });
}
export function billingOverview(identity:Identity){
  return financeTransaction(identity,async tx=>{
    const where={organizationId:identity.organizationId};
    const documents=await tx.billingDocument.findMany({where,orderBy:[{createdAt:'desc'},{id:'asc'}],take:100,include:{lines:{orderBy:{position:'asc'}},payments:{orderBy:{createdAt:'desc'},take:100},credits:{orderBy:{createdAt:'desc'},take:100}}});
    // Integer SQL aggregation avoids floating-point rounding and covers all invoices, not just the visible page.
    const [totals]=await tx.$queryRaw<{invoiced:string;paid:string;credited:string;outstanding:string}[]>`SELECT COALESCE(sum("total"),0)::text AS invoiced, COALESCE(sum("paid"),0)::text AS paid, COALESCE(sum("credited"),0)::text AS credited, COALESCE(sum("total"::bigint-"paid"-"credited"),0)::text AS outstanding FROM "BillingDocument" WHERE "organizationId"=${identity.organizationId} AND "status"='invoice'`;
    return {documents,totals};
  });
}

export function billingDocument(identity:Identity,id:string){
  return financeTransaction(identity,async tx=>{
    const document=await tx.billingDocument.findUnique({where:{organizationId_id:{organizationId:identity.organizationId,id}},include:{lines:{orderBy:{position:'asc'}}}});
    if(!document)throw new LogisticsError(404,'Document introuvable');
    const organization=await tx.organization.findUniqueOrThrow({where:{id:identity.organizationId},select:{name:true}});
    return {...document,organizationName:organization.name};
  });
}
export function billingExport(identity:Identity){
  return financeTransaction(identity,async tx=>{
    const documents=await tx.billingDocument.findMany({where:{organizationId:identity.organizationId,status:'invoice'},orderBy:[{issuedAt:'asc'},{id:'asc'}],take:10001});
    if(documents.length>10000)throw new LogisticsError(409,'Export trop volumineux : contactez votre administrateur');
    return documents;
  });
}
