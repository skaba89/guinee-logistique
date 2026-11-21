import { NextResponse } from 'next/server';

// Liveness only: does not certify database readiness or production security.
export function GET() {
  return NextResponse.json({ status: 'ok', service: 'guinee-logistique' }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
