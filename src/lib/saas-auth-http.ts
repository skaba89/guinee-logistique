import { NextRequest, NextResponse } from 'next/server';

export function saasRequested() {
  return process.env.SAAS_AUTH_ENABLED === 'true';
}

export function authEnabled() {
  return saasRequested() && !!process.env.SAAS_AUTH_DATABASE_URL && !!process.env.SAAS_PUBLIC_ORIGIN;
}

export function json(body: object, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export function allowedOrigin(request: NextRequest) {
  return request.headers.get('origin') === process.env.SAAS_PUBLIC_ORIGIN;
}
