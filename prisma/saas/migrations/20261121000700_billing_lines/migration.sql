-- Preserve every existing one-line document and paid balance.
ALTER TABLE "BillingDocument" ADD COLUMN "subtotal" INTEGER;
ALTER TABLE "BillingDocument" ADD COLUMN "taxTotal" INTEGER NOT NULL DEFAULT 0;
UPDATE "BillingDocument" SET "subtotal"="total";
ALTER TABLE "BillingDocument" ALTER COLUMN "subtotal" SET NOT NULL;
-- Replace the one-line total invariant with an aggregate invariant.
DO $$
DECLARE old_check text;
BEGIN
 SELECT conname INTO STRICT old_check FROM pg_constraint
 WHERE conrelid='"BillingDocument"'::regclass AND contype='c'
 AND pg_get_constraintdef(oid) LIKE '%"quantity"%' AND pg_get_constraintdef(oid) LIKE '%"unitPrice"%';
 EXECUTE format('ALTER TABLE "BillingDocument" DROP CONSTRAINT %I',old_check);
END $$;
ALTER TABLE "BillingDocument" ADD CONSTRAINT "billing_total_check" CHECK ("subtotal">0 AND "taxTotal">=0 AND "total"::bigint="subtotal"::bigint+"taxTotal"::bigint AND "total"<=2000000000);
CREATE TABLE "BillingLine" (
 "id" TEXT PRIMARY KEY,
 "organizationId" TEXT NOT NULL,
 "documentId" TEXT NOT NULL,
 "position" INTEGER NOT NULL CHECK ("position">0),
 "description" TEXT NOT NULL,
 "quantity" INTEGER NOT NULL CHECK ("quantity">0),
 "unitPrice" INTEGER NOT NULL CHECK ("unitPrice">0),
 "taxBps" INTEGER NOT NULL CHECK ("taxBps" BETWEEN 0 AND 10000),
 "subtotal" INTEGER NOT NULL CHECK ("subtotal"::bigint="quantity"::bigint*"unitPrice"::bigint),
 "tax" INTEGER NOT NULL CHECK ("tax"::bigint=("subtotal"::bigint*"taxBps"+5000)/10000),
 "total" INTEGER NOT NULL CHECK ("total"::bigint="subtotal"::bigint+"tax"::bigint),
 UNIQUE ("organizationId","documentId","position"),
 FOREIGN KEY ("organizationId","documentId") REFERENCES "BillingDocument"("organizationId","id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "BillingLine" ("id","organizationId","documentId","position","description","quantity","unitPrice","taxBps","subtotal","tax","total")
 SELECT "id"||'-legacy',"organizationId","id",1,"description","quantity","unitPrice",0,"total",0,"total" FROM "BillingDocument";
ALTER TABLE "BillingLine" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BillingLine" FORCE ROW LEVEL SECURITY;
CREATE POLICY finance_line ON "BillingLine" FOR ALL TO gl_tenant
 USING ("organizationId"=NULLIF(current_setting('gl.organization_id',true),'') AND current_setting('gl.finance',true)='on' AND NULLIF(current_setting('gl.portal_account_id',true),'') IS NULL AND NULLIF(current_setting('gl.collector_id',true),'') IS NULL)
 WITH CHECK ("organizationId"=NULLIF(current_setting('gl.organization_id',true),'') AND current_setting('gl.finance',true)='on' AND NULLIF(current_setting('gl.portal_account_id',true),'') IS NULL AND NULLIF(current_setting('gl.collector_id',true),'') IS NULL);
GRANT SELECT, INSERT ON "BillingLine" TO gl_tenant;
