-- Identity and organization registry. No demo credentials or fixtures.
CREATE TYPE "TenantRole" AS ENUM ('admin', 'manager', 'agent', 'viewer', 'client', 'ramasseur');
CREATE TABLE "Organization" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "Agency" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  UNIQUE ("organizationId", "code")
);
CREATE TABLE "Account" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "displayName" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "Membership" (
  "organizationId" TEXT NOT NULL REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "accountId" TEXT NOT NULL REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "role" "TenantRole" NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY ("organizationId", "accountId")
);
CREATE INDEX "Membership_accountId_idx" ON "Membership"("accountId");

-- Runtime role is NOT a database owner, superuser, or BYPASSRLS role.
-- Tenant context must only be set by a trusted server after authentication.
ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Organization" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Agency" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Agency" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Membership" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Membership" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_organization ON "Organization" FOR SELECT TO gl_tenant
  USING ("id" = NULLIF(current_setting('gl.organization_id', true), ''));
CREATE POLICY tenant_agency ON "Agency" FOR ALL TO gl_tenant
  USING ("organizationId" = NULLIF(current_setting('gl.organization_id', true), ''))
  WITH CHECK ("organizationId" = NULLIF(current_setting('gl.organization_id', true), ''));
CREATE POLICY tenant_membership ON "Membership" FOR SELECT TO gl_tenant
  USING ("organizationId" = NULLIF(current_setting('gl.organization_id', true), ''));

GRANT USAGE ON SCHEMA public TO gl_tenant;
GRANT SELECT ON "Organization", "Membership" TO gl_tenant;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Agency" TO gl_tenant;
-- Account and membership mutations intentionally unavailable to tenant runtime.
