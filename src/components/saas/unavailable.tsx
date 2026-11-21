export default function Unavailable() {
  return <section role="alert" className="rounded-xl border p-6">
    <h1 className="text-xl font-semibold">Service temporairement indisponible</h1>
    <p className="mt-2">Veuillez réessayer ultérieurement ou contacter votre administrateur.</p>
  </section>;
}
