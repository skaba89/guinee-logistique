import {z} from 'zod';
import {type Identity} from './saas-auth';
import {financeTransaction} from './saas-logistics';

const field=(max:number)=>z.string().trim().max(max).refine(v=>!/\p{Cc}/u.test(v));
export const commercialInput=z.object({
  legalName:field(150).refine(v=>v.length>0),
  address:field(200),
  email:z.union([z.literal(''),z.string().trim().email().max(150)]),
  phone:field(40),
  taxId:field(80),
}).strict();
export function commercialProfile(identity:Identity){
  return financeTransaction(identity,async tx=>{
    const profile=await tx.commercialProfile.findUnique({where:{organizationId:identity.organizationId}});
    if(profile)return profile;
    const org=await tx.organization.findUniqueOrThrow({where:{id:identity.organizationId}});
    return {legalName:org.name,address:'',email:'',phone:'',taxId:''};
  });
}
export function updateCommercialProfile(identity:Identity,input:z.infer<typeof commercialInput>){
  return financeTransaction(identity,tx=>{
    const data={...commercialInput.parse(input),updatedById:identity.accountId};
    return tx.commercialProfile.upsert({where:{organizationId:identity.organizationId},create:{...data,organizationId:identity.organizationId},update:data});
  });
}
