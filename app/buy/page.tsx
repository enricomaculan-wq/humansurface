import Link from 'next/link'
import BuyForm from './buy-form'

export default function BuyPage() {
  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.08]"
          >
            Back
          </Link>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
          <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
            HumanSurface
          </div>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Acquista assessment
          </h1>

          <p className="mt-4 text-slate-400">
            Inserisci i dati della tua azienda prima del pagamento. Dopo la
            compilazione verrai reindirizzato a Stripe per completare l’acquisto.
          </p>

          <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] p-5">
            <div className="text-sm uppercase tracking-[0.16em] text-cyan-200">
              Offerta lancio
            </div>
            <div className="mt-2 text-4xl font-semibold text-white">€190 + IVA</div>
            <div className="mt-2 text-sm text-slate-300">
              Include website scan, external exposure analysis, people/roles
              exposure, combined score e report executive.
            </div>
          </div>

          <div className="mt-8">
            <BuyForm />
          </div>
        </div>
      </div>
    </main>
  )
}