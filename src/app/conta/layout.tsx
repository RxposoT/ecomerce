import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AccountNav } from '@/components/store/account-nav'

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold text-primary">
          {profile?.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
        </div>
        <div>
          <h1 className="text-xl font-bold">{profile?.full_name || 'Utilizador'}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <AccountNav />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
