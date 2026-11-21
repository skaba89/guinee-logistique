ALTER TABLE "BillingDocument" ADD COLUMN "createdById" TEXT, ADD COLUMN "issuedById" TEXT;
ALTER TABLE "BillingPayment" ADD CONSTRAINT "BillingPayment_organizationId_id_key" UNIQUE ("organizationId","id");
CREATE TABLE "BillingReconciliation" (
 "id" TEXT PRIMARY KEY,
 "organizationId" TEXT NOT NULL,
 "paymentId" TEXT NOT NULL,
 "statementReference" TEXT NOT NULL CHECK (length(trim("statementReference"))>0),
 "amount" INTEGER NOT NULL CHECK ("amount">0),
 "actorId" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE ("organizationId","paymentId"),
 UNIQUE ("organizationId","statementReference"),
 FOREIGN KEY ("organizationId","paymentId") REFERENCES "BillingPayment"("organizationId","id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "BillingReconciliation_organizationId_createdAt_idx" ON "BillingReconciliation"("organizationId","createdAt");
ALTER TABLE "BillingReconciliation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BillingReconciliation" FORCE ROW LEVEL SECURITY;
CREATE POLICY finance_reconciliation ON "BillingReconciliation" FOR ALL TO gl_tenant
 USING ("organizationId"=NULLIF(current_setting('gl.organization_id',true),'') AND current_setting('gl.finance',true)='on' AND NULLIF(current_setting('gl.portal_account_id',true),'') IS NULL AND NULLIF(current_setting('gl.collector_id',true),'') IS NULL)
 WITH CHECK ("organizationId"=NULLIF(current_setting('gl.organization_id',true),'') AND current_setting('gl.finance',true)='on' AND NULLIF(current_setting('gl.portal_account_id',true),'') IS NULL AND NULLIF(current_setting('gl.collector_id',true),'') IS NULL);
GRANT SELECT, INSERT ON "BillingReconciliation" TO gl_tenant;
