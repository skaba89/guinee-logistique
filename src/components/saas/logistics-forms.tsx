'use client';
import { useState, type FormEvent } from 'react';

const field = 'rounded border bg-transparent p-2 w-full';
export default function LogisticsForms({customers}: {customers:{id:string;name:string}[]}) {
  const [error,setError] = useState('');
  const [pending,setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>, kind: 'customers'|'shipments') {
    event.preventDefault();
    if (pending) return;
    setPending(true);setError('');
    const raw = Object.fromEntries(new FormData(event.currentTarget));
    const body = Object.fromEntries(Object.entries(raw).filter(([,value]) => value !== ''));
    try {
      const response = await fetch('/api/saas/'+kind,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      if (!response.ok) {const result = await response.json();throw new Error(result.error ?? 'Erreur');}
      window.location.reload();
    } catch (error) {setError(error instanceof Error ? error.message : 'Erreur réseau');}
    finally {setPending(false);}
  }
  return <div className="grid gap-4 sm:grid-cols-2">
    <form method="post" onSubmit={e=>submit(e,'customers')} className="rounded border p-4 space-y-3">
      <h2 className="font-semibold">Nouveau client</h2>
      <label className="block">Nom<input className={field} name="name" required maxLength={150}/></label>
      <label className="block">E-mail<input className={field} name="email" type="email" maxLength={254}/></label>
      <label className="block">Téléphone<input className={field} name="phone" type="tel" maxLength={40}/></label>
      <button disabled={pending} className="rounded bg-teal-700 text-white p-2">Créer le client</button>
    </form>
    <form method="post" onSubmit={e=>submit(e,'shipments')} className="rounded border p-4 space-y-3">
      <h2 className="font-semibold">Nouvelle expédition</h2>
      <label className="block">Client<select className={field} name="customerId" required defaultValue=""><option value="" disabled>Choisir un client</option>{customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label className="block">Origine<input className={field} name="origin" required maxLength={200}/></label>
      <label className="block">Destination<input className={field} name="destination" required maxLength={200}/></label>
      <button disabled={pending || !customers.length} className="rounded bg-teal-700 text-white p-2">Créer l’expédition</button>
    </form>
    {error && <p role="alert" className="text-red-600">{error}</p>}
  </div>;
}
