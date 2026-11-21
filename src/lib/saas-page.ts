import { cookies } from 'next/headers';
import { sessionIdentity, SESSION_COOKIE } from '@/lib/saas-auth';
import { authEnabled } from '@/lib/saas-auth-http';

export async function pageSession() {
  if (!authEnabled()) return { status: 'unavailable' } as const;
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    const identity = await sessionIdentity(token);
    return identity ? { status: 'authenticated', identity, token } as const : { status: 'anonymous' } as const;
  } catch {
    return { status: 'unavailable' } as const;
  }
}
