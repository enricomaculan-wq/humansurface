import AuthForm from '../login/auth-form'

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-xl rounded-[32px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
        <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
          Client access
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Create account</h1>
        <p className="mt-4 text-slate-400">
          Create your HumanSurface account to access assessment status and reports.
        </p>
        <div className="mt-8">
          <AuthForm mode="signup" />
        </div>
      </div>
    </main>
  )
}