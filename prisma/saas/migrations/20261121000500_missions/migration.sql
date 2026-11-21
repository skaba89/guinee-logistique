CREATE TYPE "MissionKind" AS ENUM ('pickup','delivery');
CREATE TYPE "MissionStatus" AS ENUM ('assigned','completed','cancelled');
CREATE TABLE "Mission" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "shipmentId" TEXT NOT NULL,
  "assigneeId" TEXT NOT NULL,
  "kind" "MissionKind" NOT NULL,
  "status" "MissionStatus" NOT NULL DEFAULT 'assigned',
  "address" TEXT NOT NULL,
  "recipient" TEXT,
  "note" TEXT,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("organizationId","shipmentId") REFERENCES "Shipment"("organizationId","id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("organizationId","assigneeId") REFERENCES "Membership"("organizationId","accountId") ON DELETE RESTRICT ON UPDATE CASCADE,
  CHECK (("status"='completed' AND "recipient" IS NOT NULL AND "completedAt" IS NOT NULL) OR ("status"<>'completed' AND "recipient" IS NULL AND "completedAt" IS NULL))
);
CREATE INDEX "Mission_organizationId_assigneeId_status_idx" ON "Mission"("organizationId","assigneeId","status");
CREATE INDEX "Mission_organizationId_shipmentId_idx" ON "Mission"("organizationId","shipmentId");
CREATE UNIQUE INDEX "Mission_active_kind" ON "Mission"("organizationId","shipmentId","kind") WHERE "status"<>'cancelled';
ALTER TABLE "Mission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Mission" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_mission ON "Mission" FOR ALL TO gl_tenant
 USING ("organizationId"=NULLIF(current_setting('gl.organization_id',true),'')
 AND NULLIF(current_setting('gl.portal_account_id',true),'') IS NULL
 AND (NULLIF(current_setting('gl.collector_id',true),'') IS NULL OR "assigneeId"=NULLIF(current_setting('gl.collector_id',true),'')))
 WITH CHECK ("organizationId"=NULLIF(current_setting('gl.organization_id',true),'')
 AND NULLIF(current_setting('gl.portal_account_id',true),'') IS NULL
 AND (NULLIF(current_setting('gl.collector_id',true),'') IS NULL OR "assigneeId"=NULLIF(current_setting('gl.collector_id',true),'')));
GRANT SELECT, INSERT, UPDATE ON "Mission" TO gl_tenant;
-- Collector context cannot browse other customers or shipments.
CREATE POLICY collector_shipment ON "Shipment" AS RESTRICTIVE FOR SELECT TO gl_tenant
 USING (NULLIF(current_setting('gl.collector_id',true),'') IS NULL OR EXISTS (
 SELECT 1 FROM "Mission" m WHERE m."organizationId"="Shipment"."organizationId" AND m."shipmentId"="Shipment"."id"));
CREATE POLICY collector_customer ON "Customer" AS RESTRICTIVE FOR ALL TO gl_tenant
 USING (NULLIF(current_setting('gl.collector_id',true),'') IS NULL)
 WITH CHECK (NULLIF(current_setting('gl.collector_id',true),'') IS NULL);
CREATE POLICY collector_parcel ON "Parcel" AS RESTRICTIVE FOR ALL TO gl_tenant
 USING (NULLIF(current_setting('gl.collector_id',true),'') IS NULL)
 WITH CHECK (NULLIF(current_setting('gl.collector_id',true),'') IS NULL);
CREATE POLICY collector_event ON "ShipmentEvent" AS RESTRICTIVE FOR ALL TO gl_tenant
 USING (NULLIF(current_setting('gl.collector_id',true),'') IS NULL OR EXISTS (
 SELECT 1 FROM "Mission" m WHERE m."organizationId"="ShipmentEvent"."organizationId" AND m."shipmentId"="ShipmentEvent"."shipmentId"))
 WITH CHECK (NULLIF(current_setting('gl.collector_id',true),'') IS NULL OR EXISTS (
 SELECT 1 FROM "Mission" m WHERE m."organizationId"="ShipmentEvent"."organizationId" AND m."shipmentId"="ShipmentEvent"."shipmentId" AND "ShipmentEvent"."actorId"=NULLIF(current_setting('gl.collector_id',true),'')));
CREATE POLICY collector_shipment_write ON "Shipment" AS RESTRICTIVE FOR UPDATE TO gl_tenant
 USING (NULLIF(current_setting('gl.collector_id',true),'') IS NULL OR EXISTS (
 SELECT 1 FROM "Mission" m WHERE m."organizationId"="Shipment"."organizationId" AND m."shipmentId"="Shipment"."id" AND m."status"='assigned'))
 WITH CHECK (NULLIF(current_setting('gl.collector_id',true),'') IS NULL OR EXISTS (
 SELECT 1 FROM "Mission" m WHERE m."organizationId"="Shipment"."organizationId" AND m."shipmentId"="Shipment"."id" AND m."status"='assigned'));
CREATE POLICY collector_shipment_insert ON "Shipment" AS RESTRICTIVE FOR INSERT TO gl_tenant
 WITH CHECK (NULLIF(current_setting('gl.collector_id',true),'') IS NULL);
