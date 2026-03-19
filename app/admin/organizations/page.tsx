import Link from 'next/link'
import AdminTopbar from '@/app/components/admin/admin-topbar'
import { createSupabaseServerClient } from '@/lib/supabase-server'

type Organization = {
  id: string
  name: string
  domain: string
  industry: string | null
  created_at: string
}

export default async function OrganizationsPage() {
  const supabase = await createSupabaseServerClient()

  const { data } = await supabase
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: false })

  const organizations = (data ?? []) as Organization[]

  return (
    <>
      <AdminTopbar
        title="Organizations"
        subtitle="Manage organizations and launch public scans."
        primaryAction={{
          label: 'New organization',
          href: '/admin/organizations/new',
        }}
      />

      <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
        <div className="mb-5 text-sm uppercase tracking-[0.16em] text-slate-500">
          All organizations
        </div>

        <div className="space-y-3">
          {organizations.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-400">
              No organizations yet.
            </div>
          ) : (
            organizations.map((organization) => (
              <Link
                key={organization.id}
                href={`/admin/organizations/${organization.id}`}
                className="block rounded-2xl border border-white/10 bg-[#030815] p-5 transition hover:border-cyan-300/20"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="font-medium text-white">{organization.name}</div>
                    <div className="mt-1 text-sm text-slate-400">
                      {organization.domain}
                      {organization.industry ? ` · ${organization.industry}` : ''}
                    </div>
                  </div>

                  <div className="text-sm text-slate-500">
                    {new Date(organization.created_at).toLocaleString()}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </>
  )
}