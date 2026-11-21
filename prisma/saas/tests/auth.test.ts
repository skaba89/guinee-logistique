import { test, expect } from 'bun:test';
import { PrismaClient } from '../../../generated/saas';
import { hashPassword, verifyPassword, login, sessionIdentity, logout, hasRole } from '../../../src/lib/saas-auth';

test('restricted auth role: credentials, tenant membership, expiry, revocation and throttling', async () => {
  const admin = new PrismaClient({ datasourceUrl: process.env.SAAS_DATABASE_URL! });
  const password = 'CI-test-only-strong-password';
  const hash = await hashPassword(password);
  expect(await verifyPassword(password, hash)).toBe(true);
  expect(await verifyPassword('wrong', hash)).toBe(false);
  await admin.organization.createMany({ data: [{ id: 'auth-a', name: 'A', slug: 'auth-a' }, { id: 'auth-b', name: 'B', slug: 'auth-b' }] });
  await admin.account.create({ data: { id: 'auth-u', email: 'auth@example.invalid', displayName: 'Test', passwordHash: hash } });
  await admin.membership.create({ data: { organizationId: 'auth-a', accountId: 'auth-u', role: 'admin' } });
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
    await admin.session.deleteMany({ where: { accountId: 'auth-u' } });
    await admin.membership.deleteMany({ where: { accountId: 'auth-u' } });
    await admin.account.delete({ where: { id: 'auth-u' } });
    await admin.organization.deleteMany({ where: { id: { in: ['auth-a', 'auth-b'] } } });
    await admin.loginAttempt.deleteMany({});
    await admin.$disconnect();
  }
}, 30000);
