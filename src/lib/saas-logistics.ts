import { randomUUID, randomBytes } from 'node:crypto';
import { PrismaClient, type Prisma, type ShipmentStatus } from '../../generated/saas';
import { hasRole, type Identity } from './saas-auth';
import { z } from 'zod';

let client: PrismaClient | undefined;
function db() {
  const url = process.env.SAAS_TENANT_DATABASE_URL;
  if (!url) throw new LogisticsError(503, 'Service indisponible');
  return client ??= new PrismaClient({ datasourceUrl: url });
}

export class LogisticsError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export const customerInput = z.object({
  name: z.string().trim().min(1).max(150),
  email: z.string().trim().email().max(254).optional(),
  phone: z.string().trim().min(1).max(40).optional(),
}).strict();
export const shipmentInput = z.object({
  customerId: z.string().min(1).max(128),
  origin: z.string().trim().min(1).max(200),
  destination: z.string().trim().min(1).max(200),
}).strict();
export const shipmentUpdate = z.object({
  version: z.number().int().min(0).max(2147483646),
  origin: z.string().trim().min(1).max(200).optional(),
  destination: z.string().trim().min(1).max(200).optional(),
  status: z.enum(['draft', 'confirmed', 'in_transit', 'delivered', 'cancelled']).optional(),
}).strict().refine(value => value.origin !== undefined || value.destination !== undefined || value.status !== undefined);

const readers = ['admin', 'manager', 'agent', 'viewer'] as const;
const writers = ['admin', 'manager', 'agent'] as const;
export function canReadLogistics(identity: Identity) { return hasRole(identity, readers); }
export function canWriteLogistics(identity: Identity) { return hasRole(identity, writers); }

async function tenant<T>(identity: Identity, write: boolean, action: (tx: Prisma.TransactionClient) => Promise<T>, portal = false) {
  if (!(portal ? !write && identity.role === 'client' : write ? canWriteLogistics(identity) : canReadLogistics(identity))) throw new LogisticsError(403, 'Accès refusé');
  return db().$transaction(async tx => {
    await tx.$queryRaw`SELECT set_config('gl.organization_id', ${identity.organizationId}, true)`;
    await tx.$queryRaw`SELECT set_config('gl.portal_account_id', ${portal ? identity.accountId : ''}, true)`;
    const membership = await tx.membership.findUnique({ where: { organizationId_accountId: { organizationId: identity.organizationId, accountId: identity.accountId } } });
    if (!membership?.active || !(portal ? membership.role === 'client' : (write ? writers : readers).some(role => role === membership.role))) throw new LogisticsError(403, 'Accès refusé');
    return action(tx);
  });
}

export function listCustomers(identity: Identity) {
  return tenant(identity, false, tx => tx.customer.findMany({ where: { organizationId: identity.organizationId }, orderBy: [{createdAt:'desc'}, {id:'asc'}], take: 100 }));
}
export function createCustomer(identity: Identity, input: z.infer<typeof customerInput>) {
  return tenant(identity, true, tx => tx.customer.create({ data: { ...customerInput.parse(input), organizationId: identity.organizationId } }));
}
export function listShipments(identity: Identity) {
  return tenant(identity, false, tx => tx.shipment.findMany({ where: { organizationId: identity.organizationId }, include: { customer: {select:{name:true}} }, orderBy: [{createdAt:'desc'}, {id:'asc'}], take: 100 }));
}
export function getShipment(identity: Identity, id: string) {
  return tenant(identity, false, async tx => {
    const shipment = await tx.shipment.findUnique({ where: { organizationId_id: { organizationId: identity.organizationId, id } }, include: { events: { orderBy: {version:'asc'} }, customer: {select:{name:true}}, parcels: {orderBy:{createdAt:'asc'}} } });
    if (!shipment) throw new LogisticsError(404, 'Expédition introuvable');
    return shipment;
  });
}

export const parcelInput = z.object({
  description: z.string().trim().min(1).max(200),
  weightGrams: z.number().int().min(1).max(100000000),
  version: z.number().int().min(0).max(2147483646),
}).strict();

