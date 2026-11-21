\set ON_ERROR_STOP on
BEGIN;
INSERT INTO "Organization" ("id","name","slug") VALUES ('a','Entreprise A','a'),('b','Entreprise B','b');
INSERT INTO "Account" ("id","email","displayName") VALUES ('u','test@example.invalid','Test');
INSERT INTO "Membership" ("organizationId","accountId","role") VALUES ('a','u','admin'),('b','u','viewer');
INSERT INTO "Agency" ("id","organizationId","name","code") VALUES ('aa','a','Agence A','HQ'),('bb','b','Agence B','HQ');
SET LOCAL ROLE gl_tenant;
DO $$
BEGIN
  IF (SELECT count(*) FROM "Agency") <> 0 THEN RAISE EXCEPTION 'Missing context leaked data'; END IF;
  IF (SELECT count(*) FROM "Organization") <> 0 THEN RAISE EXCEPTION 'Missing context leaked organization'; END IF;
  IF (SELECT count(*) FROM "Membership") <> 0 THEN RAISE EXCEPTION 'Missing context leaked memberships'; END IF;
END $$;
SELECT set_config('gl.organization_id','a',true);
DO $$
BEGIN
  IF (SELECT count(*) FROM "Agency") <> 1 OR NOT EXISTS (SELECT FROM "Agency" WHERE id='aa') THEN
    RAISE EXCEPTION 'Agency isolation failed';
  END IF;
  IF (SELECT count(*) FROM "Organization") <> 1 OR (SELECT count(*) FROM "Membership") <> 1 THEN
    RAISE EXCEPTION 'Organization or membership isolation failed';
  END IF;
  BEGIN
    INSERT INTO "Agency" ("id","organizationId","name","code") VALUES ('bad','b','Forbidden','BAD');
    RAISE EXCEPTION 'Cross-tenant insert allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    UPDATE "Agency" SET "organizationId"='b' WHERE id='aa';
    RAISE EXCEPTION 'Cross-tenant reassignment allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  IF EXISTS (SELECT FROM "Agency" WHERE id='bb') THEN RAISE EXCEPTION 'Cross-tenant read allowed'; END IF;
  UPDATE "Agency" SET name='Allowed' WHERE id='aa';
  IF NOT FOUND THEN RAISE EXCEPTION 'Own tenant write failed'; END IF;
  DELETE FROM "Agency" WHERE id='bb';
  IF FOUND THEN RAISE EXCEPTION 'Cross-tenant delete allowed'; END IF;
  IF has_table_privilege(current_user, '"Account"', 'SELECT') THEN RAISE EXCEPTION 'Account registry exposed'; END IF;
END $$;
SELECT set_config('gl.organization_id','b',true);
DO $$
BEGIN
  IF (SELECT count(*) FROM "Agency") <> 1 OR NOT EXISTS (SELECT FROM "Agency" WHERE id='bb') THEN
    RAISE EXCEPTION 'Second tenant isolation failed';
  END IF;
END $$;
ROLLBACK;
