import { NextRequest } from 'next/server';
import { logout, SESSION_COOKIE } from '@/lib/saas-auth';
import { authEnabled, allowedOrigin, json } from '@/lib/saas-auth-http';

export async function POST(request: NextRequest) {
  if (!authEnabled()) return json({ error: 'Unavailable' }, 503);
  if (!allowedOrigin(request)) return json({ error: 'Forbidden' }, 403);
  try {
    await logout(request.cookies.get(SESSION_COOKIE)?.value);
    const response = json({ ok: true });
    response.cookies.set(SESSION_COOKIE, '', { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 0 });
    return response;
  } catch {
    return json({ error: 'Unavailable' }, 503);
  }
}
