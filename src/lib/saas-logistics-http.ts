import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { authEnabled, allowedOrigin, json } from './saas-auth-http';
import { sessionIdentity, SESSION_COOKIE, type Identity } from './saas-auth';
import { LogisticsError } from './saas-logistics';

export async function logisticsRequest(request: NextRequest, write: boolean, action: (identity: Identity, body: unknown) => Promise<unknown>, status = 200) {
  if (!authEnabled()) return json({error:'Service indisponible'},503);
  if (write && !allowedOrigin(request)) return json({error:'Accès refusé'},403);
  try {
    const identity = await sessionIdentity(request.cookies.get(SESSION_COOKIE)?.value);
    if (!identity) return json({error:'Non authentifié'},401);
    let body: unknown;
    if (write) {
      if (!request.headers.get('content-type')?.startsWith('application/json')) return json({error:'Format invalide'},415);
      const raw = await request.text();
      if (raw.length > 8192) return json({error:'Requête trop volumineuse'},413);
      body = JSON.parse(raw);
    }
    const result = await action(identity, body);
    if (result instanceof Response) return result;
    return json({data:result},status);
  } catch (error) {
    if (error instanceof LogisticsError) return json({error:error.message},error.status);
    if (error instanceof ZodError || error instanceof SyntaxError) return json({error:'Données invalides'},400);
    return json({error:'Service indisponible'},503);
  }
}