export function createParcel(identity: Identity, shipmentId: string, input: z.infer<typeof parcelInput>) {
  return tenant(identity,true,async tx=>{
    const data=parcelInput.parse(input);
    const shipment=await tx.shipment.findUnique({where:{organizationId_id:{organizationId:identity.organizationId,id:shipmentId}}});
    if(!shipment)throw new LogisticsError(404,'Expédition introuvable');
    // Serialize with status transitions using the same optimistic version.
    const updated=await tx.shipment.updateMany({where:{id:shipmentId,organizationId:identity.organizationId,status:'draft',version:data.version},data:{version:{increment:1}}});
    if(updated.count!==1)throw new LogisticsError(409,'Expédition non modifiable ou version obsolète');
    return tx.parcel.create({data:{organizationId:identity.organizationId,shipmentId,description:data.description,weightGrams:data.weightGrams,barcode:randomBytes(8).toString('hex').toUpperCase()}});
  });
}

export function scanParcel(identity: Identity, barcode: string) {
  return tenant(identity,false,async tx=>{
    const parcel=await tx.parcel.findFirst({where:{organizationId:identity.organizationId,barcode},include:{shipment:{select:{id:true,trackingNumber:true,status:true}}}});
    if(!parcel)throw new LogisticsError(404,'Colis introuvable');
    return parcel;
  });
}

const portalFields = {
  trackingNumber:true,origin:true,destination:true,status:true,createdAt:true,
  events:{orderBy:{version:'asc' as const},select:{status:true,createdAt:true}},
  parcels:{orderBy:{createdAt:'asc' as const},select:{barcode:true,description:true,weightGrams:true}},
} as const;
export function portalShipments(identity: Identity) {
  return tenant(identity,false,tx=>tx.shipment.findMany({
    where:{organizationId:identity.organizationId,customer:{portalAccess:{some:{accountId:identity.accountId,organizationId:identity.organizationId}}}},
    select:portalFields,orderBy:{createdAt:'desc'},take:100,
  }),true);
}
export function createShipment(identity: Identity, input: z.infer<typeof shipmentInput>) {
  return tenant(identity, true, async tx => {
    const data = shipmentInput.parse(input);
    if (!await tx.customer.findUnique({where:{organizationId_id:{organizationId:identity.organizationId,id:data.customerId}}})) throw new LogisticsError(404, 'Client introuvable');
    const shipment = await tx.shipment.create({ data: { ...data, organizationId: identity.organizationId, trackingNumber: 'GL-' + randomUUID().toUpperCase() } });
    await tx.shipmentEvent.create({data:{organizationId:identity.organizationId,shipmentId:shipment.id,actorId:identity.accountId,status:shipment.status,version:0}});
    return shipment;
  });
}
const transitions: Record<ShipmentStatus, readonly ShipmentStatus[]> = {
  draft: ['confirmed','cancelled'], confirmed: ['in_transit','cancelled'], in_transit: ['delivered'], delivered: [], cancelled: [],
};
export function updateShipment(identity: Identity, id: string, input: z.infer<typeof shipmentUpdate>) {
  return tenant(identity, true, async tx => {
    const data = shipmentUpdate.parse(input);
    const where = { organizationId_id: { organizationId: identity.organizationId, id } };
    const current = await tx.shipment.findUnique({where});
    if (!current) throw new LogisticsError(404, 'Expédition introuvable');
    if (current.version !== data.version) throw new LogisticsError(409, 'Version obsolète');
    if (data.status && !transitions[current.status].includes(data.status)) throw new LogisticsError(409, 'Transition interdite');
    if ((data.origin !== undefined || data.destination !== undefined) && current.status !== 'draft') throw new LogisticsError(409, 'Itinéraire modifiable uniquement en brouillon');
    const next = await tx.shipment.updateMany({where:{id,organizationId:identity.organizationId,version:data.version},data:{origin:data.origin,destination:data.destination,status:data.status,version:{increment:1}}});
    if (next.count !== 1) throw new LogisticsError(409, 'Version obsolète');
    if (data.status) await tx.shipmentEvent.create({data:{organizationId:identity.organizationId,shipmentId:id,actorId:identity.accountId,status:data.status,version:data.version+1}});
    return tx.shipment.findUniqueOrThrow({where});
  });
}
