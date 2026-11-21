CREATE TABLE "CommercialProfile" (
 "organizationId" TEXT PRIMARY KEY REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 "legalName" TEXT NOT NULL CHECK (length(trim("legalName"))>0),
 "address" TEXT NOT NULL,
 "email" TEXT NOT NULL,
 "phone" TEXT NOT NULL,
 "taxId" TEXT NOT NULL,
 "updatedById" TEXT NOT NULL,
 "updatedAt" TIMESTAMP(3) NOT NULL
);
ALTER TABLE "CommercialProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CommercialProfile" FORCE ROW LEVEL SECURITY;
CREATE POLICY finance_commercial_profile ON "CommercialProfile" FOR ALL TO gl_tenant
 USING ("organizationId"=NULLIF(current_setting('gl.organization_id',true),'') AND current_setting('gl.finance',true)='on' AND NULLIF(current_setting('gl.portal_account_id',true),'') IS NULL AND NULLIF(current_setting('gl.collector_id',true),'') IS NULL)
 WITH CHECK ("organizationId"=NULLIF(current_setting('gl.organization_id',true),'') AND current_setting('gl.finance',true)='on' AND NULLIF(current_setting('gl.portal_account_id',true),'') IS NULL AND NULLIF(current_setting('gl.collector_id',true),'') IS NULL);
GRANT SELECT, INSERT, UPDATE ON "CommercialProfile" TO gl_tenant;
ALTER TABLE "BillingDocument" ADD COLUMN "sellerName" TEXT, ADD COLUMN "sellerAddress" TEXT,
 ADD COLUMN "sellerEmail" TEXT, ADD COLUMN "sellerPhone" TEXT, ADD COLUMN "sellerTaxId" TEXT;
-- Freeze the seller on quote creation. Legacy rows remain unknown rather than inventing historical details.
CREATE FUNCTION billing_seller_snapshot() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='INSERT' THEN
  SELECT COALESCE(p."legalName",o."name"),p."address",p."email",p."phone",p."taxId"
   INTO NEW."sellerName",NEW."sellerAddress",NEW."sellerEmail",NEW."sellerPhone",NEW."sellerTaxId"
   FROM "Organization" o LEFT JOIN "CommercialProfile" p ON p."organizationId"=o."id"
   WHERE o."id"=NEW."organizationId";
 ELSIF ROW(NEW."sellerName",NEW."sellerAddress",NEW."sellerEmail",NEW."sellerPhone",NEW."sellerTaxId")
    IS DISTINCT FROM ROW(OLD."sellerName",OLD."sellerAddress",OLD."sellerEmail",OLD."sellerPhone",OLD."sellerTaxId") THEN
  RAISE EXCEPTION 'Seller snapshot is immutable';
 END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER billing_seller_snapshot_trigger BEFORE INSERT OR UPDATE ON "BillingDocument"
 FOR EACH ROW EXECUTE FUNCTION billing_seller_snapshot();
