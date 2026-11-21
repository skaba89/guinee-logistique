import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { PrismaClient, type TenantRole } from '../../generated/saas';

const SESSION_TTL = 8 * 60 * 60;
export const SESSION_COOKIE = 'gl_session';
export const SESSION_MAX_AGE = SESSION_TTL;
const DUMMY_HASH = 'scrypt$' + '00'.repeat(16) + '$' + '00'.repeat(64);
let client: PrismaClient | undefined;

function db() {
  const url = process.env.SAAS_AUTH_DATABASE_URL;
  if (!url) throw new Error('SAAS_AUTH_DATABASE_URL missing');
  return client ??= new PrismaClient({ datasourceUrl: url });
}

function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 },
      (error, key) => error ? reject(error) : resolve(key));
  });
}

export async function hashPassword(password: string): Promise<string> {
  if (password.length < 12 || password.length > 128) throw new Error('Invalid password length');
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return ['scrypt', salt.toString('hex'), key.toString('hex')].join('$');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (password.length > 128 || !/^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(hash)) return false;
  const [, salt, key] = hash.split('$');
  return timingSafeEqual(await derive(password, Buffer.from(salt, 'hex')), Buffer.from(key, 'hex'));
}

function digest(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

async function allowAttempt(email: string): Promise<boolean> {
  const rows = await db().$queryRaw<{ count: number }[]>`
    INSERT INTO "LoginAttempt" ("key", "count", "windowStart")
    VALUES (${digest(email)}, 1, CURRENT_TIMESTAMP)
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "LoginAttempt"."windowStart" <= CURRENT_TIMESTAMP - INTERVAL '15 minutes' THEN 1 ELSE "LoginAttempt"."count" + 1 END,
      "windowStart" = CASE WHEN "LoginAttempt"."windowStart" <= CURRENT_TIMESTAMP - INTERVAL '15 minutes' THEN CURRENT_TIMESTAMP ELSE "LoginAttempt"."windowStart" END
    WHERE "LoginAttempt"."windowStart" <= CURRENT_TIMESTAMP - INTERVAL '15 minutes' OR "LoginAttempt"."count" < 5
    RETURNING "count"`;
  return rows.length > 0;
}

export type Identity = { accountId: string; organizationId: string; role: TenantRole; displayName: string };

export async function login(email: string, password: string, organizationId: string) {
  const normalized = email.trim().toLowerCase();
  if (!await allowAttempt(normalized)) return { status: 'limited' } as const;
  const account = await db().account.findUnique({ where: { email: normalized } });
  const valid = await verifyPassword(password, account?.passwordHash ?? DUMMY_HASH);
  if (!valid || !account?.passwordHash) return { status: 'invalid' } as const;
  const membership = await db().membership.findUnique({
    where: { organizationId_accountId: { organizationId, accountId: account.id } },
  });
  if (!membership?.active) return { status: 'invalid' } as const;
  const token = randomBytes(32).toString('base64url');
  await db().session.create({ data: { tokenHash: digest(token), organizationId, accountId: account.id,
    expiresAt: new Date(Date.now() + SESSION_TTL * 1000) } });
  return { status: 'ok', token } as const;
}

export async function sessionIdentity(token: string | undefined): Promise<Identity | null> {
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const session = await db().session.findUnique({
    where: { tokenHash: digest(token) },
    include: { membership: { include: { account: true } } },
  });
  if (!session || session.expiresAt <= new Date() || !session.membership.active) return null;
  return { accountId: session.accountId, organizationId: session.organizationId,
    role: session.membership.role, displayName: session.membership.account.displayName };
}

export async function logout(token: string | undefined) {
  if (token && /^[A-Za-z0-9_-]{43}$/.test(token)) await db().session.deleteMany({ where: { tokenHash: digest(token) } });
}

export function hasRole(identity: Identity | null, roles: readonly TenantRole[]): boolean {
  return identity !== null && roles.includes(identity.role);
}

// Never accept a tenant ID or role from the browser for this directory.
export async function organizationMembers(token: string | undefined) {
  const identity = await sessionIdentity(token);
  if (!identity || !hasRole(identity, ['admin'])) return null;
  return db().membership.findMany({
    where: { organizationId: identity.organizationId },
    select: { accountId: true, role: true, active: true, account: { select: { displayName: true, email: true } } },
    orderBy: { accountId: 'asc' },
  });
}
