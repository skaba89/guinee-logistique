/// <reference types="bun-types" />
import {test,expect} from 'bun:test';
import {PrismaClient} from '../../../generated/saas';
import {type Identity,hashPassword,login} from '../../../src/lib/saas-auth';
import {createCustomer} from '../../../src/lib/saas-logistics';
import {createQuote,issueInvoice,recordPayment,recordCredit,billingOverview,quoteInput,billingDocument,billingExport,reconcilePayment,financialJournal} from '../../../src/lib/saas-billing';
import {billingPdf,billingCsv,csvCell} from '../../../src/lib/billing-export';
import {GET as pdfGet} from '../../../src/app/api/saas/billing/[id]/pdf/route';
import {GET as billingGet} from '../../../src/app/api/saas/billing/route';
import {NextRequest} from 'next/server';
import {commercialProfile,commercialInput,updateCommercialProfile} from '../../../src/lib/commercial-profile';

test('billing: exact GNF, tenant and role boundaries, overpayment and concurrent payments',async()=>{
  const admin=new PrismaClient({datasourceUrl:process.env.SAAS_DATABASE_URL!});
  const restricted=new PrismaClient({datasourceUrl:process.env.SAAS_TENANT_DATABASE_URL!});
  const orgs=['bill-a','bill-b'],users=['bill-admin','bill-agent','bill-other'];
  const password='CI-billing-strong-password',passwordHash=await hashPassword(password);
  const origin='https://saas.example.invalid';
  process.env.SAAS_AUTH_ENABLED='true';process.env.SAAS_PUBLIC_ORIGIN=origin;
  await admin.organization.createMany({data:orgs.map(id=>({id,name:id,slug:id}))});
  await admin.account.createMany({data:users.map(id=>({id,email:id+'@example.invalid',displayName:id,passwordHash}))});
  await admin.membership.createMany({data:users.map((accountId,i)=>({accountId,organizationId:i===2?orgs[1]:orgs[0],role:i===1?'agent':'admin'}))});
  const identity=(i:number):Identity=>({accountId:users[i],organizationId:i===2?orgs[1]:orgs[0],role:i===1?'agent':'admin',displayName:users[i]});
  const a=identity(0),agent=identity(1),b=identity(2);
  try{
    const cust=await createCustomer(a,{name:'A'}),other=await createCustomer(b,{name:'B'});
    const input={customerId:cust.id,description:'Transport',quantity:3,unitPrice:100000};
    await expect(createQuote(agent,input)).rejects.toThrow();
    await expect(createQuote(a,{...input,customerId:other.id})).rejects.toThrow();
    expect(quoteInput.safeParse({...input,unitPrice:100000.5}).success).toBe(false);
    expect(quoteInput.safeParse({...input,quantity:100000,unitPrice:100000}).success).toBe(false);
    const quote=await createQuote(a,input);
    expect(quote.total).toBe(300000);
    await expect(recordPayment(a,quote.id,{amount:100000,reference:'PAY-1',method:'cash',version:0})).rejects.toThrow();
    await expect(issueInvoice(b,quote.id,0)).rejects.toThrow();
    const invoice=await issueInvoice(a,quote.id,0);
    expect(invoice.invoiceNumber?.startsWith('FAC-')).toBe(true);
    expect((await issueInvoice(a,quote.id,0)).invoiceNumber).toBe(invoice.invoiceNumber);
    expect(await restricted.billingDocument.count()).toBe(0);
    await restricted.$transaction(async tx=>{
      await tx.$queryRaw`SELECT set_config('gl.organization_id',${orgs[0]},true)`;
      expect(await tx.billingDocument.count()).toBe(0);
      await tx.$queryRaw`SELECT set_config('gl.finance','on',true)`;
      expect(await tx.billingDocument.count()).toBe(1);
    });
    await expect(recordPayment(a,quote.id,{amount:300001,reference:'TOO-MUCH',method:'cash',version:1})).rejects.toThrow();
    const first={amount:100000,reference:'PAY-1',method:'orange_money' as const,version:1};
    const payment=await recordPayment(a,quote.id,first);
    expect((await recordPayment(a,quote.id,first)).id).toBe(payment.id);
    await expect(recordPayment(a,quote.id,{...first,amount:99999})).rejects.toThrow();
    const concurrent=await Promise.allSettled(['PAY-2','PAY-3'].map(reference=>recordPayment(a,quote.id,{amount:200000,reference,method:'cash',version:2})));
    expect(concurrent.filter(r=>r.status==='fulfilled').length).toBe(1);
    const overview=await billingOverview(a);
    expect(overview.totals).toEqual({invoiced:'300000',paid:'300000',credited:'0',outstanding:'0'});
    expect(overview.documents[0].payments.length).toBe(2);
    const proof={statementReference:'OM-STATEMENT-1',amount:100000};
    await expect(reconcilePayment(a,payment.id,{...proof,amount:99999})).rejects.toThrow();
    await expect(reconcilePayment(b,payment.id,proof)).rejects.toThrow();
    await expect(reconcilePayment(agent,payment.id,proof)).rejects.toThrow();
    const reconciliation=await reconcilePayment(a,payment.id,proof);
    expect((await reconcilePayment(a,payment.id,proof)).id).toBe(reconciliation.id);
    await expect(reconcilePayment(a,payment.id,{...proof,statementReference:'OTHER'})).rejects.toThrow();
    const second=overview.documents[0].payments.find(p=>p.id!==payment.id)!;
    await expect(reconcilePayment(a,second.id,{...proof,amount:second.amount})).rejects.toThrow();
    expect((await billingOverview(a)).totals).toEqual(overview.totals);
    expect(await restricted.billingReconciliation.count()).toBe(0);
    await restricted.$transaction(async tx=>{
      await tx.$queryRaw`SELECT set_config('gl.organization_id',${orgs[0]},true),set_config('gl.finance','on',true)`;
      expect(await tx.billingReconciliation.count()).toBe(1);
    });
    await expect(restricted.$transaction(async tx=>{
      await tx.$queryRaw`SELECT set_config('gl.organization_id',${orgs[0]},true),set_config('gl.finance','on',true)`;
      return tx.billingReconciliation.delete({where:{id:reconciliation.id}});
    })).rejects.toThrow();
    const journal=await financialJournal(a);
    expect(journal.length).toBe(5);
    expect(journal.find(e=>e.kind==='devis')?.actorId).toBe(a.accountId);
    expect(journal.find(e=>e.kind==='facture')?.actorId).toBe(a.accountId);
    expect(journal.find(e=>e.kind==='rapprochement')?.reference).toBe(proof.statementReference);
    expect(await financialJournal(b)).toEqual([]);
    await expect(financialJournal(agent)).rejects.toThrow();
    expect((await billingOverview(b)).totals).toEqual({invoiced:'0',paid:'0',credited:'0',outstanding:'0'});
    const multi=await createQuote(a,{customerId:cust.id,lines:[{description:'Fret',quantity:2,unitPrice:100001,taxBps:1800},{description:'Emballage',quantity:1,unitPrice:5000,taxBps:0}]});
    const detail=await billingDocument(a,multi.id);
    expect(detail.lines.length).toBe(2);
    expect(detail.subtotal).toBe(205002);
    expect(detail.taxTotal).toBe(36000);
    expect(detail.total).toBe(241002);
    expect(new TextDecoder().decode(billingPdf(detail).slice(0,5))).toBe('%PDF-');
    expect(csvCell('=1+1')).toBe('"\'=1+1"');
    expect(billingCsv(await billingExport(a))).toContain('300000');
    expect(await billingExport(b)).toEqual([]);
    const credit={reference:'AV-1',amount:41002,reason:'Remise commerciale',version:1};
    await expect(recordCredit(a,multi.id,credit)).rejects.toThrow();
    const issued=await issueInvoice(a,multi.id,0);
    expect(issued.invoiceNumber?.endsWith('-000002')).toBe(true);
    await expect(recordCredit(b,multi.id,credit)).rejects.toThrow();
    await expect(recordCredit(agent,multi.id,credit)).rejects.toThrow();
    await expect(recordCredit(a,multi.id,{...credit,amount:241003})).rejects.toThrow();
    const adjustment=await recordCredit(a,multi.id,credit);
    expect((await recordCredit(a,multi.id,credit)).id).toBe(adjustment.id);
    await expect(recordCredit(a,multi.id,{...credit,reason:'Autre'})).rejects.toThrow();
    await expect(recordPayment(a,multi.id,{amount:200001,reference:'EXCESS',method:'bank',version:2})).rejects.toThrow();
    const competing=await Promise.allSettled([
      recordPayment(a,multi.id,{amount:200000,reference:'FINAL',method:'bank',version:2}),
      recordCredit(a,multi.id,{reference:'AV-2',amount:200000,reason:'Annulation',version:2}),
    ]);
    expect(competing.filter(r=>r.status==='fulfilled').length).toBe(1);
    expect((await billingOverview(a)).totals.outstanding).toBe('0');
    expect((await financialJournal(a)).some(e=>e.kind==='avoir'&&e.reference==='AV-1')).toBe(true);
    expect(await restricted.billingCredit.count()).toBe(0);
    expect(await restricted.billingCounter.count()).toBe(0);
    await restricted.$transaction(async tx=>{
      await tx.$queryRaw`SELECT set_config('gl.organization_id',${orgs[1]},true),set_config('gl.finance','on',true)`;
      expect(await tx.billingCredit.count()).toBe(0);
      expect(await tx.billingCounter.count()).toBe(0);
    });
    await expect(billingDocument(b,multi.id)).rejects.toThrow();
    const ownLogin=await login(a.accountId+'@example.invalid',password,orgs[0]);
    if(ownLogin.status!=='ok')throw new Error('Login failed');
    const pdfResponse=await pdfGet(new NextRequest(origin+'/api/saas/billing/'+multi.id+'/pdf',{headers:{cookie:'gl_session='+ownLogin.token}}),{params:Promise.resolve({id:multi.id})});
    expect(pdfResponse.status).toBe(200);
    expect(pdfResponse.headers.get('content-type')).toBe('application/pdf');
    const logged=await login(agent.accountId+'@example.invalid',password,orgs[0]);
    if(logged.status!=='ok')throw new Error('Login failed');
    expect((await billingGet(new NextRequest(origin+'/api/saas/billing',{headers:{cookie:'gl_session='+logged.token}}))).status).toBe(403);
    await admin.membership.update({where:{organizationId_accountId:{organizationId:orgs[0],accountId:a.accountId}},data:{role:'agent'}});
    await expect(billingOverview(a)).rejects.toThrow();
  }finally{
    await admin.billingReconciliation.deleteMany({where:{organizationId:{in:orgs}}});
    await admin.billingCredit.deleteMany({where:{organizationId:{in:orgs}}});
    await admin.billingCounter.deleteMany({where:{organizationId:{in:orgs}}});
    await admin.billingPayment.deleteMany({where:{organizationId:{in:orgs}}});
    await admin.billingLine.deleteMany({where:{organizationId:{in:orgs}}});
    await admin.billingDocument.deleteMany({where:{organizationId:{in:orgs}}});
    await admin.customer.deleteMany({where:{organizationId:{in:orgs}}});
    await admin.session.deleteMany({where:{accountId:{in:users}}});
    await admin.membership.deleteMany({where:{organizationId:{in:orgs}}});
    await admin.account.deleteMany({where:{id:{in:users}}});
    await admin.organization.deleteMany({where:{id:{in:orgs}}});
    await admin.$disconnect();await restricted.$disconnect();
  }
},30000);

