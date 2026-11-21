/// <reference types="bun-types" />
import { test, expect } from 'bun:test';
import { PrismaClient } from '../../../generated/saas';
import { hashPassword, verifyPassword, login, sessionIdentity, logout, hasRole, organizationMembers } from '../../../src/lib/saas-auth';
import { NextRequest } from 'next/server';
import { POST as loginRoute } from '../../../src/app/api/saas/auth/login/route';
import { GET as meRoute } from '../../../src/app/api/saas/auth/me/route';
import { POST as logoutRoute } from '../../../src/app/api/saas/auth/logout/route';

test('restricted auth role: credentials, tenant membership, expiry, revocation and throttling', async () => {
  const admin = new PrismaClient({ datasourceUrl: process.env.SAAS_DATABASE_URL! });
  const password = 'CI-test-only-strong-password';
  const hash = await hashPassword(password);
  expect(await verifyPassword(password, hash)).toBe(true);
  expect(await verifyPassword('wrong', hash)).toBe(false);
  await admin.organization.createMany({ data: [{ id: 'auth-a', name: 'A', slug: 'auth-a' }, { id: 'auth-b', name: 'B', slug: 'auth-b' }] });
  await admin.account.createMany({ data: [{ id: 'auth-u', email: 'auth@example.invalid', displayName: 'Test', passwordHash: hash }, { id: 'auth-other', email: 'other@example.invalid', displayName: 'Other tenant', passwordHash: hash }] });
  await admin.membership.create({ data: { organizationId: 'auth-a', accountId: 'auth-u', role: 'admin' } });
  await admin.membership.create({ data: { organizationId: 'auth-b', accountId: 'auth-other', role: 'admin' } });
  try {
    expect((await login('auth@example.invalid', 'wrong', 'auth-a')).status).toBe('invalid');
    expect((await login('auth@example.invalid', password, 'auth-b')).status).toBe('invalid');
    const result = await login('auth@example.invalid', password, 'auth-a');
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') throw new Error('Login failed');
    const identity = await sessionIdentity(result.token);
    expect(identity?.organizationId).toBe('auth-a');
    expect(hasRole(identity, ['admin'])).toBe(true);
    expect(hasRole(identity, ['viewer'])).toBe(false);
    const members = await organizationMembers(result.token);
    expect(members?.map(member => member.accountId)).toEqual(['auth-u']);
    expect(await organizationMembers(undefined)).toBeNull();
    await admin.membership.update({ where: { organizationId_accountId: { organizationId: 'auth-a', accountId: 'auth-u' } }, data: { role: 'viewer' } });
    expect(await organizationMembers(result.token)).toBeNull();
    await admin.membership.update({ where: { organizationId_accountId: { organizationId: 'auth-a', accountId: 'auth-u' } }, data: { role: 'admin' } });
    expect(await sessionIdentity('invalid')).toBeNull();
    await logout(result.token);
    expect(await sessionIdentity(result.token)).toBeNull();
    const next = await login('auth@example.invalid', password, 'auth-a');
    if (next.status !== 'ok') throw new Error('Second login failed');
    await admin.membership.update({ where: { organizationId_accountId: { organizationId: 'auth-a', accountId: 'auth-u' } }, data: { active: false } });
    expect(await sessionIdentity(next.token)).toBeNull();
    expect((await login('auth@example.invalid', password, 'auth-a')).status).toBe('invalid');
    expect((await login('auth@example.invalid', password, 'auth-a')).status).toBe('limited');
    await admin.membership.update({ where: { organizationId_accountId: { organizationId: 'auth-a', accountId: 'auth-u' } }, data: { active: true } });
    await admin.session.updateMany({ where: { accountId: 'auth-u' }, data: { expiresAt: new Date(0) } });
    expect(await sessionIdentity(next.token)).toBeNull();
  } finally {
    await admin.session.deleteMany({ where: { accountId: { in: ['auth-u', 'auth-other'] } } });
    await admin.membership.deleteMany({ where: { accountId: { in: ['auth-u', 'auth-other'] } } });
    await admin.account.deleteMany({ where: { id: { in: ['auth-u', 'auth-other'] } } });
    await admin.organization.deleteMany({ where: { id: { in: ['auth-a', 'auth-b'] } } });
    await admin.loginAttempt.deleteMany({});
    await admin.$disconnect();
  }
}, 30000);

test('HTTP auth: origin check, cookie flags, identity and logout', async () => {
  const admin = new PrismaClient({ datasourceUrl: process.env.SAAS_DATABASE_URL! });
  const origin = 'https://saas.example.invalid';
  process.env.SAAS_AUTH_ENABLED = 'true';
  process.env.SAAS_PUBLIC_ORIGIN = origin;
  const password = 'CI-http-strong-password';
  const passwordHash = await hashPassword(password);
  await admin.organization.create({ data: { id: 'http-org', name: 'HTTP', slug: 'http-org' } });
  await admin.account.create({ data: { id: 'http-user', email: 'http@example.invalid', displayName: 'HTTP', passwordHash } });
  await admin.membership.create({ data: { organizationId: 'http-org', accountId: 'http-user', role: 'viewer' } });
  const credentials = JSON.stringify({ email: 'http@example.invalid', password, organizationId: 'http-org' });
  const request = (requestOrigin: string) => new NextRequest(origin + '/api/saas/auth/login', { method: 'POST', headers: { origin: requestOrigin, 'content-type': 'application/json' }, body: credentials });
  try {
    expect((await loginRoute(request('https://evil.example.invalid'))).status).toBe(403);
    expect((await meRoute(new NextRequest(origin + '/api/saas/auth/me'))).status).toBe(401);
    const response = await loginRoute(request(origin));
    expect(response.status).toBe(200);
    const setCookie = response.headers.get('set-cookie')!;
    expect(setCookie.toLowerCase()).toContain('httponly');
    expect(setCookie.toLowerCase()).toContain('secure');
    expect(setCookie.toLowerCase()).toContain('samesite=strict');
    const cookie = setCookie.split(';')[0];
    const me = () => meRoute(new NextRequest(origin + '/api/saas/auth/me', { headers: { cookie } }));
    expect(await (await me()).json()).toEqual({ accountId: 'http-user', organizationId: 'http-org', role: 'viewer', displayName: 'HTTP' });
    const end = (requestOrigin: string) => logoutRoute(new NextRequest(origin + '/api/saas/auth/logout', { method: 'POST', headers: { origin: requestOrigin, cookie } }));
    expect((await end('https://evil.example.invalid')).status).toBe(403);
    expect((await me()).status).toBe(200);
    expect((await end(origin)).status).toBe(200);
    expect((await me()).status).toBe(401);
  } finally {
    await admin.session.deleteMany({ where: { accountId: 'http-user' } });
    await admin.membership.deleteMany({ where: { accountId: 'http-user' } });
    await admin.account.delete({ where: { id: 'http-user' } });
    await admin.organization.delete({ where: { id: 'http-org' } });
    await admin.loginAttempt.deleteMany({});
    await admin.$disconnect();
  }
}, 30000);
