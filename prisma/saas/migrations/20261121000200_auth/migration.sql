ALTER TABLE "Account" ADD COLUMN "passwordHash" TEXT;
CREATE TABLE "Session" (
  "tokenHash" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("organizationId","accountId") REFERENCES "Membership"("organizationId","accountId") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
CREATE TABLE "LoginAttempt" (
  "key" TEXT PRIMARY KEY,
  "count" INTEGER NOT NULL,
  "windowStart" TIMESTAMP(3) NOT NULL
);
GRANT USAGE ON SCHEMA public TO gl_auth;
GRANT SELECT ON "Account", "Membership", "Organization" TO gl_auth;
GRANT SELECT, INSERT, DELETE ON "Session" TO gl_auth;
GRANT SELECT, INSERT, UPDATE ON "LoginAttempt" TO gl_auth;
CREATE POLICY auth_memberships ON "Membership" FOR SELECT TO gl_auth USING (true);
CREATE POLICY auth_organizations ON "Organization" FOR SELECT TO gl_auth USING (true);
