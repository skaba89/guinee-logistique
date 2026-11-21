/// <reference types="bun-types" />
import {test,expect} from 'bun:test';
import {PrismaClient} from '../../../generated/saas';
import {type Identity,hashPassword,login} from '../../../src/lib/saas-auth';
import {createCustomer,createShipment,updateShipment,assignMission,listMissions,completeMission,cancelMission,getShipment,operationalFeed} from '../../../src/lib/saas-logistics';
import {POST as completeRoute} from '../../../src/app/api/saas/missions/[id]/complete/route';
import {NextRequest} from 'next/server';

test('missions: assignment, isolation, proof, cancellation, idempotent completion',async()=>{
  const admin=new PrismaClient({datasourceUrl:process.env.SAAS_DATABASE_URL!});
  const restricted=new PrismaClient({datasourceUrl:process.env.SAAS_TENANT_DATABASE_URL!});
  const orgs=['mission-a','mission-b'],users=['mission-admin','mission-driver','mission-other','mission-foreign'];
  const password='CI-mission-strong-password',passwordHash=await hashPassword(password);
  const origin='https://saas.example.invalid';
  process.env.SAAS_AUTH_ENABLED='true';process.env.SAAS_PUBLIC_ORIGIN=origin;
  await admin.organization.createMany({data:orgs.map(id=>({id,name:id,slug:id}))});
  await admin.account.createMany({data:users.map(id=>({id,email:id+'@example.invalid',displayName:id,passwordHash}))});
  await admin.membership.createMany({data:users.map((accountId,i)=>({accountId,organizationId:i===3?orgs[1]:orgs[0],role:i===0?'admin':'ramasseur'}))});
  const identity=(i:number):Identity=>({accountId:users[i],organizationId:i===3?orgs[1]:orgs[0],role:i===0?'admin':'ramasseur',displayName:users[i]});
  const a=identity(0),d=identity(1),o=identity(2),f=identity(3);
  try{
    const customer=await createCustomer(a,{name:'Mission Customer'});
    const s=await createShipment(a,{customerId:customer.id,origin:'Conakry',destination:'Kindia'});
    await updateShipment(a,s.id,{version:0,status:'confirmed'});
    await expect(assignMission(a,s.id,{version:1,assigneeId:f.accountId,kind:'pickup',address:'Conakry'})).rejects.toThrow();
    const pickup=await assignMission(a,s.id,{version:1,assigneeId:d.accountId,kind:'pickup',address:'Conakry'});
    expect((await listMissions(d)).map(m=>m.id)).toEqual([pickup.id]);
    expect(await listMissions(o)).toEqual([]);
    expect(await operationalFeed(o)).toEqual([]);
    expect((await operationalFeed(d)).map(e=>e.id)).toEqual([pickup.id]);
    expect(await listMissions(f)).toEqual([]);
    await expect(updateShipment(a,s.id,{version:2,status:'in_transit'})).rejects.toThrow();
    await expect(completeMission(o,pickup.id,{recipient:'Other'})).rejects.toThrow();
    await expect(completeMission(a,pickup.id,{recipient:'Admin'})).rejects.toThrow();
    await expect(completeMission(f,pickup.id,{recipient:'Foreign'})).rejects.toThrow();
    await cancelMission(a,pickup.id);
    await expect(completeMission(d,pickup.id,{recipient:'Cancelled'})).rejects.toThrow();
    const replacement=await assignMission(a,s.id,{version:3,assigneeId:d.accountId,kind:'pickup',address:'Conakry'});
    await completeMission(d,replacement.id,{recipient:'Sender'});
    await completeMission(d,replacement.id,{recipient:'Sender'});
    await expect(completeMission(d,replacement.id,{recipient:'Changed'})).rejects.toThrow();
    const transit=await getShipment(a,s.id);
    expect(transit.status).toBe('in_transit');
    const delivery=await assignMission(a,s.id,{version:transit.version,assigneeId:o.accountId,kind:'delivery',address:'Kindia'});
    const logged=await login(o.accountId+'@example.invalid',password,orgs[0]);
    if(logged.status!=='ok')throw new Error('Login failed');
    const request=()=>new NextRequest(origin+'/api/saas/missions/'+delivery.id+'/complete',{method:'POST',headers:{origin,'content-type':'application/json',cookie:'gl_session='+logged.token},body:JSON.stringify({recipient:'Recipient',note:'Received'})});
    const context={params:Promise.resolve({id:delivery.id})};
    expect((await completeRoute(request(),context)).status).toBe(200);
    expect((await completeRoute(request(),context)).status).toBe(200);
    const final=await getShipment(a,s.id);
    expect(final.events.map(e=>e.status)).toEqual(['draft','confirmed','in_transit','delivered']);
    const proof=(await listMissions(a)).find(m=>m.id===delivery.id);
    expect(proof?.recipient).toBe('Recipient');
    expect(proof?.completedAt).not.toBeNull();
    expect((await operationalFeed(o)).map(e=>e.message)).toEqual(['Remise confirmée']);
    await restricted.$transaction(async tx=>{
      await tx.$queryRaw`SELECT set_config('gl.organization_id',${orgs[0]},true),set_config('gl.collector_id',${o.accountId},true)`;
      expect(await tx.mission.count()).toBe(1);
      expect(await tx.customer.count()).toBe(0);
    });
    await admin.membership.update({where:{organizationId_accountId:{organizationId:orgs[0],accountId:o.accountId}},data:{active:false}});
    expect((await completeRoute(request(),context)).status).toBe(401);
  }finally{
    await admin.mission.deleteMany({where:{organizationId:{in:orgs}}});
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
