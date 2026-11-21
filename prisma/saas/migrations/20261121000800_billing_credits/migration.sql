ALTER TABLE "BillingDocument" ADD COLUMN "credited" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "BillingDocument" ADD CONSTRAINT billing_credit_balance CHECK ("credited">=0 AND "paid"::BIGINT+"credited"<="total" AND ("status"='invoice' OR "credited"=0));
CREATE TABLE "BillingCounter" (
 "organizationId" TEXT NOT NULL REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 "year" INTEGER NOT NULL,
 "value" INTEGER NOT NULL CHECK ("value">0),
 PRIMARY KEY ("organizationId","year")
);
CREATE TABLE "BillingCredit" (
 "id" TEXT PRIMARY KEY,
 "organizationId" TEXT NOT NULL,
 "documentId" TEXT NOT NULL,
 "reference" TEXT NOT NULL,
 "reason" TEXT NOT NULL CHECK (length(trim("reason"))>0),
 "amount" INTEGER NOT NULL CHECK ("amount">0),
 "actorId" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE ("organizationId","reference"),
 FOREIGN KEY ("organizationId","documentId") REFERENCES "BillingDocument"("organizationId","id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "BillingCredit_organizationId_documentId_idx" ON "BillingCredit"("organizationId","documentId");
ALTER TABLE "BillingCounter" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BillingCounter" FORCE ROW LEVEL SECURITY;
ALTER TABLE "BillingCredit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BillingCredit" FORCE ROW LEVEL SECURITY;
CREATE POLICY finance_counter ON "BillingCounter" FOR ALL TO gl_tenant
 USING ("organizationId"=NULLIF(current_setting('gl.organization_id',true),'') AND current_setting('gl.finance',true)='on' AND NULLIF(current_setting('gl.portal_account_id',true),'') IS NULL AND NULLIF(current_setting('gl.collector_id',true),'') IS NULL)
 WITH CHECK ("organizationId"=NULLIF(current_setting('gl.organization_id',true),'') AND current_setting('gl.finance',true)='on' AND NULLIF(current_setting('gl.portal_account_id',true),'') IS NULL AND NULLIF(current_setting('gl.collector_id',true),'') IS NULL);
CREATE POLICY finance_credit ON "BillingCredit" FOR ALL TO gl_tenant
 USING ("organizationId"=NULLIF(current_setting('gl.organization_id',true),'') AND current_setting('gl.finance',true)='on' AND NULLIF(current_setting('gl.portal_account_id',true),'') IS NULL AND NULLIF(current_setting('gl.collector_id',true),'') IS NULL)
 WITH CHECK ("organizationId"=NULLIF(current_setting('gl.organization_id',true),'') AND current_setting('gl.finance',true)='on' AND NULLIF(current_setting('gl.portal_account_id',true),'') IS NULL AND NULLIF(current_setting('gl.collector_id',true),'') IS NULL);
GRANT SELECT, INSERT, UPDATE ON "BillingCounter" TO gl_tenant;
GRANT SELECT, INSERT ON "BillingCredit" TO gl_tenant;
