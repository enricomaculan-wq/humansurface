import AuthForm from './auth-form'

<div className="mt-6 text-sm text-slate-400">
  Don’t have an account?{' '}
  <a href="/signup" className="text-cyan-200 underline underline-offset-4">
    Create one
  </a>
</div>

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-xl rounded-[32px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
        <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
          Client access
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Login</h1>
        <p className="mt-4 text-slate-400">
          Access your HumanSurface account and view your assessment status.
        </p>
        <div className="mt-8">
          <AuthForm mode="login" />
        </div>
      </div>
    </main>
  )
}