/// <reference types="bun-types" />
import {test,expect} from 'bun:test';
import {PrismaClient} from '../../../generated/saas';
import {type Identity,hashPassword,login} from '../../../src/lib/saas-auth';
import {createCustomer} from '../../../src/lib/saas-logistics';
import {createQuote,issueInvoice,recordPayment,billingOverview,quoteInput} from '../../../src/lib/saas-billing';
import {GET as billingGet} from '../../../src/app/api/saas/billing/route';
import {NextRequest} from 'next/server';

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
    expect(overview.totals).toEqual({invoiced:'300000',paid:'300000',outstanding:'0'});
    expect(overview.documents[0].payments.length).toBe(2);
    expect((await billingOverview(b)).totals).toEqual({invoiced:'0',paid:'0',outstanding:'0'});
    const logged=await login(agent.accountId+'@example.invalid',password,orgs[0]);
    if(logged.status!=='ok')throw new Error('Login failed');
    expect((await billingGet(new NextRequest(origin+'/api/saas/billing',{headers:{cookie:'gl_session='+logged.token}}))).status).toBe(403);
    await admin.membership.update({where:{organizationId_accountId:{organizationId:orgs[0],accountId:a.accountId}},data:{role:'agent'}});
    await expect(billingOverview(a)).rejects.toThrow();
  }finally{
    await admin.billingPayment.deleteMany({where:{organizationId:{in:orgs}}});
    await admin.billingDocument.deleteMany({where:{organizationId:{in:orgs}}});
    await admin.customer.deleteMany({where:{organizationId:{in:orgs}}});
    await admin.session.deleteMany({where:{accountId:{in:users}}});
    await admin.membership.deleteMany({where:{organizationId:{in:orgs}}});
    await admin.account.deleteMany({where:{id:{in:users}}});
    await admin.organization.deleteMany({where:{id:{in:orgs}}});
    await admin.$disconnect();await restricted.$disconnect();
  }
},30000);
