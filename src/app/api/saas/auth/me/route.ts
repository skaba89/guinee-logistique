import { NextRequest } from 'next/server';
import { sessionIdentity, SESSION_COOKIE } from '@/lib/saas-auth';
import { authEnabled, json } from '@/lib/saas-auth-http';
import { observeSaas } from '@/lib/saas-observability';

export async function GET(request: NextRequest) {
  return observeSaas(request, async () => {
  if (!authEnabled()) return json({ error: 'Unavailable' }, 503);
  try {
    const identity = await sessionIdentity(request.cookies.get(SESSION_COOKIE)?.value);
    return identity ? json(identity) : json({ error: 'Unauthorized' }, 401);
  } catch {
    return json({ error: 'Unavailable' }, 503);
  }
  });
}
