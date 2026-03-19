import Link from 'next/link'
import AdminTopbar from '@/app/components/admin/admin-topbar'
import { createSupabaseServerClient } from '@/lib/supabase-server'

type Person = {
  id: string
  organization_id: string
  full_name: string | null
  role_title: string
  department: string | null
  email: string | null
  is_key_person: boolean
}

type Organization = {
  id: string
  name: string
  domain: string
}

export default async function PeoplePage() {
  const supabase = await createSupabaseServerClient()

  const [{ data: peopleData }, { data: organizationsData }] = await Promise.all([
    supabase.from('people').select('*'),
    supabase.from('organizations').select('id, name, domain'),
  ])

  const people = (peopleData ?? []) as Person[]
  const organizations = (organizationsData ?? []) as Organization[]

  return (
    <>
      <AdminTopbar
        title="People"
        subtitle="Review publicly visible people, roles, and attributed contact data."
        primaryAction={{
          label: 'New person',
          href: '/admin/people/new',
        }}
      />

      <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
        <div className="mb-5 text-sm uppercase tracking-[0.16em] text-slate-500">
          All people / roles
        </div>

        <div className="space-y-3">
          {people.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-400">
              No people yet.
            </div>
          ) : (
            people.map((person) => {
              const organization = organizations.find((org) => org.id === person.organization_id)

              return (
                <Link
                  key={person.id}
                  href={`/admin/people/${person.id}`}
                  className="block rounded-2xl border border-white/10 bg-[#030815] p-5 transition hover:border-cyan-300/20"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="font-medium text-white">
                        {person.full_name || person.role_title}
                      </div>
                      <div className="mt-1 text-sm text-slate-400">
                        {person.role_title}
                        {person.department ? ` · ${person.department}` : ''}
                      </div>
                      <div className="mt-2 text-sm text-slate-500">
                        {organization?.name || 'Unknown organization'}
                        {organization?.domain ? ` · ${organization.domain}` : ''}
                      </div>
                      {person.email ? (
                        <div className="mt-1 text-sm text-slate-500">{person.email}</div>
                      ) : null}
                    </div>

                    {person.is_key_person ? (
                      <div className="rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1 text-xs font-medium uppercase text-fuchsia-200">
                        Key person
                      </div>
                    ) : null}
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </section>
    </>
  )
}