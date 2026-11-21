/// <reference types="bun-types" />
import { test, expect } from 'bun:test';
import { PrismaClient } from '../../../generated/saas';
import { createCustomer,createShipment,createParcel,scanParcel,portalShipments,updateShipment } from '../../../src/lib/saas-logistics';
import { type Identity,hashPassword,login } from '../../../src/lib/saas-auth';
import { NextRequest } from 'next/server';
import { GET as portalGet } from '../../../src/app/api/saas/portal/shipments/route';
import { GET as scanGet } from '../../../src/app/api/saas/parcels/scan/route';
import { barcodeBars } from '../../../src/lib/parcel-barcode';

test('Code 39 label has quiet zones, start/stop, and 5 bars per symbol',()=>{
  const {bars,width}=barcodeBars('0123456789ABCDEF');
  expect(bars.length).toBe(90);
  expect(bars[0].x).toBe(10);
  expect(width-(bars[bars.length-1].x+bars[bars.length-1].width)).toBe(10);
  expect(()=>barcodeBars('INVALID')).toThrow();
});

test('parcel lifecycle, portal customer isolation and revoked access', async()=>{
  const admin=new PrismaClient({datasourceUrl:process.env.SAAS_DATABASE_URL!});
  const restricted=new PrismaClient({datasourceUrl:process.env.SAAS_TENANT_DATABASE_URL!});
  const orgs=['portal-a','portal-b'],users=['portal-admin','portal-client','portal-other'];
  const password='CI-portal-strong-password';
  const passwordHash=await hashPassword(password);
  process.env.SAAS_AUTH_ENABLED='true';process.env.SAAS_PUBLIC_ORIGIN='https://saas.example.invalid';
  await admin.organization.createMany({data:orgs.map(id=>({id,name:id,slug:id}))});
  await admin.account.createMany({data:users.map(id=>({id,email:id+'@example.invalid',displayName:id,passwordHash}))});
  await admin.membership.createMany({data:[{organizationId:orgs[0],accountId:users[0],role:'admin'},{organizationId:orgs[0],accountId:users[1],role:'client'},{organizationId:orgs[1],accountId:users[2],role:'admin'}]});
  const identity=(accountId:string,organizationId:string,role:Identity['role']):Identity=>({accountId,organizationId,role,displayName:accountId});
  const a=identity(users[0],orgs[0],'admin'),c=identity(users[1],orgs[0],'client'),b=identity(users[2],orgs[1],'admin');
  try{
    const customer=await createCustomer(a,{name:'Allowed'});
    const forbidden=await createCustomer(a,{name:'Forbidden'});
    const other=await createCustomer(b,{name:'Other tenant'});
    const first=await createShipment(a,{customerId:customer.id,origin:'Conakry',destination:'Kankan'});
    const second=await createShipment(a,{customerId:forbidden.id,origin:'Conakry',destination:'Kindia'});
    const third=await createShipment(b,{customerId:other.id,origin:'Boké',destination:'Labé'});
    const parcel=await createParcel(a,first.id,{description:'Box',weightGrams:500,version:0});
    await createParcel(a,second.id,{description:'Hidden',weightGrams:200,version:0});
    await createParcel(b,third.id,{description:'Other',weightGrams:200,version:0});
    await expect(createParcel(a,first.id,{description:'Stale',weightGrams:500,version:0})).rejects.toThrow();
    await expect(createParcel(b,first.id,{description:'Foreign',weightGrams:500,version:1})).rejects.toThrow();
    await updateShipment(a,first.id,{version:1,status:'confirmed'});
    await expect(createParcel(a,first.id,{description:'Late',weightGrams:500,version:2})).rejects.toThrow();
    expect((await scanParcel(a,parcel.barcode)).shipment.status).toBe('confirmed');
    await expect(scanParcel(b,parcel.barcode)).rejects.toThrow();
    await expect(scanParcel(c,parcel.barcode)).rejects.toThrow();
    expect(await portalShipments(c)).toEqual([]);
    await admin.customerAccess.create({data:{organizationId:orgs[0],accountId:users[1],customerId:customer.id}});
    await expect(admin.customerAccess.create({data:{organizationId:orgs[0],accountId:users[1],customerId:other.id}})).rejects.toThrow();
    const result=await login(users[1]+'@example.invalid',password,orgs[0]);
    if(result.status!=='ok')throw new Error('Login failed');
    const request=(path:string)=>new NextRequest('https://saas.example.invalid'+path,{headers:{cookie:'gl_session='+result.token}});
    const response=await portalGet(request('/api/saas/portal/shipments'));
    expect(response.status).toBe(200);
    const data=(await response.json()).data;
    expect(data.length).toBe(1);
    expect(data[0].trackingNumber).toBe(first.trackingNumber);
    expect(data[0].events.map((e:{status:string})=>e.status)).toEqual(['draft','confirmed']);
    expect(data[0].events[0]).not.toHaveProperty('actorId');
    expect(data[0].parcels[0].barcode).toBe(parcel.barcode);
    expect((await scanGet(request('/api/saas/parcels/scan?barcode='+parcel.barcode))).status).toBe(403);
    await restricted.$transaction(async tx=>{
      await tx.$queryRaw`SELECT set_config('gl.organization_id',${orgs[0]},true),set_config('gl.portal_account_id',${users[1]},true)`;
      expect(await tx.customer.count()).toBe(1);
      expect(await tx.shipment.count()).toBe(1);
      expect(await tx.parcel.count()).toBe(1);
      expect(await tx.shipmentEvent.count()).toBe(2);
    });
    await expect(restricted.$transaction(async tx=>{
      await tx.$queryRaw`SELECT set_config('gl.organization_id',${orgs[0]},true),set_config('gl.portal_account_id',${users[1]},true)`;
      return tx.customer.create({data:{organizationId:orgs[0],name:'Forbidden write'}});
    })).rejects.toThrow();
    await admin.customerAccess.deleteMany({where:{accountId:users[1]}});
    expect(await portalShipments(c)).toEqual([]);
  }finally{
    await admin.customerAccess.deleteMany({where:{organizationId:{in:orgs}}});
    await admin.parcel.deleteMany({where:{organizationId:{in:orgs}}});
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
