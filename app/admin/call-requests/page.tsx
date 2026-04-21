import AdminTopbar from '@/app/components/admin/admin-topbar'
import { createSupabaseServerClient } from '@/lib/supabase-server'

type CallRequest = {
  id: string
  full_name: string
  company_name: string
  domain: string
  email: string
  role: string | null
  company_size: string | null
  notes: string | null
  status: string
  created_at: string
}

function StatusBadge({ value }: { value: string }) {
  const normalized = (value || '').toLowerCase()

  const cls =
    normalized === 'new'
      ? 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100'
      : normalized === 'contacted'
        ? 'border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200'
        : normalized === 'qualified'
          ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
          : 'border-white/10 bg-white/[0.03] text-slate-300'

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium uppercase ${cls}`}>
      {value}
    </span>
  )
}

function formatDate(value: string) {
  return new Date(value).toLocaleString()
}

export default async function AdminCallRequestsPage() {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('call_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Call requests read failed: ${error.message}`)
  }

  const callRequests = (data ?? []) as CallRequest[]

  return (
    <>
      <AdminTopbar
        title="Call requests"
        subtitle="Review inbound intro-call requests from the website."
      />

      <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
        <div className="mb-5 text-sm uppercase tracking-[0.16em] text-slate-500">
          All requests
        </div>

        <div className="space-y-4">
          {callRequests.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-400">
              No call requests yet.
            </div>
          ) : (
            callRequests.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-[#030815] p-5"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-xl font-semibold text-white">
                        {item.company_name}
                      </div>
                      <StatusBadge value={item.status} />
                    </div>

                    <div className="mt-2 text-sm text-slate-400">{item.domain}</div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          Contact
                        </div>
                        <div className="mt-2 text-sm text-white">
                          {item.full_name}
                        </div>
                        <div className="mt-1 text-sm text-slate-400">{item.email}</div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          Company context
                        </div>
                        <div className="mt-2 text-sm text-white">
                          Role: {item.role || '—'}
                        </div>
                        <div className="mt-1 text-sm text-slate-400">
                          Company size: {item.company_size || '—'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                        Notes
                      </div>
                      <div className="mt-2 text-sm leading-7 text-slate-300">
                        {item.notes || 'No notes provided.'}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-400">
                    {formatDate(item.created_at)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  )
}