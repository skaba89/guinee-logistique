import { NextRequest } from 'next/server';
import { z } from 'zod';
import { login, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/saas-auth';
import { authEnabled, allowedOrigin, json } from '@/lib/saas-auth-http';
import { observeSaas } from '@/lib/saas-observability';

const input = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(128), organizationId: z.string().min(1).max(128) }).strict();

export async function POST(request: NextRequest) {
  return observeSaas(request, async () => {
  if (!authEnabled()) return json({ error: 'Unavailable' }, 503);
  if (!allowedOrigin(request)) return json({ error: 'Forbidden' }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'Invalid request' }, 415);
  try {
    const body = await request.text();
    if (body.length > 2048) return json({ error: 'Invalid request' }, 413);
    const parsed = input.safeParse(JSON.parse(body));
    if (!parsed.success) return json({ error: 'Invalid request' }, 400);
    const { email, password, organizationId } = parsed.data;
    const result = await login(email, password, organizationId);
    if (result.status === 'limited') return json({ error: 'Try again later' }, 429);
    if (result.status !== 'ok') return json({ error: 'Invalid credentials' }, 401);
    const response = json({ ok: true });
    response.cookies.set(SESSION_COOKIE, result.token, { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: SESSION_MAX_AGE });
    return response;
  } catch (error) {
    return json({ error: error instanceof SyntaxError ? 'Invalid request' : 'Unavailable' }, error instanceof SyntaxError ? 400 : 503);
  }
  });
}
