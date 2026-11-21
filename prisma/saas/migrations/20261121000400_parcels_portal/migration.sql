CREATE TABLE "CustomerAccess" (
  "organizationId" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  PRIMARY KEY ("organizationId","accountId","customerId"),
  FOREIGN KEY ("organizationId","accountId") REFERENCES "Membership"("organizationId","accountId") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("organizationId","customerId") REFERENCES "Customer"("organizationId","id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "CustomerAccess_organizationId_customerId_idx" ON "CustomerAccess"("organizationId","customerId");
CREATE TABLE "Parcel" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "shipmentId" TEXT NOT NULL,
  "barcode" TEXT NOT NULL UNIQUE,
  "description" TEXT NOT NULL,
  "weightGrams" INTEGER NOT NULL CHECK ("weightGrams" > 0),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("organizationId","shipmentId") REFERENCES "Shipment"("organizationId","id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "Parcel_organizationId_shipmentId_idx" ON "Parcel"("organizationId","shipmentId");
ALTER TABLE "CustomerAccess" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CustomerAccess" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Parcel" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Parcel" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_customer_access ON "CustomerAccess" FOR SELECT TO gl_tenant
  USING ("organizationId" = NULLIF(current_setting('gl.organization_id',true),'')
    AND "accountId" = NULLIF(current_setting('gl.portal_account_id',true),''));
CREATE POLICY tenant_parcel ON "Parcel" FOR ALL TO gl_tenant
  USING ("organizationId" = NULLIF(current_setting('gl.organization_id',true),''))
  WITH CHECK ("organizationId" = NULLIF(current_setting('gl.organization_id',true),''));
-- Restrictive policies narrow the existing organization boundary for a client portal session.
CREATE POLICY portal_customer ON "Customer" AS RESTRICTIVE FOR SELECT TO gl_tenant
  USING (NULLIF(current_setting('gl.portal_account_id',true),'') IS NULL OR EXISTS (
    SELECT 1 FROM "CustomerAccess" a WHERE a."organizationId"="Customer"."organizationId" AND a."customerId"="Customer"."id"));
CREATE POLICY portal_shipment ON "Shipment" AS RESTRICTIVE FOR SELECT TO gl_tenant
  USING (NULLIF(current_setting('gl.portal_account_id',true),'') IS NULL OR EXISTS (
    SELECT 1 FROM "CustomerAccess" a WHERE a."organizationId"="Shipment"."organizationId" AND a."customerId"="Shipment"."customerId"));
CREATE POLICY portal_events ON "ShipmentEvent" AS RESTRICTIVE FOR SELECT TO gl_tenant
  USING (NULLIF(current_setting('gl.portal_account_id',true),'') IS NULL OR EXISTS (
    SELECT 1 FROM "Shipment" s WHERE s."organizationId"="ShipmentEvent"."organizationId" AND s."id"="ShipmentEvent"."shipmentId"));
CREATE POLICY portal_parcel ON "Parcel" AS RESTRICTIVE FOR SELECT TO gl_tenant
  USING (NULLIF(current_setting('gl.portal_account_id',true),'') IS NULL OR EXISTS (
    SELECT 1 FROM "Shipment" s WHERE s."organizationId"="Parcel"."organizationId" AND s."id"="Parcel"."shipmentId"));
GRANT SELECT ON "CustomerAccess" TO gl_tenant;
GRANT SELECT, INSERT ON "Parcel" TO gl_tenant;
CREATE POLICY portal_customer_readonly ON "Customer" AS RESTRICTIVE FOR ALL TO gl_tenant
  USING (true) WITH CHECK (NULLIF(current_setting('gl.portal_account_id',true),'') IS NULL);
CREATE POLICY portal_shipment_readonly ON "Shipment" AS RESTRICTIVE FOR ALL TO gl_tenant
  USING (true) WITH CHECK (NULLIF(current_setting('gl.portal_account_id',true),'') IS NULL);
CREATE POLICY portal_parcel_readonly ON "Parcel" AS RESTRICTIVE FOR ALL TO gl_tenant
  USING (true) WITH CHECK (NULLIF(current_setting('gl.portal_account_id',true),'') IS NULL);
CREATE POLICY portal_events_readonly ON "ShipmentEvent" AS RESTRICTIVE FOR ALL TO gl_tenant
  USING (true) WITH CHECK (NULLIF(current_setting('gl.portal_account_id',true),'') IS NULL);
