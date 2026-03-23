'use client'

import { useRouter } from 'next/navigation'
import { createSupabaseAuthBrowserClient } from '@/lib/supabase-auth-browser'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createSupabaseAuthBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white"
    >
      Logout
    </button>
  )
}