test('commercial profile: tenant isolation and immutable seller snapshot',async()=>{
  const admin=new PrismaClient({datasourceUrl:process.env.SAAS_DATABASE_URL!});
  const restricted=new PrismaClient({datasourceUrl:process.env.SAAS_TENANT_DATABASE_URL!});
  const orgs=['commercial-a','commercial-b'],users=['commercial-admin','commercial-other','commercial-agent'];
  await admin.organization.createMany({data:orgs.map(id=>({id,name:id,slug:id}))});
  await admin.account.createMany({data:users.map(id=>({id,email:id+'@example.invalid',displayName:id}))});
  await admin.membership.createMany({data:users.map((accountId,i)=>({accountId,organizationId:i===1?orgs[1]:orgs[0],role:i===2?'agent':'admin'}))});
  const identity=(i:number):Identity=>({accountId:users[i],organizationId:i===1?orgs[1]:orgs[0],role:i===2?'agent':'admin',displayName:users[i]});
  const a=identity(0),b=identity(1),agent=identity(2);
  const config={legalName:'Transport Alpha',address:'Conakry',email:'contact@example.invalid',phone:'+224 600 00 00 00',taxId:'NIF-DECLARED'};
  try{
    expect((await commercialProfile(a)).legalName).toBe(orgs[0]);
    expect(commercialInput.safeParse({...config,email:'invalid'}).success).toBe(false);
    expect(commercialInput.safeParse({...config,legalName:'  '}).success).toBe(false);
    await expect(updateCommercialProfile(agent,config)).rejects.toThrow();
    await expect(commercialProfile(agent)).rejects.toThrow();
    await updateCommercialProfile(a,config);
    expect((await commercialProfile(a)).legalName).toBe(config.legalName);
    expect((await commercialProfile(b)).legalName).toBe(orgs[1]);
    expect(await restricted.commercialProfile.count()).toBe(0);
    const customer=await createCustomer(a,{name:'Client'});
    const quote=await createQuote(a,{customerId:customer.id,description:'Transport',quantity:1,unitPrice:1000});
    expect(quote.sellerName).toBe(config.legalName);
    expect(quote.sellerTaxId).toBe(config.taxId);
    await updateCommercialProfile(a,{...config,legalName:'Transport Beta',taxId:'OTHER'});
    const invoice=await issueInvoice(a,quote.id,0);
    expect(invoice.sellerName).toBe(config.legalName);
    expect(invoice.sellerTaxId).toBe(config.taxId);
    const next=await createQuote(a,{customerId:customer.id,description:'Transport',quantity:1,unitPrice:1000});
    expect(next.sellerName).toBe('Transport Beta');
    expect(new TextDecoder().decode(billingPdf(await billingDocument(a,quote.id)).slice(0,5))).toBe('%PDF-');
    await expect(restricted.$transaction(async tx=>{
      await tx.$queryRaw`SELECT set_config('gl.organization_id',${orgs[0]},true),set_config('gl.finance','on',true)`;
      return tx.billingDocument.update({where:{id:quote.id},data:{sellerName:'Tampered'}});
    })).rejects.toThrow();
    await restricted.$transaction(async tx=>{
      await tx.$queryRaw`SELECT set_config('gl.organization_id',${orgs[1]},true),set_config('gl.finance','on',true)`;
      expect(await tx.commercialProfile.count()).toBe(0);
    });
  }finally{
    await admin.billingCounter.deleteMany({where:{organizationId:{in:orgs}}});
    await admin.billingLine.deleteMany({where:{organizationId:{in:orgs}}});
    await admin.billingDocument.deleteMany({where:{organizationId:{in:orgs}}});
    await admin.commercialProfile.deleteMany({where:{organizationId:{in:orgs}}});
    await admin.customer.deleteMany({where:{organizationId:{in:orgs}}});
    await admin.membership.deleteMany({where:{organizationId:{in:orgs}}});
    await admin.account.deleteMany({where:{id:{in:users}}});
    await admin.organization.deleteMany({where:{id:{in:orgs}}});
    await admin.$disconnect();await restricted.$disconnect();
  }
},30000);
