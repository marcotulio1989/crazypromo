import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminSidebar from './components/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar user={session.user} />
      <main className="flex-1 p-8 ml-64">
        {children}
      </main>
    </div>
  )
}
