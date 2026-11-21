import assert from 'node:assert/strict';

// Bounded, read-only workload on the disposable CI recipe only.
assert.equal(process.env.CI, 'true', 'This workload requires disposable CI');
const base = 'http://127.0.0.1:8401';
const org = process.argv[2];
assert.ok(org);
async function login(email, organizationId) {
  const res = await fetch(base + '/api/saas/auth/login', {
    method: 'POST', headers: {Origin: 'https://rec.example.invalid', 'Content-Type': 'application/json'},
    body: JSON.stringify({email, organizationId, password: 'CI-only-recipe-password-2026'}),
    signal: AbortSignal.timeout(15000),
  });
  assert.equal(res.status, 200);
  const cookie = res.headers.get('set-cookie')?.match(/gl_session=[^;]+/)?.[0];
  assert.ok(cookie);
  return cookie;
}
const [admin, other, client, driver] = await Promise.all([
  login('ci-admin@example.invalid', org), login('recipe-other@example.invalid', 'recipe-b'),
  login('recipe-client@example.invalid', org), login('recipe-driver@example.invalid', org),
]);
const cases = [
  ['/shipments', admin, d => d.length === 2],
  ['/shipments', other, d => d.length === 0],
  ['/portal/shipments', client, d => d.length === 1 && d[0].status === 'delivered'],
  ['/missions', driver, d => d.length === 2 && d.every(m => m.status === 'completed')],
  ['/billing', admin, d => d.totals.outstanding === '0' && d.totals.invoiced === '200000'],
  ['/billing', other, d => d.totals.invoiced === '0'],
];
const results = [];
const ids = new Set();
async function probe(index) {
  const [path, cookie, verify] = cases[index % cases.length];
  const start = performance.now();
  const res = await fetch(base + '/api/saas' + path, {
    headers: {Cookie: cookie}, redirect: 'manual', signal: AbortSignal.timeout(15000),
  });
  assert.equal(res.status, 200, path);
  const id = res.headers.get('x-request-id');
  assert.ok(id && !ids.has(id), 'Missing or repeated request ID');
  ids.add(id);
  assert.ok(verify((await res.json()).data), 'Unexpected data or tenant isolation failure: ' + path);
  results.push(performance.now() - start);
}
// Warm all routes before measurement.
for (let i = 0; i < cases.length; i++) await probe(i);
results.length = 0;
let next = 0;
const start = performance.now();
await Promise.all(Array.from({length: 8}, async () => {
  while (next < 120) await probe(next++);
}));
const duration = performance.now() - start;
results.sort((a, b) => a - b);
const percentile = p => Math.round(results[Math.ceil(results.length * p) - 1]);
const report = {requests: results.length, concurrency: 8, failures: 0,
  p50Ms: percentile(.5), p95Ms: percentile(.95), maxMs: percentile(1),
  requestsPerSecond: Math.round(results.length / (duration / 1000) * 10) / 10};
console.log(JSON.stringify(report));
assert.equal(report.requests, 120);
// Generous regression guard, not a production capacity/SLA claim.
assert.ok(report.p95Ms < 5000 && report.maxMs < 15000, 'CI latency regression');
