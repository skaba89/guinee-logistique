import { notFound } from 'next/navigation';
import { saasRequested } from '@/lib/saas-auth-http';

export const dynamic = 'force-dynamic';

export default function SaaSLayout({ children }: { children: React.ReactNode }) {
  if (!saasRequested()) notFound();
  return <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white p-6 sm:p-10">
    <div className="mx-auto max-w-4xl">
      <header className="mb-10 border-b border-slate-200 dark:border-slate-800 pb-5">
        <p className="text-xl font-bold text-teal-600">Guinée Logistique</p>
        <p className="text-sm text-slate-500">Espace professionnel sécurisé</p>
      </header>
      {children}
    </div>
  </main>;
}
