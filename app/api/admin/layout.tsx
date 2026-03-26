import { redirect } from 'next/navigation'
import { requireAdminUser } from '@/lib/auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
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

  return <>{children}</>
}