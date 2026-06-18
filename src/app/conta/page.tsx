import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/store/profile-form'

export default async function AccountPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <div>
      <h2 className="text-lg font-semibold mb-6">O meu Perfil</h2>
      <ProfileForm profile={profile} />
    </div>
  )
}
