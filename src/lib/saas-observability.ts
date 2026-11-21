import {randomUUID} from 'node:crypto';

// Only fixed route templates are logged; never raw URLs, query parameters,
// headers, identities, request bodies or exception messages.
const routes = [
  '/auth/login', '/auth/logout', '/auth/me', '/customers', '/shipments',
  '/shipments/:id', '/shipments/:id/parcels', '/shipments/:id/missions',
  '/parcels/scan', '/missions', '/missions/:id/complete', '/missions/:id/cancel',
  '/portal/shipments', '/activity', '/commercial', '/billing', '/billing/export',
  '/billing/:id/issue', '/billing/:id/payments', '/billing/:id/credits',
  '/billing/:id/pdf', '/billing/payments/:id/reconcile', '/mobile-payments',
  '/mobile-payments/:id',
].map(route => ({route, pattern: new RegExp('^/api/saas' + route.replace(/:id/g, '[^/]+') + '$')}));

export async function observeSaas(request: Request, action: () => Promise<Response>): Promise<Response> {
  const requestId = randomUUID();
  const start = performance.now();
  const route = routes.find(item => item.pattern.test(new URL(request.url).pathname))?.route ?? 'unknown';
  let status = 500;
  try {
    const response = await action();
    status = response.status;
    response.headers.set('X-Request-ID', requestId);
    return response;
  } finally {
    console.log(JSON.stringify({
      event: 'saas_http', timestamp: new Date().toISOString(),
      level: status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info',
      requestId, route, method: ['GET','POST','PATCH','DELETE','PUT','HEAD','OPTIONS'].includes(request.method) ? request.method : 'OTHER',
      status, durationMs: Math.round(performance.now() - start),
    }));
  }
}
