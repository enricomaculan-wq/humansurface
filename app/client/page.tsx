import { redirect } from 'next/navigation'
import { createSupabaseAuthServerClient } from '@/lib/supabase-auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { formatDateTime } from '@/lib/date'
import LogoutButton from './logout-button'

export default async function ClientPage() {
  const supabase = await createSupabaseAuthServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    redirect('/login')
  }

  const { data: orders, error } = await supabaseAdmin
    .from('assessment_orders')
    .select('id, company_name, domain, status, billing_status, assessment_id, created_at')
    .eq('email', user.email)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Orders read failed: ${error.message}`)
  }

  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
              Client area
            </div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Your assessments
            </h1>
            <p className="mt-3 text-slate-400">{user.email}</p>
          </div>
          <LogoutButton />
        </div>

        <div className="space-y-4">
          {(orders ?? []).length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-slate-400">
              No assessments found for this account.
            </div>
          ) : (
            orders?.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-xl font-semibold text-white">{order.company_name}</div>
                    <div className="mt-1 text-slate-400">{order.domain}</div>
                    <div className="mt-2 text-sm text-slate-500">
                      Created: {formatDateTime(order.created_at)}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {order.assessment_id ? (
                      <a
                        href={`/assessment/status/${order.assessment_id}`}
                        className="rounded-2xl border border-cyan-300/30 bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950"
                      >
                        View status
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}