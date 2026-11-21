/// <reference types="bun-types" />
import { test, expect } from 'bun:test';
import { PrismaClient } from '../../../generated/saas';
import { hashPassword, login, type Identity } from '../../../src/lib/saas-auth';
import { NextRequest } from 'next/server';
import { POST as customerPost, GET as customerGet } from '../../../src/app/api/saas/customers/route';
import { POST as shipmentPost } from '../../../src/app/api/saas/shipments/route';
import { GET as shipmentGet, PATCH as shipmentPatch } from '../../../src/app/api/saas/shipments/[id]/route';
import { listCustomers, createCustomer } from '../../../src/lib/saas-logistics';

test('logistics API and database RLS: role, tenant, workflow and version conflicts', async () => {
  const admin=new PrismaClient({datasourceUrl:process.env.SAAS_DATABASE_URL!});
  const restricted=new PrismaClient({datasourceUrl:process.env.SAAS_TENANT_DATABASE_URL!});
  const origin='https://saas.example.invalid';
  process.env.SAAS_AUTH_ENABLED='true';
  process.env.SAAS_PUBLIC_ORIGIN=origin;
  const password='CI-logistics-strong-password';
  const passwordHash=await hashPassword(password);
  const orgs=['log-a','log-b'];
  const users=['log-admin','log-viewer','log-other','log-client'];
  await admin.organization.createMany({data:orgs.map(id=>({id,name:id,slug:id}))});
  await admin.account.createMany({data:users.map(id=>({id,email:id+'@example.invalid',displayName:id,passwordHash}))});
  await admin.membership.createMany({data:[
    {organizationId:'log-a',accountId:users[0],role:'admin'},
    {organizationId:'log-a',accountId:users[1],role:'viewer'},
    {organizationId:'log-b',accountId:users[2],role:'admin'},
    {organizationId:'log-a',accountId:users[3],role:'client'},
  ]});
  try {
    const tokens: string[]=[];
    for(const [i,user] of users.entries()){
      const result=await login(user+'@example.invalid',password,i===2?'log-b':'log-a');
      if(result.status!=='ok')throw new Error('Login failed');
      tokens.push(result.token);
    }
    function req(path:string,method:string,token?:string,body?:object,requestOrigin=origin){
      return new NextRequest(origin+path,{method,headers:{origin:requestOrigin,'content-type':'application/json',...(token?{cookie:'gl_session='+token}:{})},...(body?{body:JSON.stringify(body)}:{})});
    }
    const customers='/api/saas/customers',shipments='/api/saas/shipments';
    expect((await customerGet(req(customers,'GET'))).status).toBe(401);
    expect((await customerPost(req(customers,'POST',tokens[0],{name:'A'},'https://evil.invalid'))).status).toBe(403);
    expect((await customerPost(req(customers,'POST',tokens[1],{name:'A'}))).status).toBe(403);
    expect((await customerGet(req(customers,'GET',tokens[3]))).status).toBe(403);
    expect((await customerPost(req(customers,'POST',tokens[0],{name:'A',organizationId:'log-b'}))).status).toBe(400);
    const a=await customerPost(req(customers,'POST',tokens[0],{name:'Client A'}));
    const b=await customerPost(req(customers,'POST',tokens[2],{name:'Client B'}));
    expect(a.status).toBe(201);expect(b.status).toBe(201);
    const aid=(await a.json()).data.id,bid=(await b.json()).data.id;
    const viewer=await customerGet(req(customers,'GET',tokens[1]));
    expect((await viewer.json()).data.map((c:{id:string})=>c.id)).toEqual([aid]);
    expect((await shipmentPost(req(shipments,'POST',tokens[0],{customerId:bid,origin:'Conakry',destination:'Kankan'}))).status).toBe(404);
    const created=await shipmentPost(req(shipments,'POST',tokens[0],{customerId:aid,origin:'Conakry',destination:'Kankan'}));
    expect(created.status).toBe(201);
    const shipment=(await created.json()).data;
    expect(shipment.trackingNumber.startsWith('GL-')).toBe(true);
    const path=shipments+'/'+shipment.id,context={params:Promise.resolve({id:shipment.id})};
    expect((await shipmentGet(req(path,'GET',tokens[2]),context)).status).toBe(404);
    expect((await shipmentPatch(req(path,'PATCH',tokens[2],{version:0,status:'confirmed'}),context)).status).toBe(404);
    expect((await shipmentPatch(req(path,'PATCH',tokens[0],{version:0,status:'delivered'}),context)).status).toBe(409);
    const updates=await Promise.all([0,1].map(()=>shipmentPatch(req(path,'PATCH',tokens[0],{version:0,status:'confirmed'}),context)));
    expect(updates.map(r=>r.status).sort()).toEqual([200,409]);
    expect((await shipmentPatch(req(path,'PATCH',tokens[0],{version:1,status:'in_transit'}),context)).status).toBe(200);
    expect((await shipmentPatch(req(path,'PATCH',tokens[0],{version:2,status:'delivered'}),context)).status).toBe(200);
    const detail=await shipmentGet(req(path,'GET',tokens[1]),context);
    expect((await detail.json()).data.events.map((e:{status:string})=>e.status)).toEqual(['draft','confirmed','in_transit','delivered']);
    expect(await restricted.customer.count()).toBe(0);
    expect(await restricted.shipment.count()).toBe(0);
    expect(await restricted.shipmentEvent.count()).toBe(0);
    await restricted.$transaction(async tx=>{
      await tx.$queryRaw`SELECT set_config('gl.organization_id','log-a',true)`;
      expect(await tx.customer.count()).toBe(1);
      expect(await tx.shipment.count()).toBe(1);
      expect(await tx.shipmentEvent.count()).toBe(4);
    });
    await expect(restricted.$transaction(async tx=>{
      await tx.$queryRaw`SELECT set_config('gl.organization_id','log-a',true)`;
      return tx.shipment.create({data:{organizationId:'log-a',customerId:bid,origin:'A',destination:'B',trackingNumber:'cross-tenant'}});
    })).rejects.toThrow();
    await expect(restricted.$transaction(async tx=>{
      await tx.$queryRaw`SELECT set_config('gl.organization_id','log-a',true)`;
      return tx.shipmentEvent.deleteMany({});
    })).rejects.toThrow();
    const identity:Identity={accountId:users[0],organizationId:'log-a',role:'admin',displayName:'Admin'};
    await admin.membership.update({where:{organizationId_accountId:{organizationId:'log-a',accountId:users[0]}},data:{role:'viewer'}});
    await expect(createCustomer(identity,{name:'Denied'})).rejects.toThrow('Accès refusé');
    await admin.membership.update({where:{organizationId_accountId:{organizationId:'log-a',accountId:users[0]}},data:{active:false}});
    await expect(listCustomers(identity)).rejects.toThrow('Accès refusé');
  } finally {
    await admin.shipmentEvent.deleteMany({where:{organizationId:{in:orgs}}});
    await admin.shipment.deleteMany({where:{organizationId:{in:orgs}}});
    await admin.customer.deleteMany({where:{organizationId:{in:orgs}}});
    await admin.session.deleteMany({where:{accountId:{in:users}}});
    await admin.membership.deleteMany({where:{organizationId:{in:orgs}}});
    await admin.account.deleteMany({where:{id:{in:users}}});
    await admin.organization.deleteMany({where:{id:{in:orgs}}});
    await admin.$disconnect();await restricted.$disconnect();
  }
},30000);
