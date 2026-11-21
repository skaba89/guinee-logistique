import {z} from 'zod';
import {Prisma} from '../../generated/saas';
import {type Identity} from './saas-auth';
import {financeTransaction,LogisticsError} from './saas-logistics';

export const mobileIntentInput=z.object({documentId:z.string().min(1).max(128),reference:z.string().trim().min(1).max(100),provider:z.enum(['orange_money','mtn_momo']),amount:z.number().int().positive().max(2000000000)}).strict();
export const mobileCloseInput=z.discriminatedUnion('action',[
  z.object({action:z.literal('cancel')}).strict(),
  z.object({action:z.literal('match'),paymentId:z.string().min(1).max(128)}).strict(),
]);
function duplicate(error:unknown):never{
  if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2002')throw new LogisticsError(409,'Référence ou règlement déjà utilisé');
  throw error;
}
export function createMobileIntent(identity:Identity,input:z.infer<typeof mobileIntentInput>){
  return financeTransaction(identity,async tx=>{
    const data=mobileIntentInput.parse(input),organizationId=identity.organizationId;
    const previous=await tx.mobilePaymentIntent.findUnique({where:{organizationId_reference:{organizationId,reference:data.reference}}});
    if(previous){
      if(previous.documentId===data.documentId&&previous.amount===data.amount&&previous.provider===data.provider)return previous;
      throw new LogisticsError(409,'Référence déjà utilisée');
    }
    const doc=await tx.billingDocument.findUnique({where:{organizationId_id:{organizationId,id:data.documentId}}});
    if(!doc)throw new LogisticsError(404,'Facture introuvable');
    if(doc.status!=='invoice'||data.amount>doc.total-doc.paid-doc.credited)throw new LogisticsError(409,'Montant supérieur au solde ou document non facturé');
    return tx.mobilePaymentIntent.create({data:{...data,organizationId,actorId:identity.accountId}});
  }).catch(duplicate);
}
export function closeMobileIntent(identity:Identity,id:string,input:z.infer<typeof mobileCloseInput>){
  return financeTransaction(identity,async tx=>{
    const data=mobileCloseInput.parse(input),organizationId=identity.organizationId;
    const where={id,organizationId};
    const intent=await tx.mobilePaymentIntent.findFirst({where});
    if(!intent)throw new LogisticsError(404,'Demande introuvable');
    const status=data.action==='cancel'?'cancelled':'matched',paymentId=data.action==='match'?data.paymentId:null;
    if(intent.status===status&&intent.paymentId===paymentId)return intent;
    if(intent.status!=='pending')throw new LogisticsError(409,'Demande déjà clôturée');
    if(paymentId){
      const payment=await tx.billingPayment.findUnique({where:{organizationId_id:{organizationId,id:paymentId}},include:{reconciliation:true,mobileIntent:true}});
      if(!payment||!payment.reconciliation||payment.mobileIntent||payment.amount!==intent.amount||payment.method!==intent.provider||payment.documentId!==intent.documentId)throw new LogisticsError(409,'Règlement rapproché incompatible ou déjà utilisé');
    }
    const changed=await tx.mobilePaymentIntent.updateMany({where:{...where,status:'pending'},data:{status,paymentId,closedAt:new Date(),closedById:identity.accountId}});
    if(changed.count!==1)throw new LogisticsError(409,'Demande déjà clôturée');
    return tx.mobilePaymentIntent.findFirstOrThrow({where});
  }).catch(duplicate);
}
export function mobileOverview(identity:Identity){
  return financeTransaction(identity,async tx=>{
    const organizationId=identity.organizationId;
    const invoices=await tx.billingDocument.findMany({where:{organizationId,status:'invoice'},take:100,orderBy:[{issuedAt:'desc'},{id:'asc'}],select:{id:true,invoiceNumber:true,customerName:true,total:true,paid:true,credited:true}});
    const intents=await tx.mobilePaymentIntent.findMany({where:{organizationId},take:100,orderBy:[{createdAt:'desc'},{id:'asc'}],include:{document:{select:{invoiceNumber:true,customerName:true}}}});
    const payments=await tx.billingPayment.findMany({where:{organizationId,documentId:{in:intents.filter(i=>i.status==='pending').map(i=>i.documentId)},method:{in:['orange_money','mtn_momo']},reconciliation:{isNot:null},mobileIntent:{is:null}},take:500,orderBy:[{createdAt:'desc'},{id:'asc'}],select:{id:true,documentId:true,reference:true,amount:true,method:true}});
    return {invoices,intents,payments};
  });
}
