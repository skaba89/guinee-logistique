'use client';

import { useState, type FormEvent } from 'react';

const fieldClass = 'w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2';

export default function LoginForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/saas/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: String(form.get('email')).trim(), password: form.get('password'), organizationId: String(form.get('organizationId')).trim() }),
      });
      if (response.ok) { window.location.replace('/saas'); return; }
      setError(response.status === 429 ? 'Trop de tentatives. Réessayez dans 15 minutes.' : response.status === 401 ? 'Identifiants ou organisation incorrects.' : response.status === 400 ? 'Vérifiez les informations saisies.' : 'Connexion indisponible. Réessayez plus tard.');
    } catch {
      setError('Connexion indisponible. Vérifiez votre réseau.');
    } finally { setPending(false); }
  }

  return <section className="mx-auto max-w-md rounded-xl border bg-white dark:bg-slate-900 p-6 shadow-sm">
    <h1 className="text-2xl font-bold mb-2">Connexion</h1>
    <p className="text-sm mb-6 text-slate-500">Utilisez les identifiants transmis par votre organisation.</p>
    <form onSubmit={submit} className="space-y-4" method="post" action="/api/saas/auth/login">
      <label className="block space-y-1"><span>Identifiant de l’organisation</span><input className={fieldClass} name="organizationId" required maxLength={128} /></label>
      <label className="block space-y-1"><span>Adresse e-mail</span><input className={fieldClass} name="email" type="email" autoComplete="username" required maxLength={254} /></label>
      <label className="block space-y-1"><span>Mot de passe</span><input className={fieldClass} name="password" type="password" autoComplete="current-password" required maxLength={128} /></label>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={pending} className="w-full rounded-md bg-teal-700 px-4 py-2 font-semibold text-white disabled:opacity-50">{pending ? 'Connexion…' : 'Se connecter'}</button>
    </form>
  </section>;
}
