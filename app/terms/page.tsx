export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
        <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
          Legal
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Terms of Service
        </h1>

        <div className="mt-8 space-y-8 text-slate-300">
          <section>
            <h2 className="text-xl font-semibold text-white">1. Service</h2>
            <p className="mt-3 leading-7">
              HumanSurface provides exposure assessment services focused on public company
              visibility, people and role exposure, phishing and fraud scenarios, and related reporting.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">2. Nature of the output</h2>
            <p className="mt-3 leading-7">
              The service supports awareness, risk visibility, and prioritization.
              It does not guarantee the absence of security issues, fraud attempts, or malicious activity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">3. Delivery timing</h2>
            <p className="mt-3 leading-7">
              Unless otherwise agreed, the assessment is generally made available within
              2 business days after payment and completion of required billing information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">4. Customer responsibilities</h2>
            <p className="mt-3 leading-7">
              The customer is responsible for providing accurate company, domain,
              and billing information and for ensuring that the requested assessment is lawful and authorized.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">5. Payments and invoicing</h2>
            <p className="mt-3 leading-7">
              Payments are collected in advance. Billing details may be requested after payment
              and before invoice issuance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">6. Refunds</h2>
            <p className="mt-3 leading-7">
              Refund requests, if any, are evaluated case by case, especially where service delivery
              has already started or assessment work has already been performed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">7. Limitation of liability</h2>
            <p className="mt-3 leading-7">
              To the maximum extent permitted by law, HumanSurface is not liable for indirect,
              incidental, or consequential damages arising from use of the service or reliance on assessment outputs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">8. Contact</h2>
            <p className="mt-3 leading-7">
              For support or legal inquiries:
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