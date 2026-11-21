CREATE TYPE "MobileProvider" AS ENUM ('orange_money','mtn_momo');
CREATE TYPE "MobileIntentStatus" AS ENUM ('pending','matched','cancelled');
CREATE TABLE "MobilePaymentIntent" (
 "id" TEXT PRIMARY KEY,
 "organizationId" TEXT NOT NULL,
 "documentId" TEXT NOT NULL,
 "reference" TEXT NOT NULL CHECK (length(trim("reference"))>0),
 "provider" "MobileProvider" NOT NULL,
 "amount" INTEGER NOT NULL CHECK ("amount">0),
 "status" "MobileIntentStatus" NOT NULL DEFAULT 'pending',
 "paymentId" TEXT,
 "actorId" TEXT NOT NULL,
 "closedById" TEXT,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "closedAt" TIMESTAMP(3),
 UNIQUE ("organizationId","reference"),
 UNIQUE ("organizationId","paymentId"),
 FOREIGN KEY ("organizationId","documentId") REFERENCES "BillingDocument"("organizationId","id") ON DELETE RESTRICT ON UPDATE CASCADE,
 FOREIGN KEY ("organizationId","paymentId") REFERENCES "BillingPayment"("organizationId","id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CHECK (("status"='pending' AND "paymentId" IS NULL AND "closedAt" IS NULL AND "closedById" IS NULL)
 OR ("status"='cancelled' AND "paymentId" IS NULL AND "closedAt" IS NOT NULL AND "closedById" IS NOT NULL)
 OR ("status"='matched' AND "paymentId" IS NOT NULL AND "closedAt" IS NOT NULL AND "closedById" IS NOT NULL))
);
CREATE INDEX "MobilePaymentIntent_organizationId_createdAt_idx" ON "MobilePaymentIntent"("organizationId","createdAt");
ALTER TABLE "MobilePaymentIntent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MobilePaymentIntent" FORCE ROW LEVEL SECURITY;
CREATE POLICY finance_mobile_intent ON "MobilePaymentIntent" FOR ALL TO gl_tenant
 USING ("organizationId"=NULLIF(current_setting('gl.organization_id',true),'') AND current_setting('gl.finance',true)='on' AND NULLIF(current_setting('gl.portal_account_id',true),'') IS NULL AND NULLIF(current_setting('gl.collector_id',true),'') IS NULL)
 WITH CHECK ("organizationId"=NULLIF(current_setting('gl.organization_id',true),'') AND current_setting('gl.finance',true)='on' AND NULLIF(current_setting('gl.portal_account_id',true),'') IS NULL AND NULLIF(current_setting('gl.collector_id',true),'') IS NULL);
GRANT SELECT, INSERT ON "MobilePaymentIntent" TO gl_tenant;
GRANT UPDATE ("status","paymentId","closedById","closedAt") ON "MobilePaymentIntent" TO gl_tenant;
CREATE FUNCTION mobile_intent_transition() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='INSERT' THEN
  IF NEW."status"<>'pending' THEN RAISE EXCEPTION 'Mobile intent must start pending'; END IF;
 ELSIF OLD."status"<>'pending' OR NEW."status" NOT IN ('matched','cancelled') THEN
  RAISE EXCEPTION 'Mobile intent already closed or invalid transition';
 END IF;
 IF NEW."status"='matched' AND NOT EXISTS (
  SELECT 1 FROM "BillingPayment" p JOIN "BillingReconciliation" r ON r."organizationId"=p."organizationId" AND r."paymentId"=p."id"
  WHERE p."organizationId"=NEW."organizationId" AND p."id"=NEW."paymentId" AND p."documentId"=NEW."documentId"
  AND p."amount"=NEW."amount" AND p."method"::text=NEW."provider"::text
 ) THEN RAISE EXCEPTION 'Matching reconciled payment required'; END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER mobile_intent_transition_trigger BEFORE INSERT OR UPDATE ON "MobilePaymentIntent"
 FOR EACH ROW EXECUTE FUNCTION mobile_intent_transition();
