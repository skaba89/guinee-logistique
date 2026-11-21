-- Only for the disposable CI database after the bootstrap/restore checks.
BEGIN;
DO $$
BEGIN
  IF (SELECT count(*) FROM "Organization") <> 1
    OR NOT EXISTS (SELECT 1 FROM "Organization" WHERE slug = 'ci-company')
    OR NOT EXISTS (SELECT 1 FROM "Account" WHERE email = 'ci-admin@example.invalid' AND "passwordHash" IS NOT NULL)
  THEN RAISE EXCEPTION 'Expected disposable CI bootstrap database'; END IF;
END $$;
INSERT INTO "Organization" (id,name,slug) VALUES ('recipe-b','Recipe B','recipe-b');
INSERT INTO "Account" (id,email,"displayName","passwordHash")
SELECT v.id,v.email,v.name,a."passwordHash"
FROM (VALUES
  ('recipe-other','recipe-other@example.invalid','Other admin'),
  ('recipe-client','recipe-client@example.invalid','Client'),
  ('recipe-driver','recipe-driver@example.invalid','Collector'),
  ('recipe-viewer','recipe-viewer@example.invalid','Viewer')
) v(id,email,name)
CROSS JOIN "Account" a WHERE a.email='ci-admin@example.invalid';
INSERT INTO "Membership" ("organizationId","accountId",role)
SELECT o.id,v.account,v.role::"TenantRole"
FROM "Organization" o JOIN (VALUES
  ('recipe-b','recipe-other','admin'),
  ('ci-company','recipe-client','client'),
  ('ci-company','recipe-driver','ramasseur'),
  ('ci-company','recipe-viewer','viewer')
) v(slug,account,role) ON v.slug=o.slug;
INSERT INTO "Customer" (id,"organizationId",name)
SELECT 'recipe-client-customer',id,'Recipe customer' FROM "Organization" WHERE slug='ci-company';
INSERT INTO "CustomerAccess" ("organizationId","accountId","customerId")
SELECT id,'recipe-client','recipe-client-customer' FROM "Organization" WHERE slug='ci-company';
COMMIT;
