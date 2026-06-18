import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminMobileBar } from '@/components/admin/mobile-bar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const { data: isAdmin } = await supabase.rpc('is_admin')

  if (!isAdmin) redirect('/')

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <AdminMobileBar />
      <main className="flex-1 bg-muted/30 p-6 lg:p-8 pt-20 lg:pt-8">{children}</main>
    </div>
  )
}
