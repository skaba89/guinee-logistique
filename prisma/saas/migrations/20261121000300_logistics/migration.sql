CREATE TYPE "ShipmentStatus" AS ENUM ('draft', 'confirmed', 'in_transit', 'delivered', 'cancelled');
CREATE TABLE "Customer" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("organizationId","id")
);
CREATE INDEX "Customer_organizationId_createdAt_idx" ON "Customer"("organizationId","createdAt");
CREATE TABLE "Shipment" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "customerId" TEXT NOT NULL,
  "trackingNumber" TEXT NOT NULL UNIQUE,
  "origin" TEXT NOT NULL,
  "destination" TEXT NOT NULL,
  "status" "ShipmentStatus" NOT NULL DEFAULT 'draft',
  "version" INTEGER NOT NULL DEFAULT 0 CHECK ("version" >= 0),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("organizationId","id"),
  FOREIGN KEY ("organizationId","customerId") REFERENCES "Customer"("organizationId","id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "Shipment_organizationId_createdAt_idx" ON "Shipment"("organizationId","createdAt");
CREATE INDEX "Shipment_organizationId_customerId_idx" ON "Shipment"("organizationId","customerId");
CREATE TABLE "ShipmentEvent" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "shipmentId" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "status" "ShipmentStatus" NOT NULL,
  "version" INTEGER NOT NULL CHECK ("version" >= 0),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("organizationId","shipmentId","version"),
  FOREIGN KEY ("organizationId","shipmentId") REFERENCES "Shipment"("organizationId","id") ON DELETE RESTRICT ON UPDATE CASCADE
);
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Customer" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Shipment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Shipment" FORCE ROW LEVEL SECURITY;
ALTER TABLE "ShipmentEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ShipmentEvent" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_customer ON "Customer" FOR ALL TO gl_tenant
  USING ("organizationId" = NULLIF(current_setting('gl.organization_id', true), ''))
  WITH CHECK ("organizationId" = NULLIF(current_setting('gl.organization_id', true), ''));
CREATE POLICY tenant_shipment ON "Shipment" FOR ALL TO gl_tenant
  USING ("organizationId" = NULLIF(current_setting('gl.organization_id', true), ''))
  WITH CHECK ("organizationId" = NULLIF(current_setting('gl.organization_id', true), ''));
CREATE POLICY tenant_shipment_event ON "ShipmentEvent" FOR ALL TO gl_tenant
  USING ("organizationId" = NULLIF(current_setting('gl.organization_id', true), ''))
  WITH CHECK ("organizationId" = NULLIF(current_setting('gl.organization_id', true), ''));
GRANT SELECT, INSERT, UPDATE ON "Customer", "Shipment" TO gl_tenant;
GRANT SELECT, INSERT ON "ShipmentEvent" TO gl_tenant;
