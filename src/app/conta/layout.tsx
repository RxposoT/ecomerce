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

  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const p = profile as any
  const initials = (p?.full_name || user.email || '?').charAt(0).toUpperCase()
  const name = p?.full_name || 'Utilizador'

  return (
    <div className="max-w-[90rem] mx-auto px-6 py-10">
      <div className="flex items-center gap-4 mb-10">
        <div className="size-14 rounded-2xl bg-primary/5 flex items-center justify-center text-2xl font-bold text-primary border border-primary/10">
          {initials}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <AccountNav />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
