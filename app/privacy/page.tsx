export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
        <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
          Legal
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Privacy Policy
        </h1>

        <div className="mt-8 space-y-8 text-slate-300">
          <section>
            <h2 className="text-xl font-semibold text-white">1. Data controller</h2>
            <p className="mt-3 leading-7">
              HumanSurface processes personal data in connection with assessment requests,
              billing completion, customer support, and service delivery.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">2. Data we collect</h2>
            <p className="mt-3 leading-7">
              We may collect contact details, company details, billing information,
              payment-related metadata, and information submitted through forms on this website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">3. Purpose of processing</h2>
            <p className="mt-3 leading-7">
              We process data to provide the HumanSurface service, manage billing and invoicing,
              communicate with customers, improve the service, and comply with legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">4. Third-party providers</h2>
            <p className="mt-3 leading-7">
              Payments may be processed by Stripe. Hosting, infrastructure, database,
              and technical delivery may involve external service providers acting as processors.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">5. Data retention</h2>
            <p className="mt-3 leading-7">
              Personal data is retained only for as long as necessary to provide the service,
              manage accounting and legal obligations, and maintain service records.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">6. User rights</h2>
            <p className="mt-3 leading-7">
              Where applicable, users may request access, correction, deletion, restriction,
              portability, or objection regarding their personal data, subject to applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">7. Contact</h2>
            <p className="mt-3 leading-7">
              For privacy-related requests, contact:
              <br />
              <a
                href="mailto:info@humansurface.com"
                className="text-cyan-200 underline underline-offset-4"
              >
                info@humansurface.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}