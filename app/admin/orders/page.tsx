import { supabaseAdmin } from '@/lib/supabase-admin'
import { formatDateTime } from '@/lib/date'

type AssessmentOrder = {
  id: string
  company_name: string
  domain: string
  email: string
  notes: string | null
  status: string
  stripe_session_id: string | null
  stripe_payment_status: string | null
  paid_at: string | null
  created_at: string
}

function StatusBadge({ value }: { value: string | null }) {
  const normalized = (value ?? 'unknown').toLowerCase()

  const cls =
    normalized === 'paid'
      ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
      : normalized === 'pending_payment' || normalized === 'pending'
        ? 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100'
        : normalized === 'expired'
          ? 'border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200'
          : 'border-white/10 bg-white/[0.03] text-slate-300'

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium uppercase ${cls}`}>
      {value ?? 'unknown'}
    </span>
  )
}

export default async function AdminOrdersPage() {
  const { data, error } = await supabaseAdmin
    .from('assessment_orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Orders read failed: ${error.message}`)
  }

  const orders = (data ?? []) as AssessmentOrder[]

  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
            Admin
          </div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            Assessment orders
          </h1>
          <p className="mt-3 text-slate-400">
            Overview of submitted purchase requests and payment status.
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
          {orders.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-slate-400">
              No orders yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.16em] text-slate-500">
                    <th className="px-4 py-2">Company</th>
                    <th className="px-4 py-2">Domain</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Order status</th>
                    <th className="px-4 py-2">Payment</th>
                    <th className="px-4 py-2">Created</th>
                    <th className="px-4 py-2">Paid</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="rounded-2xl border border-white/10 bg-[#071022]"
                    >
                      <td className="rounded-l-2xl px-4 py-4 align-top">
                        <div className="font-medium text-white">
                          {order.company_name}
                        </div>
                        {order.notes ? (
                          <div className="mt-2 max-w-xs text-sm text-slate-400">
                            {order.notes}
                          </div>
                        ) : null}
                      </td>

                      <td className="px-4 py-4 align-top text-slate-200">
                        {order.domain}
                      </td>

                      <td className="px-4 py-4 align-top text-slate-200">
                        {order.email}
                      </td>

                      <td className="px-4 py-4 align-top">
                        <StatusBadge value={order.status} />
                      </td>

                      <td className="px-4 py-4 align-top">
                        <StatusBadge value={order.stripe_payment_status} />
                      </td>

                      <td className="px-4 py-4 align-top text-sm text-slate-300">
                        {formatDateTime(order.created_at)}
                      </td>

                      <td className="rounded-r-2xl px-4 py-4 align-top text-sm text-slate-300">
                        {order.paid_at ? formatDateTime(order.paid_at) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}