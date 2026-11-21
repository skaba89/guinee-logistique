-- Run as database administrator before migrations. Do not grant this role to clients.
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'gl_tenant') THEN
    CREATE ROLE gl_tenant NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'gl_tenant'
    AND (rolsuper OR rolbypassrls OR rolcreaterole OR rolcreatedb OR rolreplication OR rolcanlogin)) THEN
    RAISE EXCEPTION 'Unsafe gl_tenant role';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'gl_auth') THEN
    CREATE ROLE gl_auth NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'gl_auth'
    AND (rolsuper OR rolbypassrls OR rolcreaterole OR rolcreatedb OR rolreplication OR rolcanlogin)) THEN
    RAISE EXCEPTION 'Unsafe gl_auth role';
  END IF;
END $$;
