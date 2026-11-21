CREATE TYPE "BillingStatus" AS ENUM ('quote','invoice');
CREATE TYPE "PaymentMethod" AS ENUM ('cash','bank','orange_money','mtn_momo');
CREATE TABLE "BillingDocument" (
 "id" TEXT PRIMARY KEY,
 "organizationId" TEXT NOT NULL,
 "customerId" TEXT NOT NULL,
 "customerName" TEXT NOT NULL,
 "quoteNumber" TEXT NOT NULL UNIQUE,
 "invoiceNumber" TEXT UNIQUE,
 "status" "BillingStatus" NOT NULL DEFAULT 'quote',
 "description" TEXT NOT NULL,
 "quantity" INTEGER NOT NULL CHECK ("quantity">0),
 "unitPrice" INTEGER NOT NULL CHECK ("unitPrice">0),
 "total" INTEGER NOT NULL CHECK ("total">0 AND "total"::BIGINT="quantity"::BIGINT*"unitPrice"::BIGINT),
 "paid" INTEGER NOT NULL DEFAULT 0 CHECK ("paid">=0 AND "paid"<="total"),
 "version" INTEGER NOT NULL DEFAULT 0 CHECK ("version">=0),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "issuedAt" TIMESTAMP(3),
 UNIQUE ("organizationId","id"),
 FOREIGN KEY ("organizationId","customerId") REFERENCES "Customer"("organizationId","id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CHECK (("status"='quote' AND "invoiceNumber" IS NULL AND "issuedAt" IS NULL AND "paid"=0) OR
 ("status"='invoice' AND "invoiceNumber" IS NOT NULL AND "issuedAt" IS NOT NULL))
);
CREATE INDEX "BillingDocument_organizationId_createdAt_idx" ON "BillingDocument"("organizationId","createdAt");
CREATE TABLE "BillingPayment" (
 "id" TEXT PRIMARY KEY,
 "organizationId" TEXT NOT NULL,
 "documentId" TEXT NOT NULL,
 "reference" TEXT NOT NULL,
 "amount" INTEGER NOT NULL CHECK ("amount">0),
 "method" "PaymentMethod" NOT NULL,
 "actorId" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE ("organizationId","reference"),
 FOREIGN KEY ("organizationId","documentId") REFERENCES "BillingDocument"("organizationId","id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "BillingPayment_organizationId_documentId_idx" ON "BillingPayment"("organizationId","documentId");
ALTER TABLE "BillingDocument" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BillingDocument" FORCE ROW LEVEL SECURITY;
ALTER TABLE "BillingPayment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BillingPayment" FORCE ROW LEVEL SECURITY;
CREATE POLICY finance_document ON "BillingDocument" FOR ALL TO gl_tenant
 USING ("organizationId"=NULLIF(current_setting('gl.organization_id',true),'') AND current_setting('gl.finance',true)='on' AND NULLIF(current_setting('gl.portal_account_id',true),'') IS NULL AND NULLIF(current_setting('gl.collector_id',true),'') IS NULL)
 WITH CHECK ("organizationId"=NULLIF(current_setting('gl.organization_id',true),'') AND current_setting('gl.finance',true)='on' AND NULLIF(current_setting('gl.portal_account_id',true),'') IS NULL AND NULLIF(current_setting('gl.collector_id',true),'') IS NULL);
CREATE POLICY finance_payment ON "BillingPayment" FOR ALL TO gl_tenant
 USING ("organizationId"=NULLIF(current_setting('gl.organization_id',true),'') AND current_setting('gl.finance',true)='on' AND NULLIF(current_setting('gl.portal_account_id',true),'') IS NULL AND NULLIF(current_setting('gl.collector_id',true),'') IS NULL)
 WITH CHECK ("organizationId"=NULLIF(current_setting('gl.organization_id',true),'') AND current_setting('gl.finance',true)='on' AND NULLIF(current_setting('gl.portal_account_id',true),'') IS NULL AND NULLIF(current_setting('gl.collector_id',true),'') IS NULL);
GRANT SELECT, INSERT, UPDATE ON "BillingDocument" TO gl_tenant;
GRANT SELECT, INSERT ON "BillingPayment" TO gl_tenant;
