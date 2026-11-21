'use client';

import { useState } from 'react';
import {OUTBOX_KEY,clearOutbox} from '@/lib/mission-outbox';

export default function LogoutButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  async function signOut() {
    if (pending) return;
    try{if(sessionStorage.getItem(OUTBOX_KEY)&&!window.confirm('Des confirmations locales peuvent être en attente. La déconnexion les effacera. Continuer ?'))return;}catch{}
    setPending(true);
    setError(false);
    try {
      const response = await fetch('/api/saas/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Logout failed');
      try{clearOutbox(sessionStorage);}catch{}
      window.location.replace('/saas/login');
    } catch { setError(true); }
    finally { setPending(false); }
  }
  return <div><button type="button" onClick={signOut} disabled={pending} className="rounded-md border px-4 py-2 disabled:opacity-50">{pending ? 'Déconnexion…' : 'Se déconnecter'}</button>
    {error && <p role="alert" className="text-sm text-red-600">Déconnexion non confirmée. Réessayez.</p>}</div>;
}
