import assert from 'node:assert/strict';

const base = 'http://127.0.0.1:8401';
const origin = 'https://rec.example.invalid';
const organizationId = process.argv[2];
assert.ok(organizationId, 'CI organization ID required');
const api = '/api/saas';

async function request(path, { cookie, method = 'GET', body, status = 200, from = origin } = {}) {
  const response = await fetch(base + path, {
    method, redirect: 'manual', signal: AbortSignal.timeout(30000),
    headers: { ...(cookie ? { Cookie: cookie } : {}),
      ...(method !== 'GET' ? { Origin: from } : {}),
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  console.log(method, path, response.status);
  assert.equal(response.status, status, `${method} ${path}`);
  return response;
}
async function data(path, options) {
  return (await (await request(api + path, options)).json()).data;
}
async function login(email, org, role) {
  const response = await request(api + '/auth/login', { method: 'POST', body: {
    email, password: 'CI-only-recipe-password-2026', organizationId: org,
  } });
  const cookie = response.headers.get('set-cookie')?.match(/gl_session=[^;]+/)?.[0];
  assert.ok(cookie, 'Session cookie missing');
  const identity = await (await request(api + '/auth/me', { cookie })).json();
  assert.equal(identity.organizationId, org);
  assert.equal(identity.role, role);
  return cookie;
}
const admin = await login('ci-admin@example.invalid', organizationId, 'admin');
const other = await login('recipe-other@example.invalid', 'recipe-b', 'admin');
const client = await login('recipe-client@example.invalid', organizationId, 'client');
const driver = await login('recipe-driver@example.invalid', organizationId, 'ramasseur');
const viewer = await login('recipe-viewer@example.invalid', organizationId, 'viewer');
const post = (path, body, status = 201, cookie = admin) => data(path, { method: 'POST', body, status, cookie });
await request(api + '/customers', { status: 401 });
await request(api + '/customers', { cookie: admin, method: 'POST', body: { name: 'Rejected' }, from: 'https://wrong.invalid', status: 403 });
await post('/customers', { name: 'Rejected' }, 403, viewer);
await request(api + '/billing', { cookie: client, status: 403 });
const customer = await post('/customers', { name: 'Private customer' });
const shipment = await post('/shipments', { customerId: 'recipe-client-customer', origin: 'Conakry', destination: 'Kindia' });
await post('/shipments', { customerId: customer.id, origin: 'Conakry', destination: 'Mamou' });
const ship = '/shipments/' + shipment.id;
const parcel = await post(ship + '/parcels', { description: 'Box', weightGrams: 500, version: 0 });
const scan = '/parcels/scan?barcode=' + parcel.barcode;
assert.equal((await data(scan, { cookie: admin })).id, parcel.id);
await request(api + scan, { cookie: other, status: 404 });
await request(api + ship, { cookie: other, status: 404 });
await post(ship + '/parcels', { description: 'Stale', weightGrams: 10, version: 0 }, 409);
const confirmed = await data(ship, { cookie: admin, method: 'PATCH', body: { version: 1, status: 'confirmed' } });
const pickup = await post(ship + '/missions', { version: confirmed.version, assigneeId: 'recipe-driver', kind: 'pickup', address: 'Conakry' });
assert.ok((await data('/missions', { cookie: driver })).some(m => m.id === pickup.id));
await post('/missions/' + pickup.id + '/complete', { recipient: 'Sender' }, 200, driver);
await post('/missions/' + pickup.id + '/complete', { recipient: 'Sender' }, 200, driver);
const transit = await data(ship, { cookie: admin });
assert.equal(transit.status, 'in_transit');
const delivery = await post(ship + '/missions', { version: transit.version, assigneeId: 'recipe-driver', kind: 'delivery', address: 'Kindia' });
await post('/missions/' + delivery.id + '/complete', { recipient: 'Recipient', note: 'Received' }, 200, driver);
const delivered = await data(ship, { cookie: admin });
assert.equal(delivered.status, 'delivered');
assert.deepEqual(delivered.events.map(e => e.status), ['draft', 'confirmed', 'in_transit', 'delivered']);
const portal = await data('/portal/shipments', { cookie: client });
assert.deepEqual(portal.map(s => s.trackingNumber), [shipment.trackingNumber]);
assert.equal(portal[0].status, 'delivered');
assert.ok(portal[0].events.every(e => !('actorId' in e)));

await post('/commercial', { legalName: 'Recipe Logistics', address: 'Conakry', email: 'ci@example.invalid', phone: '', taxId: '' }, 200);
const quote = await post('/billing', { customerId: customer.id, lines: [{ description: 'Transport', quantity: 2, unitPrice: 100000, taxBps: 0 }] });
const bill = '/billing/' + quote.id;
const invoice = await post(bill + '/issue', { version: 0 }, 200);
assert.equal(invoice.total, 200000);
const intent = await post('/mobile-payments', { documentId: quote.id, reference: 'RECIPE-MM-1', provider: 'orange_money', amount: 100000 });
const payment = await post(bill + '/payments', { reference: 'RECIPE-PAY-1', amount: 100000, method: 'orange_money', version: 1 });
await post('/billing/payments/' + payment.id + '/reconcile', { statementReference: 'RECIPE-PROOF', amount: 100000 });
await post('/mobile-payments/' + intent.id, { action: 'match', paymentId: payment.id }, 200);
await post(bill + '/credits', { reference: 'RECIPE-AV-1', reason: 'Remise', amount: 100000, version: 2 });
await post(bill + '/payments', { reference: 'RECIPE-EXCESS', amount: 1, method: 'cash', version: 3 }, 409);
assert.deepEqual((await data('/billing', { cookie: admin })).totals, { invoiced: '200000', paid: '100000', credited: '100000', outstanding: '0' });
assert.deepEqual((await data('/billing', { cookie: other })).totals, { invoiced: '0', paid: '0', credited: '0', outstanding: '0' });
const pdf = await request(api + bill + '/pdf', { cookie: admin });
assert.match(pdf.headers.get('content-type'), /^application\/pdf/);
assert.equal(Buffer.from(await pdf.arrayBuffer()).subarray(0, 5).toString(), '%PDF-');
await request(api + bill + '/pdf', { cookie: other, status: 404 });
const csv = await request(api + '/billing/export', { cookie: admin });
assert.ok((await csv.text()).includes(invoice.invoiceNumber));
for (const path of ['/saas', '/saas/logistics', '/saas/billing', '/saas/billing/journal', '/saas/billing/mobile', '/saas/commercial']) {
  await request(path, { cookie: admin });
}
await request('/saas/missions', { cookie: driver });
await request('/saas/portal', { cookie: client });
await request(api + '/auth/logout', { cookie: admin, method: 'POST' });
await request(api + '/auth/me', { cookie: admin, status: 401 });
console.log('HTTP recipe passed: logistics, finance, access control and session revocation.');
