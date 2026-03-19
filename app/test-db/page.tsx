import { createSupabaseServerClient } from '@/lib/supabase-server'


export default async function TestDbPage() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from('organizations').select('*').order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <h1 className="mb-6 text-3xl font-semibold">Supabase test</h1>

      {error ? (
        <pre className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          {JSON.stringify(error, null, 2)}
        </pre>
      ) : (
        <pre className="rounded-xl border border-white/10 bg-white/5 p-4">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </main>
  )
}