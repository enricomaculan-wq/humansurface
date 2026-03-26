import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { requireAdminUser } from '@/lib/auth'

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  try {
    await requireAdminUser()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'

    if (message === 'Unauthorized') {
      redirect('/login')
    }

    redirect('/client')
  }

  return (
    <main className="min-h-screen bg-[#040816] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">{children}</div>
    </main>
  )
}