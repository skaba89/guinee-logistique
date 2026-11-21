\getenv auth_password GL_AUTH_PASSWORD
\getenv tenant_password GL_TENANT_PASSWORD
SELECT 'CREATE ROLE gl_auth_runtime LOGIN' WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='gl_auth_runtime') \gexec
SELECT 'CREATE ROLE gl_tenant_runtime LOGIN' WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='gl_tenant_runtime') \gexec
ALTER ROLE gl_auth_runtime LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS INHERIT PASSWORD :'auth_password';
ALTER ROLE gl_tenant_runtime LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS INHERIT PASSWORD :'tenant_password';
GRANT gl_auth TO gl_auth_runtime;
GRANT gl_tenant TO gl_tenant_runtime;
DO $$
BEGIN
 IF EXISTS (
  SELECT 1 FROM pg_auth_members m JOIN pg_roles member ON member.oid=m.member JOIN pg_roles parent ON parent.oid=m.roleid
  WHERE (member.rolname='gl_auth_runtime' AND parent.rolname<>'gl_auth') OR
        (member.rolname='gl_tenant_runtime' AND parent.rolname<>'gl_tenant')
 ) THEN RAISE EXCEPTION 'Unexpected runtime role membership'; END IF;
END $$;
